// TelescopeMapComponent.js
import React, {useEffect, useRef, useState} from 'react';
import {MapContainer, Marker, TileLayer} from 'react-leaflet';
import {Button, Card, Descriptions, Drawer, Select, Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styled from 'styled-components';
import {useApiContext} from "../datasource/ApiContext";
import {useUser} from "../datasource/UserProvider";

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

const UserInfo = styled.div`
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border-radius: 8px;
    color: white;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const LogoContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  
  img {
    height: 50px;  // Adjust size as needed
    width: auto;
  }
`;

const TelescopeMapComponent = () => {
    const [telescopes, setTelescopes] = useState([]);
    const [selectedTelescope, setSelectedTelescope] = useState(null);
    const [telescopeDetails, setTelescopeDetails] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const {telescopeApi} = useApiContext()
    const { users, selectedUser, setSelectedUser, currentCost } = useUser();

    const userOptions = users.map(user => ({
        value: user.id,
        label: user.username
    }));

    const handleUserChange = (userId) => {
        const newUser = users.find(user => user.id === userId);
        setSelectedUser(newUser);
    };

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
            <svg fill=${color} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 394.979 394.979" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M394.45,204.805c-0.813-2.296-2.506-4.171-4.706-5.222l-30.349-14.45c-3.349-1.595-7.173-0.976-9.843,1.26l-12.871-6.129 l3.21-6.742c3.871-8.132,0.613-17.868-7.372-22.036L60.044,9.386c-4.03-2.103-8.742-2.473-13.05-1.033 c-4.31,1.442-7.847,4.576-9.801,8.678L1.625,91.728c-1.953,4.103-2.155,8.824-0.558,13.076c1.597,4.255,4.855,7.677,9.027,9.481 l159.103,68.79L83.483,371.712c-2.55,5.609-0.068,12.226,5.542,14.774c5.61,2.551,12.225,0.067,14.774-5.542l65.796-144.799 v111.729c0,6.165,4.995,11.158,11.158,11.158c6.162,0,11.157-4.993,11.157-11.158V236.146l65.796,144.799 c1.869,4.112,5.923,6.544,10.165,6.544c1.543,0,3.113-0.323,4.61-1.002c5.608-2.55,8.092-9.165,5.541-14.774l-80.068-176.203 l94.208,40.73c1.215,0.524,2.458,0.895,3.709,1.117c7.259,1.298,14.741-2.349,18.044-9.284l3.21-6.739l12.872,6.13 c-0.053,3.479,1.877,6.839,5.227,8.434l30.349,14.45c0.747,0.354,1.53,0.604,2.332,0.75c1.556,0.275,3.171,0.15,4.688-0.388 c2.295-0.812,4.172-2.506,5.219-4.706l16.274-34.181C395.134,209.623,395.265,207.101,394.45,204.805z M264.785,155.55 l-12.164,25.544c-0.212,0.446-0.373,0.904-0.503,1.363L39.308,90.448l20.646-43.357L265.525,154.3 C265.248,154.696,264.994,155.109,264.785,155.55z"></path> </g> </g> </g></svg>
        `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
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
                selectedUser: selectedUser,
                telescopeId: selectedTelescope.telescope_id,
                selectedTelescope: selectedTelescope,
                isControlMode: false
            }
        });
    };

    const handleControl = () => {
        console.log('Navigating to control with telescope:', selectedTelescope);
        navigate('/control', {
            state: {
                selectedUser: selectedUser,
                telescopeId: selectedTelescope.telescope_id,
                selectedTelescope: selectedTelescope,
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
                    <Descriptions.Item label="Price per minute">${selectedTelescope.price_per_minute}</Descriptions.Item>
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
                <UserInfo>
                    <Select
                        style={{ width: 200 }}
                        value={selectedUser.id}
                        onChange={handleUserChange}
                        options={userOptions}
                    />
                    <div>Current Cost: ${currentCost.toFixed(2)}</div>
                </UserInfo>
                <LogoContainer>
                    <img
                        src="/logo.png"
                        alt="Logo"
                    />
                </LogoContainer>
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