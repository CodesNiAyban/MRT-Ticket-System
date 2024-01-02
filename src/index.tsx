import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Routes, Route, Link, NavLink, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import AdminLogin from './admin-sign-in/adminLogin';
import TapIn from './tap-in/Tap-In'
import TapOut from './tap-out/Tap-Out'
import Ticket from './ticket_system/ticket_interface'
import UserDashboard from './user-dashboard/Dashboard'
import AdminDashboard from './admin-dashboard/Dashboard'
import Load from './user-dashboard/Load'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="/" element={<UserDashboard/>}>
       <Route index element={<Load/>} />
       <Route path="Load" element={<Load />} />
    </Route>
    
    <Route path="AdminLogin" element={<AdminLogin />} />
    <Route path="AdminDashboard" element={<AdminDashboard />} />
    </>
    
  )
)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
