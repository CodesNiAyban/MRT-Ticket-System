// addEditBeepCardDialog.tsx
import { Button, Form, Modal, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BeepCard } from "../../model/beepCardModel";
import * as BeepCardsApi from "../../network/beepCardAPI";
import { BeepCardInput } from "../../network/beepCardAPI";
import TextInputField from "../form/textInputFields";
import { useState, useEffect } from "react";

interface AddEditBeepCardDialogProps {
  beepCardToEdit?: BeepCard;
  onDismiss: () => void;
  onBeepCardSaved: (beepCard: BeepCard) => void;
}

const AddEditBeepCardDialog = ({
  beepCardToEdit,
  onDismiss,
  onBeepCardSaved,
}: AddEditBeepCardDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<BeepCardInput>({
    defaultValues: {
      UUIC: beepCardToEdit?.UUIC,
      balance: beepCardToEdit?.balance,
    },
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">(
    "success"
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowAlert(false);
      setAlertMessage(null);
    }, 1300);

    return () => clearTimeout(timeoutId);
  }, [showAlert]);

  async function onSubmit(input: BeepCardInput) {
    try {
      if (!beepCardToEdit) {
        // Check if UUIC is not generated
        if (!input.UUIC) {
          setAlertVariant("danger");
          setAlertMessage("Please generate UUIC before saving.");
          setShowAlert(true);
          return;
        }

        // Validate UUIC format
        if (!/^\d{15}$/.test(input.UUIC)) {
          setAlertVariant("danger");
          setAlertMessage("Invalid UUIC format. Please enter 15 digits.");
          setShowAlert(true);
          return;
        }

        input.balance = 10;
      }

      let beepCardResponse: BeepCard;
      if (beepCardToEdit) {
        if (
          input.UUIC === beepCardToEdit.UUIC &&
          input.balance === beepCardToEdit.balance
        ) {
          setAlertVariant("danger");
          setAlertMessage("Update is unchanged.");
          setShowAlert(true);
          return;
        }

        beepCardResponse = await BeepCardsApi.updateBeepCard(
          beepCardToEdit._id,
          input
        );
      } else {
        beepCardResponse = await BeepCardsApi.createBeepCard(input);
      }

      onBeepCardSaved(beepCardResponse);
    } catch (error: any) {
      console.error(error);

      if (error.message === "Network Error") {
        setAlertVariant("danger");
        setAlertMessage("No connection. Please check your internet connection.");
      } else if (error.response && error.response.status === 409) {
        setAlertVariant("danger");
        setAlertMessage("Error: Duplicate UUIC. Please use a different UUIC.");
      } else {
        setAlertVariant("danger");
        setAlertMessage("Error saving Beep Card. Please try again.");
      }

      setShowAlert(true);
    }
  }

  // Function to generate a random 15-digit number with "123456" as the prefix
  const generateNumber = () => {
    const generatedUUIC =
      "123456" +
      Math.floor(Math.random() * Math.pow(10, 9)).toString().padStart(9, "0");
    setValue("UUIC", generatedUUIC);
  };

  return (
    <Modal show onHide={onDismiss} centered>
      <Modal.Header closeButton>
        <Modal.Title>{beepCardToEdit ? "Edit beepCard" : "Add beepCard"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form id="addEditBeepCardForm" onSubmit={handleSubmit(onSubmit)}>
          <TextInputField
            name="UUIC"
            label="UUIC"
            type="text"
            placeholder="UUIC"
            register={register}
            registerOptions={{ required: "Required " }}
            errors={errors.UUIC}
            readOnly={beepCardToEdit ? false : true}
          />

          {!beepCardToEdit && (
            <div className="mb-3">
              <Button variant="secondary" onClick={generateNumber}>
                Generate Number
              </Button>
            </div>
          )}

          {beepCardToEdit && (
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="submit"
          form="addEditBeepCardForm"
          disabled={isSubmitting}
        >
          Save
        </Button>
      </Modal.Footer>

      {showAlert && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <Alert variant={alertVariant} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </div>
      )}
    </Modal>
  );
};

export default AddEditBeepCardDialog;