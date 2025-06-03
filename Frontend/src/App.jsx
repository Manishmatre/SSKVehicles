import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// contexts
import { AuthProvider } from "./context/AuthContext";
import { VehicleProvider } from "./context/VehicleContext";

// components
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import RegisterOrganization from "./pages/Auth/RegisterOrganization";

// Document Management
import DocManagement from "./pages/DocsFilePages/DocManagement";

// Vehicle Management
import VehicleManagment from "./pages/VehiclesPages/VehicleManagment";
import AddVehicleForm from "./pages/VehiclesPages/AddVehicleForm";
import EditVehicle from "./pages/VehiclesPages/EditVehicle";
import VehicleDetails from "./pages/VehiclesPages/VehicleDetails";
import AddMaintenanceRecord from "./pages/VehiclesPages/AddMaintenanceRecord";
import MaintenanceHistory from "./pages/VehiclesPages/MaintenanceHistory";
import AddFuelRecord from "./pages/VehiclesPages/AddFuelRecord";
import VehicleInsurance from "./pages/VehiclesPages/VehicleInsurance";
import AddInsurance from "./pages/VehiclesPages/AddInsurance";
import FuelConsumption from "./pages/VehiclesPages/FuelConsumption";
import MaintenanceSchedule from "./pages/VehiclesPages/MaintenanceSchedule";
import VehicleReports from "./pages/VehiclesPages/VehicleReports";
import AllVehicles from "./pages/VehiclesPages/AllVehicles";
import TrackVehicle from "./pages/VehiclesPages/TrackVehicle";
import VehicleSettings from "./pages/VehiclesPages/VehicleSettings";
import VehicleDocuments from "./pages/VehiclesPages/VehicleDocuments";
import UploadVehicleDocument from './pages/VehiclesPages/UploadVehicleDocument';
import AllFuelRecode from "./pages/VehiclesPages/AllFuelRecode";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehicleProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register-organization" element={<RegisterOrganization />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/vehicles-dashboard" replace />} />
              <Route path="/dashboard" element={<VehicleManagment />} />
              
              {/* Vehicles Section */}
              <Route path="/vehicles-dashboard" element={<VehicleManagment />} />
              <Route path="/all-vehicles" element={<AllVehicles />} />
              <Route path="/add-vehicle" element={<AddVehicleForm />} />
              <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
              <Route path="/vehicle-details/:id" element={<VehicleDetails />} />
              <Route path="/add-maintenance/:id" element={<AddMaintenanceRecord />} />
              <Route path="/maintenance-history/:id" element={<MaintenanceHistory />} />
              <Route path="/add-fuel-record" element={<AddFuelRecord />} />
              <Route path="/vehicle-insurance" element={<VehicleInsurance />} />
              <Route path="/add-insurance" element={<AddInsurance />} />
              <Route path="/fuel-consumption" element={<FuelConsumption />} />
              <Route path="/fuel-records" element={<AllFuelRecode />} />
              <Route path="/maintenance-schedule" element={<MaintenanceSchedule />} />
              <Route path="/vehicle-reports" element={<VehicleReports />} />
              <Route path="/track-vehicle" element={<TrackVehicle />} />
              <Route path="/vehicle-settings" element={<VehicleSettings />} />
              <Route path="/vehicle-documents" element={<VehicleDocuments />} />
              <Route path="/upload-vehicle-document" element={<UploadVehicleDocument />} />

              {/* Doc Section */}
              <Route path="/docfile-management" element={<DocManagement />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/vehicles-dashboard" replace />} />
            </Route>
          </Routes>
        </VehicleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
