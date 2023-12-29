// App.tsx
import { Routes, Route, Link, NavLink, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import AdminLogin from './admin-sign-in/adminLogin';
import TapIn from './tap-in/Tap-In'
import TapOut from './tap-out/Tap-Out'
import Ticket from './ticket_system/ticket_interface'
import UserDashboard from './user-dashboard/Dashboard'
import AdminDashboard from './admin-dashboard/Dashboard'

import React from 'react';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
          <Route path = "/" element={<UserDashboard />} />
          <Route path = "AdminLogin" element={<AdminLogin />} />
          <Route path = "AdminDashboard" element={<AdminDashboard />} />
          <Route path = "TapOut" element={<TapOut />} />
          <Route path = "TapIn" element={<TapIn />} />
        </Route>
  )
)

const App: React.FC = () => {
  return (
      <div>
        <RouterProvider router={router} />
      </div>

  );
};

export default App;