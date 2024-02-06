import { BrowserRouter, Route, Routes } from "react-router-dom";
import MrtTapPage from "./pages/mrtTapPage";
import PageNotFound from "./pages/pageNotFound";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Route for MRT page without Navbar */}
          <Route path="/:stationName/:tap" element={<MrtTapPage />} />

          {/* Fallback route */}
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;