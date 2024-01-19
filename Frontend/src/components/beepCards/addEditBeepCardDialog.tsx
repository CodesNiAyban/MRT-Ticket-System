import { Button, Form, Modal, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BeepCard } from "../../model/beepCardModel";
import * as BeepCardsApi from "../../network/beepCardAPI";
import { BeepCardInput } from "../../network/beepCardAPI";
import TextInputField from "../form/textInputFields";
import { useState, useEffect } from "react";

interface AddEditBeepCardDialogProps {
    beepCardToEdit?: BeepCard,
    onDismiss: () => void,
    onBeepCardSaved: (beepCard: BeepCard) => void,
}

const AddEditBeepCardDialog = ({ beepCardToEdit, onDismiss, onBeepCardSaved }: AddEditBeepCardDialogProps) => {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BeepCardInput>({
        defaultValues: {
            UUIC: beepCardToEdit?.UUIC,
            balance: beepCardToEdit?.balance
        }
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

    useEffect(() => {
        // Automatically hide the alert after 3 seconds
        const timeoutId = setTimeout(() => {
            setShowAlert(false);
            setAlertMessage(null);
        }, 1300);

        // Clear the timeout on unmount or when the modal is dismissed
        return () => clearTimeout(timeoutId);
    }, [showAlert]);

    async function onSubmit(input: BeepCardInput) {
        try {
            let beepCardResponse: BeepCard;
            if (beepCardToEdit) {
                // Check if the update remains unchanged
                if (
                    input.UUIC === beepCardToEdit.UUIC &&
                    input.balance === beepCardToEdit.balance
                ) {
                    setAlertVariant('danger');
                    setAlertMessage('Update is unchanged.');
                    setShowAlert(true);
                    return;
                }

                beepCardResponse = await BeepCardsApi.updateBeepCard(beepCardToEdit._id, input);
            } else {
                beepCardResponse = await BeepCardsApi.createBeepCard(input);
            }

            onBeepCardSaved(beepCardResponse);
        } catch (error: any) {
            console.error(error);

            if (error.message === "Network Error") {
                // Handle no connection error
                setAlertVariant('danger');
                setAlertMessage('No connection. Please check your internet connection.');
            } else if (error.response && error.response.status === 409) {
                // Handle duplicate UUIC error
                setAlertVariant('danger');
                setAlertMessage('Error: Duplicate UUIC. Please use a different UUIC.');
            } else {
                // Handle other errors
                setAlertVariant('danger');
                setAlertMessage('Error saving Beep Card. Please try again.');
            }

            setShowAlert(true);
        }
    }

    return (
        <Modal show onHide={onDismiss} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {beepCardToEdit ? "Edit beepCard" : "Add beepCard"}
                </Modal.Title>
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

                    <TextInputField
                        name="balance"
                        label="Balance"
                        type="number"
                        placeholder="balance"
                        register={register}
                        registerOptions={{ required: "Required " }}
                        errors={errors.balance}
                    />

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

            {/* Bootstrap Alert for Success/Error Messages */}
            {showAlert && (
                <div className="position-fixed top-50 start-50 translate-middle">
                    <Alert variant={alertVariant} onClose={() => setShowAlert(false)}>
                        {alertMessage}
                    </Alert>
                </div>
            )}
        </Modal>
    );
}

export default AddEditBeepCardDialog;