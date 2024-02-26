import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import LoginModal from "./components/adminLogin";
import NavBar from "./components/navbar/NavBar";
import { Admin } from "./model/adminModel";
import * as AdminApi from "./network/adminAPI";
import * as adminApi from "./network/adminAPI";
import BeepCardPage from "./pages/beepCardPage";
import FarePage from "./pages/farePage";
import LoginPage from "./pages/loginPage";
import PageNotFound from "./pages/pageNotFound";
import StationsPage from "./pages/stationsPage";
import styles from "./styles/app.module.css";

function App() {
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  async function onLogout() {
    try {
      await AdminApi.logout();
      setLoggedInAdmin(null);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  useEffect(() => {
    async function fetchLoggedInAdmin() {
      try {
        const admin = await adminApi.getLoggedInAdmin();
        setLoggedInAdmin(admin);
      } catch (error) {
        console.error(error);
      }
    }

    // Check if there is a stored JWT token in local storage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        fetchLoggedInAdmin();
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
            <NavBar
              loggedInAdmin={loggedInAdmin}
              onLoginClicked={() => setShowLoginModal(true)}
              onLogoutSuccessful={onLogout}
            />
             <Outlet />
            </>
          }
        >
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/stations"
            element={<StationsPage loggedInAdmin={loggedInAdmin} />}
          />
          <Route
            path="/beepcards"
            element={<BeepCardPage loggedInAdmin={loggedInAdmin} />}
          />
          <Route
            path="/fare"
            element={<FarePage loggedInAdmin={loggedInAdmin} />}
          />
        </Route>

        {/* Fallback route */}
        <Route path="/*" element={<PageNotFound />} />
      </Routes>

      {showLoginModal && (
        <LoginModal
          onDismiss={() => setShowLoginModal(false)}
          onLoginSuccessful={(admin) => {
            setLoggedInAdmin(admin);
            setShowLoginModal(false);
          }}
        />
      )}
    </BrowserRouter>
  );
}

export default App;