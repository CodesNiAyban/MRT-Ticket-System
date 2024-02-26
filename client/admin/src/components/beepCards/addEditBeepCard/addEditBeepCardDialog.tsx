// AddEditBeepCardDialog.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BeepCard } from "../../../model/beepCardModel";
import * as BeepCardsApi from "../../../network/beepCardAPI";
import { BeepCardInput } from "../../../network/beepCardAPI";
import styles from "././addEditBeepCardDialog.module.css";
import {
  generateDefaultNumber,
  getDefaultLoadPrice,
} from "./addEditBeepCardConstants";
import BeepCardFormFields from "./addEditBeepCardFormFields";
import ConfirmationModal from "./addEditCardConfirmModal";


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
  } = useForm<BeepCardInput>({
    defaultValues: {
      UUIC: beepCardToEdit?.UUIC || generateDefaultNumber(),
      userID: beepCardToEdit?.userID || '', // Set default value for userID
      balance: editMode ? beepCardToEdit?.balance : 0,
      isActive: editMode ? beepCardToEdit?.isActive : false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isActive, setisActive] = useState<boolean>(false);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const [addedValue, setAddedValue] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [generatedNumber, setGeneratedNumber] = useState<string>()

  useEffect(() => {
    return () => toast.dismiss();
  }, []);


  useEffect(() => {
    setIsLoading(true);
    const setDefaultValues = async () => {
      setValue("UUIC", beepCardToEdit?.UUIC || generateDefaultNumber());
      if (beepCardToEdit?.balance !== undefined) {
        if (editMode) {
          setValue("userID", beepCardToEdit.userID);
          setValue("balance", beepCardToEdit.balance);
          setisActive(beepCardToEdit?.isActive || false);
        } else {
          const defaultBalance = await getDefaultLoadPrice();
          setValue("userID", beepCardToEdit.userID);
          setValue("balance", defaultBalance);
          setValue("isActive", false);
        }
      }
      setIsLoading(false);
    };

    setDefaultValues();
  }, [beepCardToEdit, setValue, editMode]);

  const setDefaultBalance = async () => {
    if (!beepCardToEdit) {
      const defaultLoadPrice = await getDefaultLoadPrice();
      setValue("balance", defaultLoadPrice);
    }
  };

  const showConfirmation = () => {
    const balance = parseInt(getValues("balance") as unknown as string);
    setPreviousBalance(beepCardToEdit?.balance || 0);
    setAddedValue(balance);
    setShowConfirmationModal(true);
  };

  const handleConfirmation = async () => {
    setConfirming(true);
    setShowConfirmationModal(false);
    const input = getValues();
    await onSubmit(input);
  };

  const generateNumber = () => {
    setGeneratedNumber(generateDefaultNumber())
    setValue("UUIC", generatedNumber!);
  };

  const onSubmit = async (input: BeepCardInput) => {
    if (editMode && !isDirty) {
      // showAlertMessage("danger", "No changes made. Please modify the beep card data.");
      toast.error("No changes made.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setIsLoading(true);
    const defaultLoadPrice = await getDefaultLoadPrice();
    try {
      if (!beepCardToEdit) {
        if (!input.UUIC || !/^\d{15}$/.test(input.UUIC)) {
          toast.error("Invalid Beep Card ID format. Please enter 15 digits.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }
          input.balance = await getDefaultLoadPrice();
      } else {
        if (!/^637805\d{9}$/.test(input.UUIC)) {
          toast.error("Invalid Beep Card ID format. Must start with '637805' and have 15 digits.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }
      }

      const balanceValue = parseInt(input.balance as unknown as string, 10);
      if (
        isNaN(balanceValue) ||
        balanceValue < defaultLoadPrice ||
        balanceValue > 999999
      ) {
        toast.error(`Invalid balance. It should be between ${defaultLoadPrice} and 999999.`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
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
        toast.error("No connection. Please check your internet connection.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else if (error.response && error.response.status === 409) {
        toast.error("Duplicate Beep Card ID. Please use a different Beep Card ID.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("Error saving Beep Card. Please try again. Make sure that input ID's are unique.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      setIsLoading(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <ToastContainer limit={3} />
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
                    <>Updating...</>
                  )}
                  {!confirming && 'Show Confirmation'}
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
    </>
  );
};

export default AddEditBeepCardDialog;