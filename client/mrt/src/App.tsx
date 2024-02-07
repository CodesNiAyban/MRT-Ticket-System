import { BrowserRouter, Route, Routes } from "react-router-dom";
import MrtTapIn from "./components/mrtTapIn";
import MrtTapOut from "./components/mrtTapOut";
import PageNotFound from "./pages/pageNotFound";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Route for MRT page without Navbar */}
          <Route path="/:stationName/in" element={<MrtTapIn />} />

          <Route path="/:stationName/out" element={<MrtTapOut />} />

          {/* Fallback route */}
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;