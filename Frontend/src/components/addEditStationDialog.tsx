import { Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form"
import { Stations } from "../model/stationsModel";
import { StationInput } from "../network/stationsAPI";
import * as StationsApi from "../network/stationsAPI"
// import TextInputField from "./form/textInputField";

interface AddEditStationDialogProps {
    stationToEdit?: Stations,
    onDismiss: () => void,
    onStationSaved: (station: Stations) => void,
}

const addEditStationDialog = ({ stationToEdit, onDismiss, onStationSaved }: AddEditStationDialogProps) => {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StationInput>({
        defaultValues: {
            stationName: stationToEdit?.stationName || "",
            connectedTo: stationToEdit?.connectedTo || [],
            coords: stationToEdit?.coords || [],
        }
    });

    async function onSubmit(input: StationInput) {
        try {
            let stationResponse: Stations;
            if (stationToEdit) {
                stationResponse = await StationsApi.updateStation(stationToEdit._id, input)
            }else{
                stationResponse = await StationsApi.createStation(input)
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
                    {stationToEdit ? "Edit Station" : "Add Station"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="addEditStationForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* <TextInputField 
                        name="title"
                        label="Title"
                        type="array"
                        placeholder="Title"
                        register={register}
                        registerOptions={{ required: "Required"}}
                        stationNameError={errors.stationName}
                        coordsError={errors.coords}
                        connectedToError={errors.connectedTo}
                    /> */}

                    <Form.Group className="mb-3">
                        <Form.Label>Station Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Put Station Name Here"
                            isInvalid={!!errors.coords}
                            {...register("stationName", { required: "Required" })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.stationName?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

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

                    <Modal.Footer>
                        <Button
                            type="submit"
                            form="addEditStationForm"
                            disabled={isSubmitting}
                        >
                            Save
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>

    );
}

export default addEditStationDialog;