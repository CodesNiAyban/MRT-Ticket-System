import React, { useState } from "react";
import axios from "axios";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("YOUR_SERVER_BASE_URL/api/login", {
        email,
        password,
      });

      const { sessionToken, refreshToken } = response.data;

      // Store tokens in local storage
      localStorage.setItem("sessionToken", sessionToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Notify the parent component about the successful login
      onLogin();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};

interface LogoutProps {
  onLogout: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
  const handleLogout = () => {
    // Clear tokens from local storage
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("refreshToken");

    // Notify the parent component about the logout
    onLogout();
  };

  return (
    <div>
      <h2>Welcome! You are logged in.</h2>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? (
        <Logout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;