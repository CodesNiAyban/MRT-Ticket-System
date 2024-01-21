// addEditBeepCardDialog.tsx
import { Button, Form, Modal, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BeepCard } from "../../model/beepCardModel";
import * as BeepCardsApi from "../../network/beepCardAPI";
import { BeepCardInput } from "../../network/beepCardAPI";
import TextInputField from "../form/textInputFields";
import { useState, useEffect } from "react";
import * as FareApi from "../../network/fareAPI"; // Import the FareApi to fetch fares

interface AddEditBeepCardDialogProps {
  beepCardToEdit?: BeepCard;
  onDismiss: () => void;
  onBeepCardSaved: (beepCard: BeepCard) => void;
}

// Function to generate a random 15-digit number with "123456" as the prefix
const generateDefaultNumber = () => {
  const generatedUUIC =
    "123456" +
    Math.floor(Math.random() * Math.pow(10, 9)).toString().padStart(9, "0");
  return generatedUUIC;
};

// Function to get the price for "Default Load" fare type
const getDefaultLoadPrice = async () => {
  try {
    const fares = await FareApi.fetchFare();
    const defaultLoadFare = fares.find((fare) => fare.fareType === "Default Load");
    return defaultLoadFare ? defaultLoadFare.price : 10; // Set a default value if not found
  } catch (error) {
    console.error(error);
    return 10; // Set a default value in case of an error
  }
};

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
      UUIC: beepCardToEdit?.UUIC || generateDefaultNumber(),
      balance: beepCardToEdit?.balance,
    },
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">("success");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowAlert(false);
      setAlertMessage(null);
    }, 1300);

    return () => clearTimeout(timeoutId);
  }, [showAlert]);

  const setDefaultBalance = async () => {
    const defaultLoadPrice = await getDefaultLoadPrice();
    setValue("balance", defaultLoadPrice);
    return defaultLoadPrice
  };

  async function onSubmit(input: BeepCardInput) {
    try {
      if (!beepCardToEdit) {
        if (!input.UUIC) {
          setAlertVariant("danger");
          setAlertMessage("Please generate UUIC before saving.");
          setShowAlert(true);
          return;
        }

        if (!/^\d{15}$/.test(input.UUIC)) {
          setAlertVariant("danger");
          setAlertMessage("Invalid UUIC format. Please enter 15 digits.");
          setShowAlert(true);
          return;
        }

        // Set the default balance to the price of "Default Load" fare type
        input.balance = await getDefaultLoadPrice();
      } else {
        if (!/^123456\d{9}$/.test(input.UUIC)) {
          setAlertVariant("danger");
          setAlertMessage(
            "Invalid UUIC format. Must start with '123456' and have 15 digits."
          );
          setShowAlert(true);
          return;
        }
      }

      const balanceValue = parseInt(input.balance as unknown as string, 10);
      if (isNaN(balanceValue) || balanceValue < 10 || balanceValue > 5000) {
        setAlertVariant("danger");
        setAlertMessage("Invalid balance. It should be between 10 and 5000.");
        setShowAlert(true);
        return;
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
        setAlertMessage(
          "No connection. Please check your internet connection."
        );
      } else if (error.response && error.response.status === 409) {
        setAlertVariant("danger");
        setAlertMessage(
          "Error: Duplicate UUIC. Please use a different UUIC."
        );
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
        <Modal.Title>{beepCardToEdit ? "Edit Beep Card™" : "Add Beep Card™"}</Modal.Title>
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
          />

          {!beepCardToEdit && (
            <div className="mb-3">
              <Button variant="secondary" onClick={generateNumber}>
                Generate Account Number
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
          onClick={setDefaultBalance}
        >
          Save
        </Button>
      </Modal.Footer>

      {showAlert && (
        <div className="position-fixed top-0 start-50 translate-middle-x">
          <Alert variant={alertVariant} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </div>
      )}
    </Modal>
  );
};

export default AddEditBeepCardDialog;
