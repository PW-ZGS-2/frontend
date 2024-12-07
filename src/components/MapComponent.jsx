// TelescopeMapComponent.js
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Card, Drawer, Button, Space, Descriptions } from 'antd';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styled from 'styled-components';
import { TelescopeApi } from "../datasource/BackendClient";

const MarkerLabel = styled.div`
    background-color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    white-space: nowrap;
    position: absolute;
    z-index: 1000;
    transform: translate(-50%, -150%);
`;

const TelescopeMapComponent = () => {
    const [telescopes, setTelescopes] = useState([]);
    const [selectedTelescope, setSelectedTelescope] = useState(null);
    const [telescopeDetails, setTelescopeDetails] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const markerRefs = useRef({});
    const navigate = useNavigate();
    const telescopeApi = new TelescopeApi('http://localhost:8000');

    useEffect(() => {
        loadTelescopes();
    }, []);

    const loadTelescopes = () => {
        telescopeApi.getTelescopesList(
            (response) => {
                setTelescopes(response.telescopes);
            },
            (error) => {
                console.error('Failed to load telescopes:', error);
            }
        );
    };

    const createPinIcon = (color) => {
        return L.divIcon({
            className: 'custom-pin-icon',
            html: `
        <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 48 16 48C16 48 32 28 32 16C32 7.16344 24.8366 0 16 0Z" 
          fill="${color}"/>
        </svg>
      `,
            iconSize: [32, 48],
            iconAnchor: [16, 48],
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            FREE: '#52c41a',
            LOCK: '#faad14',
            DAMAGED: '#f5222d'
        };
        return statusColors[status] || '#000000';
    };

    const handleMarkerClick = (telescope) => {
        setSelectedTelescope(telescope);
        loadTelescopeDetails(telescope.telescope_id);
        setIsDrawerOpen(true);
    };

    const loadTelescopeDetails = (telescopeId) => {
        telescopeApi.getTelescopeDetails(
            telescopeId,
            (details) => {
                setTelescopeDetails(details);
            },
            (error) => {
                console.error('Failed to load telescope details:', error);
            }
        );
    };

    const handleView = () => {
        console.log('Navigating to view with telescope:', selectedTelescope);
        navigate('/view', {
            state: {
                telescopeId: selectedTelescope.telescope_id,
                isControlMode: false
            }
        });
    };

    const handleControl = () => {
        console.log('Navigating to control with telescope:', selectedTelescope);
        navigate('/control', {
            state: {
                telescopeId: selectedTelescope.telescope_id,
                isControlMode: true
            }
        });
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedTelescope(null);
        setTelescopeDetails(null);
    };

    const DrawerContent = () => {
        if (!selectedTelescope) return null;

        const renderActionButtons = () => {
            if (selectedTelescope.status === 'DAMAGED') {
                return null;
            }

            return (
                <Space style={{ marginTop: '24px' }}>
                    <Button type="primary" onClick={handleView}>
                        View
                    </Button>
                    {selectedTelescope.status === 'FREE' && (
                        <Button type="primary" onClick={handleControl}>
                            Control and View
                        </Button>
                    )}
                </Space>
            );
        };

        return (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Descriptions title="Basic Info" column={1}>
                    <Descriptions.Item label="Model">{selectedTelescope.model_name}</Descriptions.Item>
                    <Descriptions.Item label="Location">{selectedTelescope.location.city}, {selectedTelescope.location.country}</Descriptions.Item>
                    <Descriptions.Item label="Price per day">${selectedTelescope.price_per_day}</Descriptions.Item>
                    <Descriptions.Item label="Status">{selectedTelescope.status}</Descriptions.Item>
                    <Descriptions.Item label="Coordinates">
                        {selectedTelescope.location.latitude}, {selectedTelescope.location.longitude}
                    </Descriptions.Item>
                </Descriptions>

                {telescopeDetails && (
                    <Descriptions title="Technical Specifications" column={1}
                    >
                        <Descriptions.Item label="Aperture">{telescopeDetails.aperture} mm</Descriptions.Item>
                        <Descriptions.Item label="Focal Length">{telescopeDetails.focal_length} mm</Descriptions.Item>
                        <Descriptions.Item label="Focal Ratio">f/{telescopeDetails.focal_ratio}</Descriptions.Item>
                        <Descriptions.Item label="Weight">{telescopeDetails.weight} kg</Descriptions.Item>
                        <Descriptions.Item label="Dimensions">
                            {telescopeDetails.length} × {telescopeDetails.width} × {telescopeDetails.height} mm
                        </Descriptions.Item>
                        <Descriptions.Item label="Mount Type">{telescopeDetails.mount_type}</Descriptions.Item>
                        <Descriptions.Item label="Optical Design">{telescopeDetails.optical_design}</Descriptions.Item>
                    </Descriptions>
                )}

                {renderActionButtons()}
            </Space>
        );
    };

    return (
        <>
            <Card
                bodyStyle={{ padding: 0, height: '100vh' }}
                style={{ width: '100%', height: '100%' }}
                bordered={false}
            >
                <MapContainer
                    center={[52.0, 19.0]}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {telescopes.map((telescope) => (
                        <Marker
                            key={telescope.telescope_id}
                            position={[telescope.location.latitude, telescope.location.longitude]}
                            icon={createPinIcon(getStatusColor(telescope.status))}
                            eventHandlers={{
                                click: () => handleMarkerClick(telescope)
                            }}
                        >
                            <div style={{
                                position: 'relative',
                                bottom: '48px',
                                left: '-50%',
                                whiteSpace: 'nowrap'
                            }}>
                                <MarkerLabel>{telescope.model_name}</MarkerLabel>
                            </div>
                        </Marker>
                    ))}
                </MapContainer>
            </Card>

            <Drawer
                title="Telescope Details"
                placement="right"
                onClose={handleDrawerClose}
                open={isDrawerOpen}
                width={400}
            >
                <DrawerContent />
            </Drawer>
        </>
    );
};

export default TelescopeMapComponent;