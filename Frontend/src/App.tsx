import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import LoginModal from "./components/adminLogin";
import { Admin } from "./model/adminModel";
import * as adminApi from "./network/adminAPI";
import BeepCardPage from "./pages/beepCardPage";
import PageNotFound from "./pages/pageNotFound";
import StationsPage from "./pages/stationsPage";
import FarePage from "./pages/farePage";
import LoginPage from "./pages/loginPage";
import styles from "./styles/app.module.css";
import jwt from 'jsonwebtoken'; // or wherever you are importing it from

function App() {
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const onLogout = () => {
    // Clear local storage and perform any additional logout tasks
    localStorage.removeItem('authToken');
    setLoggedInAdmin(null);
  };

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
        const decodedToken = jwt.decode(storedToken) as { exp: number };
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired, log the user out
          onLogout();
        } else {
          // Token is valid, fetch the logged-in admin
          fetchLoggedInAdmin();
        }
      } catch (error) {
        // Error decoding token, log the user out
        onLogout();
      }
    }

    // Set up an interval to periodically check token expiration
    const checkTokenExpiration = () => {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        // Token is not present, log the user out
        onLogout();
      } else {
        try {
          const decodedToken = jwt.decode(storedToken) as { exp: number };
          if (decodedToken.exp * 1000 < Date.now()) {
            // Token is expired, log the user out
            onLogout();
          }
        } catch (error) {
          // Error decoding token, log the user out
          onLogout();
        }
      }
    };

    const checkTokenInterval = setInterval(checkTokenExpiration, 60000); // Check every minute

    // Clean up the interval on component unmount
    return () => clearInterval(checkTokenInterval);
  }, []); // The empty dependency array ensures that this effect runs only once on mount

  return (
    <BrowserRouter>
      <div>
        <NavBar
          loggedInAdmin={loggedInAdmin}
          onLoginClicked={() => setShowLoginModal(true)}
          onLogoutSuccessful={onLogout}
        />
        <Container className={styles.pageContainer}>
          <Routes>
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
            <Route path="/*" element={<PageNotFound />} />
          </Routes>
        </Container>
        {showLoginModal && (
          <LoginModal
            onDismiss={() => setShowLoginModal(false)}
            onLoginSuccessful={(admin) => {
              setLoggedInAdmin(admin);
              setShowLoginModal(false);
            }}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
