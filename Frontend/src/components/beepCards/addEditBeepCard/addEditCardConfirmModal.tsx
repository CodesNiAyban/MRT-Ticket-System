// ConfirmationModal.tsx
import React from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "./addEditBeepCardDialog.module.css";

interface ConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  previousBalance: number | null;
  addedValue: number | null;
  onConfirmation: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onHide,
  previousBalance,
  addedValue,
  onConfirmation,
}: ConfirmationModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered className={styles.confirmationModal}>
      <Modal.Header closeButton className={styles.confirmationModalHeader}>
        <Modal.Title className={`${styles.confirmationModalTitle} confirmation-modal-title`}>Load Confirmation</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${styles.confirmationModalBody} confirmation-modal-body`}>
        <p>Previous Balance: {previousBalance}</p>
        <p>Added Value: {addedValue}</p>
        <p>New Balance: {addedValue! + previousBalance!}</p>
      </Modal.Body>

      <Modal.Footer className={`${styles.confirmationModalFooter} confirmation-modal-footer`}>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirmation}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
