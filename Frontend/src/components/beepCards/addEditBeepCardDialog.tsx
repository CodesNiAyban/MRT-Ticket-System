import { Button, Form, Modal, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BeepCard } from "../../model/beepCardModel";
import * as BeepCardsApi from "../../network/beepCardAPI";
import { BeepCardInput } from "../../network/beepCardAPI";
import TextInputField from "../form/textInputFields";
import { useState, useEffect } from "react";
import * as FareApi from "../../network/fareAPI";
import styles from "./addEditBeepCardDialog.module.css";

interface AddEditBeepCardDialogProps {
  beepCardToEdit?: BeepCard;
  onDismiss: () => void;
  onBeepCardSaved: (beepCard: BeepCard) => void;
  editMode: boolean;
}

const generateDefaultNumber = () => {
  const generatedUUIC =
    "637805" +
    Math.floor(Math.random() * Math.pow(10, 9))
      .toString()
      .padStart(9, "0");
  return generatedUUIC;
};

const getDefaultLoadPrice = async () => {
  try {
    const fares = await FareApi.fetchFare();
    const defaultLoadFare = fares.find(
      (fare) => fare.fareType === "Default Load"
    );
    return defaultLoadFare?.price || 10;
  } catch (error) {
    console.error(error);
    return 10;
  }
};

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
      const defaultLoadPrice = await getDefaultLoadPrice();
      setValue("balance", defaultLoadPrice);
      return defaultLoadPrice;
    }
  };

  useEffect(() => {
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
    };

    setDefaultValues();
  }, [beepCardToEdit, setValue, editMode]);

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
  };

  const handleConfirmation = async () => {
    // Handle confirmation logic here
    setShowConfirmationModal(false);
    // Continue with the form submission or any other action
    const input = getValues();
    onSubmit(input);
  };

  const onSubmit = async (input: BeepCardInput) => {
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
        if (!/^637805\d{9}$/.test(input.UUIC)) {
          showAlertMessage(
            "danger",
            "Invalid UUIC format. Must start with '637805' and have 15 digits."
          );
          return;
        }
      }

      const balanceValue = parseInt(input.balance as unknown as string, 10);
      if (isNaN(balanceValue) || balanceValue < defaultLoadPrice || balanceValue > 5000) {
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
        showAlertMessage("danger", "Error saving Beep Card. Please try again.");
      }
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
            : "Add Beep Card™"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${styles.modalBody} modal-body`}>
        <Form id="addEditBeepCardForm" onSubmit={handleSubmit(onSubmit)}>
          {!editMode && beepCardToEdit ? (
            <>
              <TextInputField
                name="UUIC"
                label="UUIC"
                type="text"
                placeholder="UUIC"
                register={register}
                registerOptions={{ required: "Required " }}
                errors={errors.UUIC}
                disabled
              />
              <TextInputField
                name="balance"
                label={editMode && beepCardToEdit ? "Balance" : "Load Amount"}
                type="number"
                placeholder={editMode && beepCardToEdit ? "Balance" : "Default Load"}
                register={register}
                registerOptions={{ required: "Required " }}
                errors={errors.balance}
              />
            </>
          ) : (
            <>
              <TextInputField
                name="UUIC"
                label="UUIC"
                type="text"
                placeholder="UUIC"
                register={register}
                registerOptions={{ required: "Required " }}
                errors={errors.UUIC}
              />

              {!beepCardToEdit && (
                <div className="mb-3">
                  <Button variant="secondary" onClick={generateNumber}>
                    Generate Account Number
                  </Button>
                </div>
              )}

              {editMode && beepCardToEdit && (
                <TextInputField
                  name="balance"
                  label="Balance"
                  type="number"
                  placeholder="balance"
                  register={register}
                  registerOptions={{ required: "Required " }}
                  errors={errors.balance}
                />
              )}
            </>
          )}
        </Form>
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
            <Button
              variant="secondary"
              onClick={showConfirmation}
              disabled={isSubmitting}
              className={`btn-secondary ${styles.secondaryButton}`}
            >
              Show Confirmation
            </Button>
          )
        ) : (
          <Button
            type="submit"
            form="addEditBeepCardForm"
            disabled={isSubmitting}
            onClick={setDefaultBalance}
            className={`btn-primary ${styles.primaryButton}`}
          >
            Save
          </Button>
        )}
      </Modal.Footer>


      {showAlert && (
        <div className={`position-fixed top-0 start-50 translate-middle-x ${styles.alert}`}>
          <Alert variant={alertVariant} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </div>
      )}

      <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)} centered className={styles.confirmationModal}>
        <Modal.Header closeButton className={styles.confirmationModalHeader}>
          <Modal.Title className={`${styles.confirmationModalTitle} confirmation-modal-title`}>Load Confirmation</Modal.Title>
        </Modal.Header>

        <Modal.Body className={`${styles.confirmationModalBody} confirmation-modal-body`}>
          <p>Previous Balance: {previousBalance}</p>
          <p>Added Value: {addedValue}</p>
          <p>New Balance: {addedValue! + previousBalance!}</p>
        </Modal.Body>

        <Modal.Footer className={`${styles.confirmationModalFooter} confirmation-modal-footer`}>
          <Button variant="secondary" onClick={() => setShowConfirmationModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmation} disabled={isSubmitting}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default AddEditBeepCardDialog;
