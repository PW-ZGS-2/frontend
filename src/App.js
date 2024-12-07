import './App.css';
import {Layout} from 'antd';
import {ApiProvider} from "./datasource/ApiContext";
import {theme} from "./components/styles/theme";
import ConfigProvider from "antd/es/config-provider";
import React from "react";
import TelescopeMapComponent from "./components/MapComponent";
import CameraView from "./components/CameraView";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

const {Content} = Layout;

function App() {
    return (
        <ApiProvider>
                <ConfigProvider
                    theme={{
                        components: {
                            Table: {
                                rowHoverBg: theme.colors.primaryHover,
                                borderColor: theme.colors.border
                            },
                            Descriptions: {
                                titleColor: 'white',
                                labelColor: 'white',
                                contentColor: 'white',
                                colorText: 'white',
                                colorTextSecondary: 'white',
                                // If needed, you can also add specific styles for each part
                                cellPaddingBlock: 8,
                                itemColor: 'white',
                                extraColor: 'white'
                            },
                            Drawer: {
                                contentColor: 'white'
                            }
                        },
                        token: {
                            // Previous tokens remain the same
                            colorPrimary: theme.colors.primary,
                            fontFamily: theme.fonts.family,
                            borderRadius: theme.sizes.borderRadius,
                            colorBgContainer: theme.colors.secondary,
                            colorBgElevated: theme.colors.secondary,
                            colorText: 'white',  // Set default text color to white
                            colorTextQuaternary: theme.colors.textMuted,
                            colorPrimaryBg: theme.colors.primaryHover,
                            colorIcon: theme.colors.textMuted,
                            colorFillSecondary: theme.colors.primary,

                            // Additional tokens for text colors
                            colorTextBase: 'white',
                            colorTextLabel: 'white',
                            colorTextHeading: 'white',
                            colorTextDescription: 'white',
                            colorTextSecondary: 'white'
                        }
                    }}
                >
                    <Router>
                        <Routes>
                            <Route path="/" element={<TelescopeMapComponent/>}/>
                            <Route path="/view" element={<CameraView/>}/>
                            <Route path="/control" element={<CameraView isControlMode={true}/>}/>
                        </Routes>
                    </Router>
                </ConfigProvider>
        </ApiProvider>
    );
}

export default App;