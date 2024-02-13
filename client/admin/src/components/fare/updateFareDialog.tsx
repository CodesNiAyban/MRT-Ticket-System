/* eslint-disable @typescript-eslint/no-redeclare */
// UpdateFareDialog.tsx
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Fare } from "../../model/fareModel";
import * as FaresApi from "../../network/fareAPI";
import TextInputField from "../form/textInputFields";
import styles from "./fare.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UpdateFareDialog {
    fareToEdit?: Fare;
    onDismiss: () => void;
    onFareSaved: (fare: Fare) => void;
}

const UpdateFareDialog: React.FC<UpdateFareDialog> = ({
    fareToEdit,
    onDismiss,
    onFareSaved,
}: UpdateFareDialog) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty }, // Include isDirty
    } = useForm<Fare>({
        defaultValues: {
            fareType: fareToEdit?.fareType || "",
            price: fareToEdit?.price || 0,
        },
    });

    async function onSubmit(input: Fare) {
        try {
            if (input.price < 1 || input.price > 5000) {
                toast.error(`Prices are only limited to 1 and 5000.`, {
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

            let fareResponse: Fare;
            if (fareToEdit) {
                if (!isDirty) {
                    toast.error(`Error saving ${input.fareType.toLocaleLowerCase()}. Please change price on update.`, {
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

                fareResponse = await FaresApi.updateFare(fareToEdit._id, input);
                onFareSaved(fareResponse);
                onDismiss(); // Trigger modal dismissal here
            }
        } catch (error: any) {
            console.error(error);

            if (error.message === "Network Error") {
                toast.error(`No connection or authentication expired, please reload page.`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error(`Error saving ${input.fareType.toLocaleLowerCase()}. Please try again.`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }

    return (
        <>
            <ToastContainer limit={3} />
            <Modal show onHide={onDismiss} centered className={`${styles.modalContent}`}>
                <Modal.Header closeButton className={styles.confirmationModalHeader}>
                    <Modal.Title className={`${styles.modalTitle} modal-title`} style={{ textTransform: 'capitalize' }}>
                        <Modal.Title className={`${styles.modalTitle} modal-title`} style={{ textTransform: 'capitalize' }}>
                            {`Edit ${fareToEdit?.fareType.split(' ').map(word => word.charAt(0).toUpperCase() + word.toLocaleLowerCase().slice(1)).join(' ')}`}
                        </Modal.Title>
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
            </Modal>
        </>
    );
};

export default UpdateFareDialog;
