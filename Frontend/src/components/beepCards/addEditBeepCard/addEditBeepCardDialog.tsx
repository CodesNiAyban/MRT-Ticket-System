// AddEditBeepCardDialog.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BeepCard } from "../../../model/beepCardModel";
import * as BeepCardsApi from "../../../network/beepCardAPI";
import { BeepCardInput } from "../../../network/beepCardAPI";
import styles from "././addEditBeepCardDialog.module.css";
import ConfirmationModal from "./addEditCardConfirmModal";
import {
  generateDefaultNumber,
  getDefaultLoadPrice,
} from "./addEditBeepCardConstants";
import BeepCardFormFields from "./addEditBeepCardFormFields";
import AlertComponent from "./addEditBeepCardAlert";

interface AddEditBeepCardDialogProps {
  beepCardToEdit?: BeepCard;
  onDismiss: () => void;
  onBeepCardSaved: (beepCard: BeepCard) => void;
  editMode: boolean;
}

const AddEditBeepCardDialog: React.FC<AddEditBeepCardDialogProps> = ({
  beepCardToEdit,
  onDismiss,
  onBeepCardSaved,
  editMode,
}: AddEditBeepCardDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty }, // Use dirty flag to check if the form has changes
    setValue,
    getValues,
    reset,
  } = useForm<BeepCardInput>({
    defaultValues: {
      UUIC: beepCardToEdit?.UUIC || generateDefaultNumber(),
      balance: editMode ? beepCardToEdit?.balance : 0,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">("success");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const [addedValue, setAddedValue] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const setDefaultValues = async () => {
      setValue("UUIC", beepCardToEdit?.UUIC || generateDefaultNumber());

      if (beepCardToEdit?.balance !== undefined) {
        if (editMode) {
          setValue("balance", beepCardToEdit.balance);
        } else {
          const defaultBalance = await getDefaultLoadPrice();
          setValue("balance", defaultBalance);
        }
      }
      setIsLoading(false);
    };

    setDefaultValues();
  }, [beepCardToEdit, setValue, editMode]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowAlert(false);
      setAlertMessage(null);
    }, 1300);

    return () => clearTimeout(timeoutId);
  }, [showAlert]);

  const setDefaultBalance = async () => {
    if (!beepCardToEdit) {
      const defaultLoadPrice = await getDefaultLoadPrice();
      setValue("balance", defaultLoadPrice);
      return defaultLoadPrice;
    }
  };

  const showAlertMessage = (variant: "success" | "danger", message: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const showConfirmation = () => {
    const balance = parseInt(getValues("balance") as unknown as string, 10);
    setPreviousBalance(beepCardToEdit?.balance || 0);
    setAddedValue(balance);
    setShowConfirmationModal(true);
    setConfirming(true); // Set confirming to true when "Show Confirmation" is clicked
  };

  const handleConfirmation = async () => {
    setShowConfirmationModal(false);
    const input = getValues();
    await onSubmit(input);
  };

  const generateNumber = () => {
    setValue("UUIC", generateDefaultNumber());
  };

  const onSubmit = async (input: BeepCardInput) => {
    if (editMode && !isDirty) {
      showAlertMessage("danger", "No changes made. Please modify the beep card data.");
      return;
    }

    setIsLoading(true);
    const defaultLoadPrice = await getDefaultLoadPrice();
    try {
      if (!beepCardToEdit) {
        if (!input.UUIC || !/^\d{15}$/.test(input.UUIC)) {
          showAlertMessage(
            "danger",
            "Invalid UUIC format. Please enter 15 digits."
          );
          return;
        }

        input.balance = await getDefaultLoadPrice();
      } else {
        if (
          input.UUIC === beepCardToEdit.UUIC &&
          parseFloat(input.balance.toString()) === beepCardToEdit.balance
          && editMode
        ) {
          showAlertMessage("danger", "No changes made. Please modify the beep card data.");
          return;
        }

        if (!/^637805\d{9}$/.test(input.UUIC)) {
          showAlertMessage(
            "danger",
            "Invalid UUIC format. Must start with '637805' and have 15 digits."
          );
          return;
        }
      }

      const balanceValue = parseInt(input.balance as unknown as string, 10);
      if (
        isNaN(balanceValue) ||
        balanceValue < defaultLoadPrice ||
        balanceValue > 5000
      ) {
        showAlertMessage(
          "danger",
          `Invalid balance. It should be between ${defaultLoadPrice} and 5000.`
        );
        setShowConfirmationModal(false);
        return;
      }

      let beepCardResponse: BeepCard;
      if (beepCardToEdit) {
        if (editMode) {
          beepCardResponse = await BeepCardsApi.updateBeepCard(
            beepCardToEdit._id,
            input
          );
        } else {
          const newBalance = beepCardToEdit.balance! + balanceValue;
          beepCardResponse = await BeepCardsApi.updateBeepCard(
            beepCardToEdit._id,
            { ...input, balance: newBalance }
          );
        }
      } else {
        beepCardResponse = await BeepCardsApi.createBeepCard(input);
      }

      onBeepCardSaved(beepCardResponse);
    } catch (error: any) {
      console.error(error);

      if (error.message === "Network Error") {
        showAlertMessage(
          "danger",
          "No connection. Please check your internet connection."
        );
      } else if (error.response && error.response.status === 409) {
        showAlertMessage(
          "danger",
          "Error: Duplicate UUIC. Please use a different UUIC."
        );
      } else {
        showAlertMessage(
          "danger",
          "Error saving Beep Card. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show onHide={onDismiss} centered className={styles.modalContent}>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={`${styles.modalTitle} modal-title`}>
          {beepCardToEdit
            ? editMode
              ? "Edit Beep Card"
              : "Load Beep Card"
            : "Add Beep Card"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${styles.modalBody} modal-body`}>
        {isLoading ? (
          <div className={styles.loadingcontainer}>
           <Spinner animation="border" variant="secondary" />
          </div>
        ) : (
          <Form id="addEditBeepCardForm" onSubmit={handleSubmit(onSubmit)}>
            <BeepCardFormFields
              editMode={editMode}
              beepCardToEdit={beepCardToEdit}
              register={register}
              errors={errors}
              generateNumber={generateNumber}
              isSubmitting={isSubmitting}
              confirming={confirming}
            />
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className={`${styles.modalFooter} modal-footer`}>
        {beepCardToEdit ? (
          editMode ? (
            <Button
              type="submit"
              form="addEditBeepCardForm"
              disabled={isSubmitting}
              onClick={setDefaultBalance}
              className={`btn-primary ${styles.primaryButton} d-flex align-items-center`}
            >
              {isSubmitting && (
                <>
                  <Spinner
                    animation="border"
                    variant="secondary"
                    size="sm"
                    className={`${styles.loadingcontainer}`}
                  />
                  <span className="ml-2">Updating...</span>
                </>
              )}
              {!isSubmitting && 'Update'}
            </Button>
          ) : (
            !isLoading ? (
              <Button
                variant="primary"
                onClick={showConfirmation}
                disabled={isSubmitting || confirming}
                className={`btn-primary ${styles.primaryButton} d-flex align-items-center`}
              >
                {confirming && (
                  <>
                    <Spinner
                      animation="border"
                      variant="secondary"
                      size="sm"
                      className={`${styles.loadingcontainer}`}
                    ><span className="ml-2">Updating...</span></Spinner>
                  </>
                )}
                {!confirming && 'Confirm'}
              </Button>
            ) : null
          )
        ) : (
          <Button
            type="submit"
            form="addEditBeepCardForm"
            disabled={isSubmitting}
            onClick={setDefaultBalance}
            className={`btn-primary ${styles.primaryButton} d-flex align-items-center`}
          >
            {isSubmitting && (
              <>
                <Spinner
                  animation="border"
                  variant="secondary"
                  size="sm"
                  className={`${styles.loadingcontainer}`}
                />
                <span className="ml-2">Creating Beep Card...</span>
              </>
            )}
            {!isSubmitting && 'Create'}
          </Button>
        )}
      </Modal.Footer>

      {showAlert && (
        <AlertComponent
          variant={alertVariant}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      <ConfirmationModal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        previousBalance={previousBalance}
        addedValue={addedValue}
        onConfirmation={handleConfirmation}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default AddEditBeepCardDialog;