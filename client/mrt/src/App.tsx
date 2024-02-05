import { useEffect, useState } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import PageNotFound from "./pages/pageNotFound";
import MrtTapPage from "./pages/mrtTapPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for MRT page without Navbar */}
        <Route path="/" element={<MrtTapPage/>} />

        {/* Fallback route */}
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;