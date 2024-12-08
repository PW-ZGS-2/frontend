import React, {useEffect, useState} from 'react';
import {Button, message, Select, Space} from 'antd';
import {
    ArrowDownOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    ArrowUpOutlined,
    FullscreenExitOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {Room, RoomEvent} from 'livekit-client';
import {useApiContext} from "../datasource/ApiContext";
import {useUser} from "../datasource/UserProvider";

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

const ListContainer = styled.div`
  position: absolute;
  left: 20px;
  top: 20px;
  width: 200px;
  z-index: 1000;
`;

const CameraView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {telescopeId, isControlMode, selectedTelescope, selectedUser} = location.state || {};
    const {telescopeApi} = useApiContext()
    const [zoom, setZoom] = useState(1);
    const [room, setRoom] = useState(null);
    const [videoElement, setVideoElement] = useState(null);
    const [livekitToken, setLivekitToken] = useState(null);
    const {setCurrentCost} = useUser();
    const [startTime] = useState(new Date());
    const [selectedTargets, setSelectedTargets] = useState([]);

    const targetOptions = [
        { value: 'Sun', label: 'Sun' },
        { value: 'Venus', label: 'Venus' },
        { value: 'Alpheratz', label: 'Alpheratz' },
        { value: 'Schedar', label: 'Schedar' },
        { value: 'Mirfak', label: 'Mirfak' },
        { value: 'Capella', label: 'Capella' },
        { value: 'Regulus', label: 'Regulus' },
        { value: 'Dubhe', label: 'Dubhe' },
        { value: 'Denebola', label: 'Denebola' },
        { value: 'Gienah', label: 'Gienah' },
        { value: 'Alioth', label: 'Alioth' },
        { value: 'Spica', label: 'Spica' },
        { value: 'Alkaid', label: 'Alkaid' },
        { value: 'Arcturus', label: 'Arcturus' },
        { value: 'Zubenelgenubi', label: 'Zubenelgenubi' },
        { value: 'Kochab', label: 'Kochab' },
        { value: 'Alphecca', label: 'Alphecca' },
        { value: 'Antares', label: 'Antares' },
        { value: 'Sabik', label: 'Sabik' },
        { value: 'Shaula', label: 'Shaula' },
        { value: 'Rasalhague', label: 'Rasalhague' },
        { value: 'Eltanin', label: 'Eltanin' },
        { value: 'Kaus Australis', label: 'Kaus Australis' },
        { value: 'Vega', label: 'Vega' },
        { value: 'Nunki', label: 'Nunki' },
        { value: 'Altair', label: 'Altair' },
        { value: 'Deneb', label: 'Deneb' },
        { value: 'Enif', label: 'Enif' },
        { value: 'Markab', label: 'Markab' },
        { value: 'Polaris', label: 'Polaris' },
        { value: 'Aries', label: 'Aries' }
    ];

    const handleTargetsChange = (values) => {
        setSelectedTargets(values);

        const req = {
            interesting: values.map((value: string )=> value.toLowerCase())
        }

        console.log(req)

        telescopeApi.publishInterested(
            telescopeId,
            req,
            () => console.log('Interested targets updated'),
            (error) => {
                console.error('Failed to update interested targets:', error);
                message.error('Failed to update interested targets');
            }
        )
    };

    useEffect(() => {
        // Cost tracking interval
        const costInterval = setInterval(() => {
            const elapsedMinutes = (new Date() - startTime) / (1000 * 60);
            const additionalCost = elapsedMinutes * (selectedTelescope?.price_per_minute || 0);
            console.log(`Elapsed minutes: ${elapsedMinutes}, additional cost: ${additionalCost}`);
            setCurrentCost(prev => prev + additionalCost);
        }, 60000); // Update every minute

        return () => {
            clearInterval(costInterval);
        };
    }, [startTime, selectedTelescope?.price_per_minute]);

    useEffect(() => {
        if (!telescopeId) {
            message.error('No telescope selected');
            navigate('/');
            return;
        }

        // Lock telescope and get LiveKit token
        telescopeApi.updateTelescopeState(
            selectedUser.id,
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

            await room.connect(process.env.REACT_APP_LIVE_KIT_URL, token);
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

        telescopeApi.controlTelescope(
            telescopeId,
            {
                type: type,
                value: value
            },
            (response) => {
                console.log('Telescope control successful: ' + type + " " + value);
            },
            (error) => {
                console.error('Failed to control telescope:', error);
            }
        )
    };

    const handleMove = (direction) => {
        let type = '';
        let value = 0;

        switch (direction) {
            case 'right':
                type = 'DX';
                value = 0.05;
                break;
            case 'left':
                type = 'DX';
                value = -0.05;
                break;
            case 'up':
                type = 'DY';
                value = 0.05;
                break;
            case 'down':
                type = 'DY';
                value = -0.05;
                break;
        }

        sendMqttMessage(type, value);
    };

    const handleZoom = (direction) => {
        const step = 0.1;
        const deltZoom = direction === 'in' ? step : -1.0 * step;

        setZoom(zoom + deltZoom);

        sendMqttMessage('ZOOM', deltZoom);
    };

    return (
        <FullscreenContainer>
            <TopBar>
                <div>
                    {isControlMode ? 'Control and View Mode' : 'View Mode'}
                </div>
                <Button
                    icon={<FullscreenExitOutlined/>}
                    onClick={handleExit}
                    type="text"
                    style={{color: 'white'}}
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
                }}/>
                <ListContainer>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select interested"
                        onChange={handleTargetsChange}
                        options={targetOptions}
                        value={selectedTargets}
                        maxTagCount="responsive"
                        dropdownStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    />
                </ListContainer>
                {isControlMode && (
                    <ControlsContainer>
                        <MovementControls>
                            <div/>
                            <Button
                                icon={<ArrowUpOutlined/>}
                                onClick={() => handleMove('up')}
                                className="center-btn"
                            />
                            <div/>
                            <Button
                                icon={<ArrowLeftOutlined/>}
                                onClick={() => handleMove('left')}
                            />
                            <div/>
                            <Button
                                icon={<ArrowRightOutlined/>}
                                onClick={() => handleMove('right')}
                            />
                            <div/>
                            <Button
                                icon={<ArrowDownOutlined/>}
                                onClick={() => handleMove('down')}
                                className="center-btn"
                            />
                            <div/>
                        </MovementControls>
                        <ZoomContainer>
                            <Space direction="vertical" style={{width: '100%'}}>
                                <Space>
                                    <Button
                                        icon={<ZoomOutOutlined/>}
                                        onClick={() => handleZoom('out')}
                                    />
                                    <span style={{color: 'white'}}>{zoom.toFixed(1)}x</span>
                                    <Button
                                        icon={<ZoomInOutlined/>}
                                        onClick={() => handleZoom('in')}
                                    />
                                </Space>
                            </Space>
                        </ZoomContainer>
                    </ControlsContainer>
                )}
            </ImageContainer>
        </FullscreenContainer>
    );
};

export default CameraView;