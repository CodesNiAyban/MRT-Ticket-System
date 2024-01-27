import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import styles from "./addEditBeepCardDialog.module.css";

interface ConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  previousBalance: number | null;
  addedValue: number | null;
  onConfirmation: () => void;
  isLoading: boolean; // Loading state
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onHide,
  previousBalance,
  addedValue,
  onConfirmation,
  isLoading,
}: ConfirmationModalProps) => {
  return (
    <Modal show={show} onHide={isLoading ? undefined : onHide} centered className={styles.confirmationModal}>
      <Modal.Header closeButton={!isLoading} className={styles.confirmationModalHeader}>
        <Modal.Title className={`${styles.confirmationModalTitle} confirmation-modal-title`}>
          Load Confirmation
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${styles.confirmationModalBody} confirmation-modal-body`}>
        <Form>
          <Form.Group controlId="formPreviousBalance" className="mb-3">
            <Form.Label>Previous Balance</Form.Label>
            <Form.Control type="text" value={"₱" + previousBalance!} disabled />
          </Form.Group>

          <Form.Group controlId="formAddedValue" className="mb-3">
            <Form.Label>Added Value</Form.Label>
            <Form.Control type="text" value={"₱" + addedValue!} disabled />
          </Form.Group>

          <Form.Group controlId="formNewBalance" className="mb-3">
            <Form.Label>New Balance</Form.Label>
            <Form.Control type="text" value={"₱" + (addedValue! + previousBalance!)} disabled />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className={`${styles.confirmationModalFooter} confirmation-modal-footer`}>
        {isLoading ? (
          <Button variant="primary" disabled>
            Confirming...
          </Button>
        ) : (
          <Button variant="primary" onClick={onConfirmation}>
            Confirm
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
