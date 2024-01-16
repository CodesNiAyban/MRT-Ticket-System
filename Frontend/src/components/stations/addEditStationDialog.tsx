import { Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form"
import { Stations } from "../../model/stationsModel";
import { StationInput } from "../../network/stationsAPI";
import * as StationsApi from "../../network/stationsAPI";
import TextInputField from "../form/textInputFields";

interface AddEditStationDialogProps {
    stationToEdit?: Stations,
    onDismiss: () => void,
    onStationSaved: (station: Stations) => void,
}

const AddEditStationDialog = ({ stationToEdit, onDismiss, onStationSaved }: AddEditStationDialogProps) => {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StationInput>({
        defaultValues: {
            stationName: stationToEdit?.stationName,
            coords: stationToEdit?.coords,
            connectedTo: stationToEdit?.connectedTo,
        }
    });

    async function onSubmit(input: StationInput) {
        try {
            let stationResponse: Stations;
            if (stationToEdit) {
                stationResponse = await StationsApi.updateStation(stationToEdit._id, input);
            } else {
                stationResponse = await StationsApi.createStation(input);
            }
            onStationSaved(stationResponse);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    return (
        <Modal show onHide={onDismiss}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {stationToEdit ? "Edit station" : "Add station"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form id="addEditStationForm" onSubmit={handleSubmit(onSubmit)}>
                    <TextInputField
                        name="stationName"
                        label="Station Name"
                        type="text"
                        placeholder="title"
                        register={register}
                        registerOptions={{ required: "Required " }}
                        error={errors.stationName}
                    />


                    <Form.Group className="mb-3">
                        <Form.Label>Coordinates</Form.Label>
                        <Form.Control
                            type="array"
                            placeholder="Put Array of Numbers Here"
                            isInvalid={!!errors.coords}
                            {...register("coords", { required: "Required" })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.coords?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Connect Stations</Form.Label>
                        <Form.Control
                            type="array"
                            placeholder="Put Array of Strings Here"
                            isInvalid={!!errors.connectedTo}
                            {...register("connectedTo", { required: "Required" })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.connectedTo?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    type="submit"
                    form="addEditStationForm"
                    disabled={isSubmitting}
                >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddEditStationDialog;