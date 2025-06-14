# ESCOM Power Management Web Application

A comprehensive web-based platform for monitoring, controlling, and optimizing household or business electricity consumption. This application provides real-time power usage tracking, device control, unit balance management, automated alerts, and detailed historical data reporting.

## About

The ESCOM Power Management Web Application is a modern solution designed to address the growing need for efficient electricity management in both residential and commercial settings. In today's world, where energy costs are rising and environmental consciousness is increasing, this application empowers users to take control of their power consumption through an intuitive and feature-rich interface.

### Problem Statement
Traditional electricity management systems often lack:
- Real-time consumption insights
- Remote device control capabilities
- Proactive alerts for unusual usage
- Detailed historical data analysis
- User-friendly interfaces for monitoring

### Our Solution
This application bridges these gaps by providing:
1. **Smart Monitoring**: Real-time tracking of power consumption with visual indicators and alerts
2. **Device Management**: Complete control over connected appliances with individual power ratings
3. **Automated Alerts**: Instant notifications for low balances, unusual consumption patterns, and device status changes
4. **Historical Analytics**: Detailed consumption history and trends to help users make informed decisions
5. **User-Friendly Interface**: Intuitive design that makes power management accessible to everyone

### Impact
The ESCOM Power Management Web Application helps users:
- Reduce electricity costs through better consumption awareness
- Prevent unexpected power outages with proactive alerts
- Make data-driven decisions about energy usage
- Contribute to environmental sustainability through efficient power management
- Gain peace of mind with complete control over their power consumption

### Technology
Built with modern web technologies including React, Node.js, and SQLite, this application offers:
- Responsive design for all devices
- Secure user authentication
- Real-time data updates
- Scalable architecture
- Cross-platform compatibility

## Features

- **Real-time Power Monitoring**: Track current power consumption with dynamic visualizations
- **Device Management**: Register and manage household/business appliances with their power ratings
- **Remote Device Control**: Toggle devices on/off remotely through an intuitive control panel
- **Unit Balance Management**: Monitor and manage prepaid electricity units
- **Smart Alerts**: Receive notifications for low balances, unusual consumption, and device status changes
- **Historical Data**: Access detailed consumption history and trends
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Tech Stack

### Frontend
- React (with Vite)
- Chart.js & React-Chartjs-2 for data visualization
- GSAP for animations
- Toastify for notifications
- Custom CSS for styling

### Backend
- Node.js with Express.js
- SQLite database
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd escom-power-app
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd src
npm install
cd ..
```

## Running the Application

### Development Mode

1. Start the development server:
```bash
npm run dev
```
This will start both the backend server and frontend development server concurrently.

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
esco-power-app/
├── src/                    # Frontend source code
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── server/               # Backend source code
│   ├── server.js         # Main server file
│   ├── database.sqlite   # SQLite database
│   ├── household_items.json  # Predefined device list
│   └── power_usage_rules.json # Power consumption rules
├── public/              # Static assets
└── documentation_assets/ # Project documentation assets
```

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register new user
- `POST /api/users/signin` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Device Management
- `GET /api/devices/household-items` - Get predefined device list
- `GET /api/users/devices` - Get user's devices
- `POST /api/users/devices` - Add device to user's inventory
- `PUT /api/users/devices/:id` - Update device
- `DELETE /api/users/devices/:id` - Remove device

### Power Management
- `GET /api/users/units/balance` - Get current unit balance
- `POST /api/users/units` - Add power units
- `GET /api/usage/log` - Get usage history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ESCOM for the inspiration
- All contributors who have helped shape this project # Ecom-Emulator
