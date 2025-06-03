# Vehicle Management System

A comprehensive web application for managing a fleet of vehicles, including maintenance schedules, insurance tracking, and fuel consumption monitoring.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation and Setup](#installation-and-setup)
6. [Authentication](#authentication)
7. [Vehicle Management](#vehicle-management)
8. [Maintenance Tracking](#maintenance-tracking)
9. [Insurance Management](#insurance-management)
10. [Fuel Consumption](#fuel-consumption)
11. [Reports and Analytics](#reports-and-analytics)
12. [User Interface](#user-interface)
13. [Data Storage](#data-storage)
14. [Future Enhancements](#future-enhancements)

## Overview

The Vehicle Management System is a web-based application designed to help organizations manage their vehicle fleet efficiently. It provides tools for tracking vehicle information, maintenance schedules, insurance renewals, and fuel consumption. The system is built with React and uses context-based state management for data handling.

## Features

- **User Authentication**: Secure login and registration system
- **Vehicle Management**: Add, view, update, and delete vehicle information
- **Maintenance Tracking**: Schedule and record vehicle maintenance
- **Insurance Management**: Track insurance policies and renewal dates
- **Fuel Consumption**: Monitor fuel usage and efficiency
- **Dashboard**: Visual representation of fleet statistics
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React.js
- **State Management**: React Context API
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Data Storage**: Local Storage (for demo purposes)

## Project Structure

```
src/
├── assets/              # Images and other static assets
├── components/          # Reusable UI components
│   ├── Header.jsx       # Application header with user info and logout
│   ├── Sidebar.jsx      # Navigation sidebar
│   └── ProtectedRoute.jsx # Route protection for authenticated users
├── context/             # Context providers for state management
│   ├── AuthContext.jsx  # Authentication state management
│   └── VehicleContext.jsx # Vehicle data management
├── pages/               # Application pages
│   ├── Auth/            # Authentication pages
│   │   ├── Login.jsx    # User login
│   │   └── Signup.jsx   # User registration
│   ├── VehiclesPages/   # Vehicle-related pages
│   │   ├── AddVehicleForm.jsx # Form to add new vehicles
│   │   ├── VehicleDetails.jsx # Detailed view of a vehicle
│   │   └── ...          # Other vehicle-related pages
│   ├── AdminDashboard.jsx # Admin dashboard
│   ├── HRDashboard.jsx  # HR dashboard
│   └── VehicleManagment.jsx # Vehicle management dashboard
└── App.jsx              # Main application component with routing
```

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/vehicle-management-system.git
   ```

2. Navigate to the project directory:
   ```
   cd vehicle-management-system
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Authentication

The application uses a context-based authentication system:

- **Login**: Users can log in with their email and password
- **Registration**: New users can create an account with their full name, email, and password
- **Protected Routes**: Only authenticated users can access the application's features
- **Logout**: Users can log out of the application

The authentication state is managed by the `AuthContext` provider, which stores user information in local storage for persistence.

## Vehicle Management

The vehicle management system allows users to:

- **View Vehicles**: See a list of all vehicles with their details
- **Add Vehicles**: Create new vehicle records with comprehensive information
- **Update Vehicles**: Modify existing vehicle information
- **Delete Vehicles**: Remove vehicles from the system
- **Filter and Search**: Find vehicles by name, number, type, or status

Vehicle data includes:
- Basic information (name, number, type, make, model, year)
- Insurance details (expiry date, renewal date)
- Maintenance information (last maintenance, next maintenance, mileage)
- Status tracking (active, under maintenance, insurance expired)

## Maintenance Tracking

The maintenance tracking system allows users to:

- **Schedule Maintenance**: Set up upcoming maintenance appointments
- **Record Maintenance**: Log completed maintenance activities
- **View History**: Access the maintenance history for each vehicle
- **Set Reminders**: Get notified about upcoming maintenance

Maintenance records include:
- Date of maintenance
- Type of maintenance
- Cost
- Service provider
- Notes and observations

## Insurance Management

The insurance management system allows users to:

- **Track Policies**: Monitor insurance policies for each vehicle
- **Set Renewal Reminders**: Get notified about upcoming insurance renewals
- **Record Claims**: Log insurance claims and their status
- **View History**: Access the insurance history for each vehicle

Insurance records include:
- Policy number
- Provider
- Coverage details
- Expiry date
- Renewal date
- Premium amount

## Fuel Consumption

The fuel consumption tracking system allows users to:

- **Record Fuel Usage**: Log fuel purchases and consumption
- **Calculate Efficiency**: Monitor fuel efficiency for each vehicle
- **Track Costs**: Analyze fuel costs over time
- **Generate Reports**: Create reports on fuel consumption

Fuel records include:
- Date of purchase
- Amount of fuel
- Cost
- Odometer reading
- Location of purchase

## Reports and Analytics

The reporting system provides:

- **Vehicle Statistics**: Overview of the vehicle fleet
- **Maintenance Reports**: Analysis of maintenance activities and costs
- **Insurance Reports**: Summary of insurance policies and renewals
- **Fuel Consumption Reports**: Analysis of fuel usage and costs
- **Custom Reports**: Ability to generate custom reports based on specific criteria

## User Interface

The application features a modern, responsive user interface:

- **Dashboard**: Provides an overview of the vehicle fleet with key metrics
- **Navigation**: Easy access to all features through the sidebar
- **Forms**: User-friendly forms for data entry
- **Tables**: Organized display of vehicle information
- **Notifications**: Alerts for upcoming maintenance and insurance renewals
- **Responsive Design**: Works on desktop and mobile devices

## Data Storage

The application currently uses local storage for data persistence:

- **Vehicles**: Vehicle information is stored in local storage
- **Users**: User authentication data is stored in local storage
- **Maintenance Records**: Maintenance history is stored with vehicle data
- **Insurance Records**: Insurance information is stored with vehicle data
- **Fuel Records**: Fuel consumption data is stored with vehicle data

In a production environment, this would be replaced with a backend API and database.

## Future Enhancements

Planned enhancements for the system include:

- **Backend Integration**: Connect to a real backend API and database
- **User Roles**: Implement different user roles (admin, manager, user)
- **Mobile App**: Develop a mobile application for field use
- **GPS Tracking**: Integrate GPS tracking for real-time vehicle location
- **Driver Management**: Add features for managing drivers and assignments
- **Expense Tracking**: Comprehensive expense tracking for each vehicle
- **Document Management**: Store and manage vehicle-related documents
- **API Integrations**: Connect with third-party services for maintenance scheduling, fuel purchases, etc.
- **Advanced Analytics**: More sophisticated reporting and analytics features
- **Multi-language Support**: Add support for multiple languages

## License

This project is licensed under the MIT License - see the LICENSE file for details.
