// AlertComponent.tsx
import React, { useEffect } from "react";
import { Toast } from "react-bootstrap";
import styles from "././beepCardPageLoggedInView.module.css";

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
      className={`position-fixed top-0 start-50 translate-middle-x ${styles.toast}`}
    >
      <Toast.Header>
        <strong className={`me-auto text-${variant}`}>{variant === "success" ? "Success" : "Error"}</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};

export default AlertComponent;
