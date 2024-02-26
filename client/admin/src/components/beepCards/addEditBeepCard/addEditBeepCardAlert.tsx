// AlertComponent.tsx
import React, { useEffect } from "react";
import { Toast } from "react-bootstrap";
import styles from "././addEditBeepCardDialog.module.css";

interface AlertComponentProps {
  variant: "success" | "danger";
  message: string | null;
  onClose: () => void;
}

const AlertComponent: React.FC<AlertComponentProps> = ({
  variant,
  message,
  onClose,
}: AlertComponentProps) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <Toast
      show={!!message}
      onClose={onClose}
      className={`position-fixed top-20 start-50 translate-middle-x ${styles.toast}`}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        width: '300px', // Set the width as needed
        background: variant === "success" ? "#28a745" : "#dc3545", // Background color
        color: "#fff", // Text color
      }}
    >
      <Toast.Header>
        <strong className={`me-auto`}>
          {variant === "success" ? "Success" : "Error"}
        </strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>

  );
};

export default AlertComponent;
