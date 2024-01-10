import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import AdminLogin from './admin-sign-in/adminLogin';
import TapIn from './tap-in/Tap-In'
import TapOut from './tap-out/Tap-Out'
import TapNavBar from './tap-nav-bar/TapNavBar'
import AdminDashboard from './admin-dashboard/Dashboard'
import Table from './admin-dashboard/BeepCardCRUD'
import TransactionLogs from './admin-dashboard/TransactionLogs';
import test from './testLogin'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="AdminLogin" element={<AdminLogin />} />

    <Route path="AdminDashboard" element={<AdminDashboard />}>
    <Route index element={<TransactionLogs/>} />
    <Route path="Load" element={<Table />} />
    <Route path="Table" element={<Table />} />
    <Route path="TransactionLogs" element={<TransactionLogs />} />
    </Route>

    <Route path="/" element={<TapNavBar/>}>
    <Route index element={<TapIn/>} />
    <Route path="Tap-Out" element={<TapOut />} />
    <Route path="Tap-In" element={<TapIn />} />
    </Route>
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
