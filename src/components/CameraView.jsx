import React, { useEffect, useState } from 'react';
import { Button, message, Slider, Space } from 'antd';
import {
    FullscreenExitOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    ZoomInOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TelescopeApi } from "../datasource/BackendClient";
import { Room, RoomEvent } from 'livekit-client';
import mqtt from 'mqtt';

const FullscreenContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 1000;
    display: flex;
    flex-direction: column;
`;

const ImageContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
`;

const TopBar = styled.div`
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.8);
    color: white;
`;

const ControlsContainer = styled.div`
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const MovementControls = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
    width: 120px;

    .center-btn {
        grid-column: 2;
    }
`;

const ZoomContainer = styled.div`
    width: 120px;
    margin-top: 20px;
    color: white;
    text-align: center;
`;

const VideoContainer = styled.div`
    width: 100%;
    height: 100%;

    video {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`;

const CameraView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { telescopeId, isControlMode } = location.state || {};
    const telescopeApi = new TelescopeApi('http://localhost:8000');
    const [zoom, setZoom] = useState(1);
    const [room, setRoom] = useState(null);
    const [videoElement, setVideoElement] = useState(null);
    const [livekitToken, setLivekitToken] = useState(null);

    const [mqttClient, setMqttClient] = useState(null);

    useEffect(() => {
        // Connect to MQTT broker
        const client = mqtt.connect('localhost:1883');

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            setMqttClient(client);
        });

        return () => {
            if (mqttClient) {
                mqttClient.end();
            }
        };
    }, []);

    useEffect(() => {
        if (!telescopeId) {
            message.error('No telescope selected');
            navigate('/');
            return;
        }

        // Lock telescope and get LiveKit token
        telescopeApi.updateTelescopeState(
            'id',
            telescopeId,
            'LOCK',
            (response) => {
                // Assuming the response contains the LiveKit token
                setLivekitToken(response.subscribe_token);
                connectToLiveKit(response.subscribe_token);
            },
            (error) => {
                console.error('Failed to lock telescope:', error);
                message.error('Failed to connect to telescope');
                navigate('/');
            }
        );

        // Cleanup function
        return () => {
            if (room) {
                room.disconnect();
            }
            // Release telescope on component unmount
            telescopeApi.updateTelescopeState(
                'id',
                telescopeId,
                'FREE',
                () => {
                    console.log('Telescope released');
                },
                (error) => {
                    console.error('Failed to release telescope:', error);
                }
            );
        };
    }, [telescopeId]);

    const connectToLiveKit = async (token) => {
        try {
            const room = new Room({
                // Optimize for real-time video
                adaptiveStream: true,
                dynacast: true,
                // Video optimization
                videoDimensions: {
                    width: 1280,
                    height: 720,
                    frameRate: 30,
                },
                // Reduce latency
                stopLocalTrackOnUnpublish: true,
                disconnectOnUnpublish: false,
                // Connection optimization
                multiplexedAudioTrackBitrate: 96000,
                optimizeVideo: true,
                preferredCodecs: {
                    video: 'h264',
                }
            });

            room.on(RoomEvent.Disconnected, () => {
                message.error('Video connection lost');
            });

            room.on(RoomEvent.Reconnecting, () => {
                message.warning('Attempting to reconnect...');
            });

            room.on(RoomEvent.Reconnected, () => {
                message.success('Video connection restored');
            });

            room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === 'video') {
                    const element = track.attach();
                    setVideoElement(element);
                }
            });

            await room.connect('ws://localhost:7880', token);
            setRoom(room);
            console.log('Connected to LiveKit room');

        } catch (error) {
            console.error('LiveKit connection error:', error);
            message.error('Failed to connect to video stream');
            navigate('/');
        }
    };

    const handleExit = () => {
        // Release telescope before navigating away
        telescopeApi.updateTelescopeState(
            'id',
            telescopeId,
            'FREE',
            () => {
                navigate('/');
            },
            (error) => {
                console.error('Failed to release telescope:', error);
                navigate('/');
            }
        );
    };

    const sendMqttMessage = (type, value) => {
        if (!mqttClient || !telescopeId) return;

        const message = JSON.stringify({
            type: type,
            value: value
        });

        mqttClient.publish(telescopeId, message);
    };

    const handleMove = (direction) => {
        let type = '';
        let value = 0;

        switch(direction) {
            case 'right':
                type = 'dx';
                value = 0.1;
                break;
            case 'left':
                type = 'dx';
                value = -0.1;
                break;
            case 'up':
                type = 'dy';
                value = 0.1;
                break;
            case 'down':
                type = 'dy';
                value = -0.1;
                break;
        }

        sendMqttMessage(type, value);
    };

    const handleZoom = (value) => {
        setZoom(value);
        sendMqttMessage('zoom', value);
    };

    return (
        <FullscreenContainer>
            <TopBar>
                <div>
                    {isControlMode ? 'Control and View Mode' : 'View Mode'}
                </div>
                <Button
                    icon={<FullscreenExitOutlined />}
                    onClick={handleExit}
                    type="text"
                    style={{ color: 'white' }}
                >
                    Exit
                </Button>
            </TopBar>
            <ImageContainer>
                <VideoContainer ref={containerRef => {
                    if (containerRef && videoElement) {
                        containerRef.innerHTML = '';
                        containerRef.appendChild(videoElement);
                    }
                }} />
                {isControlMode && (
                    <ControlsContainer>
                        <MovementControls>
                            <div />
                            <Button
                                icon={<ArrowUpOutlined />}
                                onClick={() => handleMove('up')}
                                className="center-btn"
                            />
                            <div />
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => handleMove('left')}
                            />
                            <div />
                            <Button
                                icon={<ArrowRightOutlined />}
                                onClick={() => handleMove('right')}
                            />
                            <div />
                            <Button
                                icon={<ArrowDownOutlined />}
                                onClick={() => handleMove('down')}
                                className="center-btn"
                            />
                            <div />
                        </MovementControls>
                        <ZoomContainer>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <ZoomInOutlined /> Zoom
                                </div>
                                <Slider
                                    min={1}
                                    max={10}
                                    step={0.1}
                                    value={zoom}
                                    onChange={handleZoom}
                                    tooltip={{
                                        formatter: value => `${value}x`
                                    }}
                                />
                            </Space>
                        </ZoomContainer>
                    </ControlsContainer>
                )}
            </ImageContainer>
        </FullscreenContainer>
    );
};

export default CameraView;