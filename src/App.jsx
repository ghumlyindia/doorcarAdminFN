import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ViewCars from './pages/ViewCars';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import CarDetails from './pages/CarDetails';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
// import Settings from './pages/Settings';

// Placeholder content
const SettingsPage = () => <div className="p-4">Settings Page (Coming Soon)</div>;

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="cars" element={<ViewCars />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="edit-car/:id" element={<EditCar />} />
            <Route path="cars/:id" element={<CarDetails />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            {/* <Route path="settings" element={<SettingsPage />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
