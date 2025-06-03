# SSKVehicles - Vehicle Management System

A comprehensive vehicle management system for tracking, maintaining, and managing your vehicle fleet efficiently.

## Features

### Vehicle Management
- Add, edit, view, and delete vehicles
- Track vehicle details (make, model, year, color, etc.)
- Manage vehicle status (active, under maintenance, inactive)
- View all vehicles in a centralized dashboard

### Fuel Management
- Record fuel purchases
- Track fuel consumption
- Generate fuel efficiency reports
- Analyze fuel costs and usage patterns

### Maintenance Management
- Schedule maintenance activities
- Record maintenance history
- Set up maintenance reminders
- Track maintenance costs

### Insurance Management
- Store insurance policy details
- Track insurance expiry dates
- Get notifications for upcoming renewals
- Maintain insurance document records

### Document Management
- Upload and store vehicle documents
- Organize documents by vehicle and type
- Easy access to registration, insurance, and other documents
- Document expiry tracking

### Vehicle Tracking
- Track vehicle locations
- View location history
- Monitor vehicle movements
- Generate route reports

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios for API calls

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=7000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:7000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get a specific vehicle
- `POST /api/vehicles` - Add a new vehicle
- `PUT /api/vehicles/:id` - Update a vehicle
- `DELETE /api/vehicles/:id` - Delete a vehicle

### Fuel Records
- `GET /api/fuel/purchase` - Get all fuel purchases
- `POST /api/fuel/purchase` - Add a new fuel purchase
- `DELETE /api/fuel/purchase/:id` - Delete a fuel purchase
- `GET /api/fuel/consumption` - Get all fuel consumption records
- `POST /api/fuel/consumption` - Add a new fuel consumption record
- `DELETE /api/fuel/consumption/:id` - Delete a fuel consumption record

### Vehicle Documents
- `GET /api/vehicles/:vehicleId/documents` - Get all documents for a vehicle
- `POST /api/vehicles/:vehicleId/documents` - Upload a document for a vehicle
- `DELETE /api/vehicles/:vehicleId/documents/:docId` - Delete a vehicle document

### Insurance Records
- `GET /api/insurance-records` - Get all insurance records
- `POST /api/insurance-records` - Add a new insurance record
- `PUT /api/insurance-records/:id` - Update an insurance record

### Vehicle Tracking
- `POST /api/tracking/location` - Record vehicle location
- `GET /api/tracking/location/:vehicleId` - Get vehicle's current location
- `GET /api/tracking/history/:vehicleId` - Get vehicle's location history

## License
This project is licensed under the MIT License.
