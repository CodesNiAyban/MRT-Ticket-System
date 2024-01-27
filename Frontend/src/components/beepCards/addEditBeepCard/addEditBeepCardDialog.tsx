// AddEditBeepCardDialog.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
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
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<BeepCardInput>({
    defaultValues: {
      UUIC: beepCardToEdit?.UUIC || generateDefaultNumber(),
      balance: editMode ? beepCardToEdit?.balance : 0,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">(
    "success"
  );

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const [addedValue, setAddedValue] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowAlert(false);
      setAlertMessage(null);
    }, 1300);

    return () => clearTimeout(timeoutId);
  }, [showAlert]);

  const setDefaultBalance = async () => {
    if (!beepCardToEdit) {
      // setIsLoading(true);
      const defaultLoadPrice = await getDefaultLoadPrice();
      setValue("balance", defaultLoadPrice);
      // setIsLoading(false);
      return defaultLoadPrice;
    }
  };

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

  const showAlertMessage = (variant: "success" | "danger", message: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const showConfirmation = () => {
    setIsLoading(true);
    const balance = parseInt(getValues("balance") as unknown as string, 10);
    setPreviousBalance(beepCardToEdit?.balance || 0);
    setAddedValue(balance);
    setShowConfirmationModal(true);
        setIsLoading(true);
  };

  const handleConfirmation = async () => {
    setIsLoading(true);
    setShowConfirmationModal(false);
    const input = getValues();
    await onSubmit(input);
    setIsLoading(false);
  };

  const onSubmit = async (input: BeepCardInput) => {
    const defaultLoadPrice = await getDefaultLoadPrice();
    try {
      setIsLoading(true);
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

  const generateNumber = () => {
    setValue("UUIC", generateDefaultNumber());
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
          <p>Loading...</p>
        ) : (
          <Form id="addEditBeepCardForm" onSubmit={handleSubmit(onSubmit)}>
            <BeepCardFormFields
              editMode={editMode}
              beepCardToEdit={beepCardToEdit}
              register={register}
              errors={errors}
              setValue={setValue}
              generateNumber={generateNumber}
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
              className={`btn-primary ${styles.primaryButton}`}
            >
              Save
            </Button>
          ) : (
            !isLoading ? (
              // Render the button when isLoading is true
              <Button
                variant="primary"
                onClick={showConfirmation}
                disabled={isSubmitting}
                className={`btn-primary ${styles.secondaryButton}`}
              >
                Show Confirmation
              </Button>
            ) : null
          )
        ) : (
          <Button
            type="submit"
            form="addEditBeepCardForm"
            disabled={isSubmitting}
            onClick={setDefaultBalance}
            className={`btn-primary ${styles.primaryButton}`}
          >
            Create
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
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default AddEditBeepCardDialog;
