# Telescope Control System

A web application for controlling and monitoring telescopes remotely. The system allows users to view and control telescopes from different locations, manage access, and stream live telescope footage.

## Features

- Interactive map with telescope locations
- Real-time telescope status monitoring
- Live video streaming from telescopes
- Remote telescope control capabilities
- Multi-user support
- Cost tracking per session
- Target object selection
- Movement and zoom controls

## Technologies Used

- React
- Ant Design (UI Framework)
- LiveKit (Video Streaming)
- Leaflet (Maps)

## Usage

### Map View
- Displays all available telescopes with their current status
- Select user from dropdown
- View telescope details and pricing
- Access telescope control

### Camera View
- Live video stream from selected telescope
- Movement controls (up, down, left, right)
- Zoom controls
- Target selection
- Real-time cost tracking

## API Integration

The application integrates with several endpoints:

### Telescope API
```typescript
interface TelescopeApi {
  getTelescopesList(): TelescopesResponse;
  getTelescopeDetails(id: string): TelescopeSpecifications;
  updateTelescopeState(id: string, state: 'FREE' | 'LOCK' | 'DAMAGED');
}
```

