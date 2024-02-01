import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Stations, Stations as StationsModel } from '../../model/stationsModel';
import * as StationsApi from '../../network/stationsAPI';
import { StationInput } from '../../network/stationsAPI';
import TextInputField from '../form/textInputFields';
import styles from './station.module.css';
import StationConnectedToModal from './stationConnectedToModal';

interface AddEditStationDialogProps {
	stationToEdit?: Stations | null;
	onDismiss: () => void;
	onStationSaved: (station: Stations) => void;
	coordinates?: [number, number] | null;
	newStation: StationsModel | null;
}

const AddEditStationDialog = ({
	stationToEdit,
	onDismiss,
	onStationSaved,
	coordinates,
	newStation
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

	const initialLatitude = coordinates && coordinates.length > 1 ? coordinates[0] : 0;
	const initialLongitude = coordinates && coordinates.length > 1 ? coordinates[1] : 0;

	const [input, setInput] = useState({
		'coords.0': stationToEdit ? stationToEdit.coords[0].toString() : initialLatitude.toString(),
		'coords.1': stationToEdit ? stationToEdit.coords[1].toString() : initialLongitude.toString(),
	});

	const setDefaultValues = async () => {
		setValue('stationName', stationToEdit?.stationName || '');
		setValue('coords.0', stationToEdit?.coords[0] || initialLatitude);
		setValue('coords.1', stationToEdit?.coords[1] || initialLongitude);

		// Handle the connectedTo field
		const connectedToStations = stationToEdit?.connectedTo || [];

		// Explicitly define the type of selectedStations
		const newSelectedStations: Stations[] = [];
		let i: number = 0;
		for (const connectedStation of connectedToStations) {

			const connectedStationDetails: Stations = {
				_id: '', // You may need to replace this with an appropriate default value
				stationName: connectedStation,
				coords: [0, 0], // Provide default values (0 or any other suitable value)
				connectedTo: [stationToEdit?.stationName[i] || ''], // Replace with connectedStation

			};
			i++;
			newSelectedStations.push(connectedStationDetails);
		}

		setSelectedStations(newSelectedStations);
	};

	useEffect(() => {
		setDefaultValues();
	}, [stationToEdit]);


	useEffect(() => {
		// When the selected stations change, update the connectedTo field
		setValue('connectedTo', selectedStations.map(station => station.stationName));
	}, [selectedStations, setValue]);

	const onSubmit = async (input: StationInput) => {
		try {
			// Create a new input object with connectedTo as an array of strings
			const updatedInput = { ...input, connectedTo: selectedStations.map(station => station.stationName) };

			let stationResponse: Stations;
			if (stationToEdit) {
				// Editing an existing station
				stationResponse = await StationsApi.updateStation(stationToEdit._id, updatedInput);
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

	const handleCoordinatesChange = (index: number, value: string) => {
		setValue(`coords.${index}`, parseFloat(value));
	};

	const handleStationSelection = (station: StationsModel) => {
		// Check if the station is already in the selected stations list
		const isStationSelected = selectedStations.some(
			(selectedStation) => selectedStation._id === station._id
		);

		// If the station is not already selected, add it to the list
		if (!isStationSelected) {
			setSelectedStations([...selectedStations, station]);
		} else {
			// If the station is already selected, remove it from the list
			const updatedSelectedStations = selectedStations.filter(
				(selectedStation) => selectedStation._id !== station._id
			);
			setSelectedStations(updatedSelectedStations);
		}
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
						<Form.Label> {selectedStations.length > 0 ? <>Connected Stations</> : <>No Connecting Stations</>}</Form.Label>

						<div>
							{selectedStations.map((station) => (
								<span key={`${Math.random()}${station._id}`} className={`${styles.badge} badge badge-pill badge-primary mr-2`}
									style={{
										background: '#0275d8',
										color: 'white',
										padding: '8px 16px',
										borderRadius: '20px',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
									}}
								>
									{station.stationName}
								</span>
							))}
						</div>
						<div className="mt-3"><Button variant="primary" onClick={openConnectedToModal} className='ms-auto'>
							{selectedStations.length > 0 ? <>Edit Connecting Stations</> : <>Add Connecting Station/s</>}
						</Button>
						</div>
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
				onClearSelectedStations={() => setSelectedStations([])}
				newStation={stationToEdit ? null : newStation} // Pass the new station
				stationToEdit={stationToEdit ? stationToEdit : null}
			/>
		</Modal >
	);
};

export default AddEditStationDialog;
