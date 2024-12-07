# Factory Data Analytics Dashboard

## Overview

This React application provides a comprehensive dashboard for factory data analytics. It features real-time sensor data
visualization, event tracking, and report generation capabilities.

## Key Features

#### User Interface:
The app likely has a clean, modern interface with a header at the top, a sidebar for navigation, and a main content area. The design probably follows a consistent theme as indicated by the 'theme.js' file in the styles folder.

#### Authentication: 
Users are greeted with a login screen where they can authenticate using their credentials. The app seems to use Keycloak for authentication, providing secure access to the application.

#### Home Dashboard: 
After logging in, users are presented with a home dashboard. This dashboard likely includes:
Current sensor values displayed in an easy-to-read format
Average sensor values, possibly shown over different time periods
Charts visualizing sensor data trends over time
A list of recent events or alerts related to the sensors

#### Sensor Management: 
Users can view a list of all sensors in the system. They probably have the ability to:
Add new sensors using the 'UpsertSensorPopup' component
Edit existing sensor details
Delete sensors that are no longer needed

#### Real-time Monitoring: 
The app likely provides real-time or near-real-time updates of sensor values. Users can monitor these values and receive alerts if any sensors report unusual readings.

#### Reporting: 
There's a dedicated reports section where users can:
View a list of predefined reports
Create new custom reports
Generate and view detailed reports on sensor performance, trends, and events
The 'ReportItemDetails' component suggests that users can drill down into specific report details

#### Data Visualization: 
The app seems to offer various data visualization options:
Time-based charts to show sensor value trends
Possibly other types of charts or graphs to represent data in meaningful ways

#### User Profile: 
Users can access and manage their profile information, possibly updating details like contact information or notification preferences.

#### Responsive Design: 
Given that this is a modern web application, it's likely responsive and works well on both desktop and mobile devices.

#### Configuration: 
There might be a section for system administrators to configure various aspects of the application, such as sensor thresholds, alert rules, or user permissions.

#### Event Tracking: 
The app appears to track and display events, which could include things like sensor malfunctions, threshold breaches, or system notifications.

## Technology Stack

- React
- Ant Design (UI components)
- Recharts (for data visualization)
- Keycloak (for authentication)
- Custom API integration for data fetching

## Getting Started

1. Clone the repository
2. Install dependencies:

```shell
npm install
```

3. Set up Keycloak configuration in `KeycloakInterface.js`
4. Start the development server:

```shell
npm start
```

## Project Structure

- `src/components`: React components for the UI
    - `home`: Components for the main dashboard
    - `reports`: Components for the reports functionality
    - `controls`: Reusable UI control components
    - `styles`: Theme and styling related files
- `src/datasource`: API clients and data management
- `src/assets`: Static assets and icon components

## Key Components

- `Dashboard`: Main component for the home page
- `ReportsDashboard`: Manages the reports functionality
- `Charts`: Renders real-time data charts
- `Events`: Displays and filters events/alerts
- `SensorValues`: Shows current and average sensor readings

## Configuration

The app uses various configuration files:
- `theme.js`: Defines the app's color scheme and styling variables

Configuration file (.env file) contains the following parameters:
- `REACT_APP_KEYCLOAK_URL` - base url for Keycloak server
- `REACT_APP_KEYCLOAK_REALM` - realm which is used by app's users 
- `REACT_APP_CLIENT_ID` - Keycloak's client id for given realm
- `REACT_APP_HOME_API_BASE_URL` - base url for Home Api
- `REACT_APP_REPORTS_API_BASE_URL` - base url for Reports Api
- `REACT_APP_CONFIG_API_BASE_URL` - base url for Config Api

## Authentication

The app uses Keycloak for user authentication. The `KeycloakInterface.js` file manages the integration.

## API Integration

The `ApiContext.jsx` and various client files in the `datasource` directory handle API communications.

## Customization

Users can customize their dashboard in 'edit' mode:
- Add/remove sensors in the current and average sensor value sections
- Modify chart configurations
- Adjust time ranges for data display


## License

This project is licensed under the MIT License - see the LICENSE.md file for details.