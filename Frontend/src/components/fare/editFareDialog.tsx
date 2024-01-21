import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Fare } from "../../model/fareModel";
import * as FaresApi from "../../network/fareAPI";
import TextInputField from "../form/textInputFields";

interface EditFareDialogProps {
    fareToEdit?: Fare,
    onDismiss: () => void,
    onFareSaved: (fare: Fare) => void,
}

const EditFareDialogProps= ({ fareToEdit, onDismiss, onFareSaved }: EditFareDialogProps) => {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fare>({
        defaultValues: {
            fareType: fareToEdit?.fareType || "",
            price: fareToEdit?.price || 0,
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

    async function onSubmit(input: Fare) {
        try {
            let fareResponse: Fare;
            if (fareToEdit) {
                // Check if the update remains unchanged
                if (
                    input.fareType === fareToEdit.fareType &&
                    input.price === fareToEdit.price
                ) {
                    setAlertVariant('danger');
                    setAlertMessage('Update is unchanged.');
                    setShowAlert(true);
                    return;
                }

                fareResponse = await FaresApi.updateFare(fareToEdit._id, input);
                onFareSaved(fareResponse);
            }
        } catch (error: any) {
            console.error(error);

            if (error.message === "Network Error") {
                // Handle no connection error
                setAlertVariant('danger');
                setAlertMessage('No connection. Please check your internet connection.');
            } else if (error.response && error.response.status === 409) {
                // Handle duplicate fare error
                setAlertVariant('danger');
                setAlertMessage('Error: Duplicate fare. Please use a different fare.');
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
                    Edit Fare
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form id="editFareForm" onSubmit={handleSubmit(onSubmit)}>
                    <TextInputField
                        name="price"
                        label="Price"
                        type="number"
                        placeholder="Enter Fare:"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        errors={errors.price}
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    type="submit"
                    form="editFareForm"
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

export default EditFareDialogProps;