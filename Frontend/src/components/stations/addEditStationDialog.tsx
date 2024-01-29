import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Stations } from '../../model/stationsModel';
import { StationInput } from '../../network/stationsAPI';
import * as StationsApi from '../../network/stationsAPI';
import TextInputField from '../form/textInputFields';

interface AddEditStationDialogProps {
    stationToEdit?: Stations | null;
    onDismiss: () => void;
    onStationSaved: (station: Stations) => void;
    coordinates?: [number, number] | null;
}

const AddEditStationDialog = ({
    stationToEdit,
    onDismiss,
    onStationSaved,
}: AddEditStationDialogProps) => {
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<StationInput>({
        defaultValues: {
            stationName: stationToEdit?.stationName || '',
            coords: stationToEdit?.coords || [0, 0],
            connectedTo: stationToEdit?.connectedTo || [],
        },
    });

    const [input, setInput] = useState({
        'coords.0': stationToEdit ? stationToEdit.coords[0].toString() : '0', // Set default value to '0' if not in edit mode
        'coords.1': stationToEdit ? stationToEdit.coords[1].toString() : '0', // Set default value to '0' if not in edit mode
        // ... other state properties
    });

    useEffect(() => {
        const setDefaultValues = async () => {
            setValue('stationName', stationToEdit?.stationName || '');
            setValue('coords.0', stationToEdit?.coords[0] || 0);
            setValue('coords.1', stationToEdit?.coords[1] || 0);
            setValue('connectedTo', stationToEdit?.connectedTo || []);
        };
        setDefaultValues();
    }, [stationToEdit]);

    const handleCoordinatesChange = (index: number, value: string) => {
        setValue(`coords.${index}`, parseFloat(value));
    };

    const onSubmit = async (input: StationInput) => {
        try {
            let stationResponse: Stations;
            if (stationToEdit) {
                // Editing an existing station
                stationResponse = await StationsApi.updateStation(stationToEdit._id, input);
            } else {
                // Adding a new station
                stationResponse = await StationsApi.createStation(input);
            }
            onStationSaved(stationResponse);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };

    return (
        <Modal show onHide={onDismiss}>
            <Modal.Header closeButton>
                <Modal.Title>{stationToEdit ? 'Edit station' : 'Add station'}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form id="addEditStationForm" onSubmit={handleSubmit(onSubmit)}>
                    <TextInputField
                        name="stationName"
                        label="Station Name"
                        type="text"
                        placeholder="Title"
                        register={register}
                        registerOptions={{ required: 'Required' }}
                        error={errors.stationName}
                    />

                    <Form.Group className="mb-3">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Latitude"
                            isInvalid={!!errors.coords}
                            value={parseFloat(input['coords.0'])}
                            onChange={(e) => handleCoordinatesChange(0, e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.coords?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Longitude"
                            isInvalid={!!errors.coords}
                            value={parseFloat(input['coords.1'])}
                            onChange={(e) => handleCoordinatesChange(1, e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.coords?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Connect Stations</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Put Array of Strings Here"
                            isInvalid={!!errors.connectedTo}
                            {...register('connectedTo', { required: 'Required' })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.connectedTo?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button type="submit" form="addEditStationForm" disabled={isSubmitting}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddEditStationDialog;
