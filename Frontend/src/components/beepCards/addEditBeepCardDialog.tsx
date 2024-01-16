import { Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BeepCard } from "../../model/beepCardModel";
import * as BeepCardsApi from "../../network/beepCardAPI";
import { BeepCardInput } from "../../network/beepCardAPI";
import TextInputField from "../form/textInputFields";

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

    async function onSubmit(input: BeepCardInput) {
        try {
            let beepCardResponse: BeepCard;
            if (beepCardToEdit) {
                beepCardResponse = await BeepCardsApi.updateBeepCard(beepCardToEdit._id, input);
            } else {
                beepCardResponse = await BeepCardsApi.createBeepCard(input);
            }
            onBeepCardSaved(beepCardResponse);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    return (
        <Modal show onHide={onDismiss}>
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
        </Modal>
    );
}

export default AddEditBeepCardDialog;