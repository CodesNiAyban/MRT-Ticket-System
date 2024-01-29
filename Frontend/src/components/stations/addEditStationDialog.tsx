import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Stations } from '../../model/stationsModel';
import { StationInput } from '../../network/stationsAPI';
import * as StationsApi from '../../network/stationsAPI';
import TextInputField from '../form/textInputFields';
import { Stations as StationsModel } from '../../model/stationsModel';
import StationConnectedToModal from './stationConnectedToModal';

interface AddEditStationDialogProps {
    stationToEdit?: Stations | null;
    onDismiss: () => void;
    onStationSaved: (station: Stations) => void;
    coordinates?: [number, number] | null;
    setAdded: () => void
}

const AddEditStationDialog = ({
    stationToEdit,
    onDismiss,
    onStationSaved,
    coordinates,
    setAdded
}: AddEditStationDialogProps) => {
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<StationInput>({
        defaultValues: {
            stationName: stationToEdit?.stationName || '',
            coords: stationToEdit?.coords || [0, 0],
            connectedTo: stationToEdit?.connectedTo || [],
        },
    });

    const [showConnectedToModal, setShowConnectedToModal] = useState(false);
    const [selectedStations, setSelectedStations] = useState<StationsModel[]>([]);

    const handleStationSelection = (station: StationsModel) => {
        setSelectedStations([...selectedStations, station]);
    };

    const handleRemoveStation = (station: StationsModel) => {
        setSelectedStations(selectedStations.filter((s) => s.stationName !== station.stationName));
    };

    const openConnectedToModal = () => {
        setShowConnectedToModal(true);
    };

    const closeConnectedToModal = () => {
        setShowConnectedToModal(false);
    };

    useEffect(() => {
        // When the selected stations change, update the connectedTo field
        setValue('connectedTo', selectedStations.map(station => station.stationName));
    }, [selectedStations, setValue]);

    const onSubmit = async (input: StationInput) => {
        try {
            // Create a new input object with connectedTo as an array of strings
            const updatedInput = { ...input, connectedTo: input.connectedTo };

            let stationResponse: Stations;
            if (stationToEdit) {
                // Editing an existing station
                stationResponse = await StationsApi.updateStation(stationToEdit._id, updatedInput);
                setAdded()
            } else {
                // Adding a new station
                stationResponse = await StationsApi.createStation(updatedInput);
            }
            onStationSaved(stationResponse);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };

    // Ensure that coordinates is an array before trying to access its elements
    const initialLatitude = coordinates && coordinates.length > 1 ? coordinates[0] : 0;
    const initialLongitude = coordinates && coordinates.length > 1 ? coordinates[1] : 0;

    const [input, setInput] = useState({
        'coords.0': stationToEdit ? stationToEdit.coords[0].toString() : initialLatitude.toString(),
        'coords.1': stationToEdit ? stationToEdit.coords[1].toString() : initialLongitude.toString(),
    });

    useEffect(() => {
        const setDefaultValues = async () => {
            setValue('stationName', stationToEdit?.stationName || '');
            setValue('coords.0', stationToEdit?.coords[0] || initialLatitude);
            setValue('coords.1', stationToEdit?.coords[1] || initialLongitude);
            setValue('connectedTo', stationToEdit?.connectedTo || []);
        };
        setDefaultValues();
    }, [stationToEdit]);

    const handleCoordinatesChange = (index: number, value: string) => {
        setValue(`coords.${index}`, parseFloat(value));
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
                            value={selectedStations.map((station) => station.stationName).join(', ')}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.connectedTo?.message}
                        </Form.Control.Feedback>
                        <Button variant="primary" onClick={openConnectedToModal}>
                            Select Stations
                        </Button>
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button type="submit" form="addEditStationForm" disabled={isSubmitting}>
                    Save
                </Button>
            </Modal.Footer>

            <StationConnectedToModal
                show={showConnectedToModal}
                onHide={closeConnectedToModal}
                onStationSelection={handleStationSelection}
                selectedStations={selectedStations}
                onRemoveStation={handleRemoveStation}
            />

        </Modal>
    );
};

export default AddEditStationDialog;
