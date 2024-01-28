// EditFareDialogProps.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Toast } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Fare } from "../../model/fareModel";
import * as FaresApi from "../../network/fareAPI";
import TextInputField from "../form/textInputFields";
import styles from "./fare.module.css";

interface EditFareDialogProps {
  fareToEdit?: Fare;
  onDismiss: () => void;
  onFareSaved: (fare: Fare) => void;
}

const EditFareDialogProps: React.FC<EditFareDialogProps> = ({
  fareToEdit,
  onDismiss,
  onFareSaved,
}: EditFareDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fare>({
    defaultValues: {
      fareType: fareToEdit?.fareType || "",
      price: fareToEdit?.price || 0,
    },
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowToast(false);
      setToastMessage(null);
    }, 1300);

    return () => clearTimeout(timeoutId);
  }, [showToast]);

  async function onSubmit(input: Fare) {
    try {
      if (input.price < 0 || input.price > 5000) {
        setToastVariant("danger");
        setToastMessage("Please enter a valid price between 0 and 5000.");
        setShowToast(true);
        return;
      }
  
      let fareResponse: Fare;
      if (fareToEdit) {
        if (input.price === fareToEdit.price) {
          setToastVariant("danger");
          setToastMessage("Update is unchanged.");
          setShowToast(true);
          return;
        }
  
        fareResponse = await FaresApi.updateFare(fareToEdit._id, input);
        onFareSaved(fareResponse);
        onDismiss(); // Trigger modal dismissal here
      }
    } catch (error: any) {
      console.error(error);
  
      if (error.message === "Network Error") {
        setToastVariant("danger");
        setToastMessage(
          "No connection. Please check your internet connection."
        );
      } else if (error.response && error.response.status === 409) {
        setToastVariant("danger");
        setToastMessage(
          "Error: Duplicate fare. Please use a different fare."
        );
      } else {
        setToastVariant("danger");
        setToastMessage("Error saving Beep Card. Please try again.");
      }
      setShowToast(true);
    }
  }
  

  return (
    <Modal show onHide={onDismiss} centered className={`${styles.modalContent}`}>
      <Modal.Header closeButton className={styles.confirmationModalHeader}>
        <Modal.Title className={`${styles.modalTitle} modal-title`}>
          Edit Fare
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <Form id="editFareForm" onSubmit={handleSubmit(onSubmit)}>
          <TextInputField
            name="price"
            label="Price"
            type="number"
            placeholder="Enter Fare:"
            register={register}
            registerOptions={{ required: "Required" }}
            errors={errors.price}
            disabled={isSubmitting}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button
          type="submit"
          form="editFareForm"
          disabled={isSubmitting}
          className={`btn-primary ${styles.primaryButton} d-flex align-items-center`}
          style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
        >
          {isSubmitting && (
            <>
              <Spinner
                animation="border"
                variant="secondary"
                size="sm"
                className={`${styles.loadingcontainer}`}
              />
              <span className="ml-2">Updating Fare...</span>
            </>
          )}
          {!isSubmitting && 'Save'}
        </Button>
      </Modal.Footer>

      <Toast
        show={showToast}
        onClose={() => {
          setShowToast(false);
          onDismiss(); // Dismiss modal when toast is closed
        }}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          width: '300px',
          background: toastVariant === "success" ? "#28a745" : "#dc3545",
          color: "#fff",
        }}
        className={`position-fixed top-20 start-50 translate-middle-x ${styles.toast}`}
      >
        <Toast.Header>
          <strong className={`me-auto`}>
            {toastVariant === "success" ? "Success" : "Error"}
          </strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Modal>
  );
};

export default EditFareDialogProps;
