import { ReactElement, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Stations, Stations as StationsModel } from '../../model/stationsModel';
import * as StationsApi from '../../network/stationsAPI';
import { StationInput } from '../../network/stationsAPI';
import TextInputField from '../form/textInputFields';
import styles from './station.module.css';
import StationConnectedToModal from './stationConnectedToModal';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

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
	newStation,

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
	const [runOnce, setRunOnce] = useState(true)


	const [polylines, setPolylines] = useState<ReactElement[]>([]);
	const [showToast, setShowToast] = useState(false);

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
			try {
				const stationDetailsArray = await StationsApi.fetchStations(); // Replace with your actual API call to fetch all stations
				const stationDetails = stationDetailsArray.find(station => station._id === connectedStation);

				if (stationDetails) {
					const connectedStationDetails: Stations = {
						_id: stationDetails._id || '', // Replace with the actual property from the fetched station details
						stationName: stationDetails.stationName || '',
						coords: stationDetails.coords, // Provide default values (0 or any other suitable value)
						connectedTo: [stationToEdit?.stationName[i] || ''], // Replace with stationDetails.stationName
					};
					i++;
					newSelectedStations.push(connectedStationDetails);
					setSelectedStations(newSelectedStations);
				} else {
					console.error(`Station details not found for station ${connectedStation}`);
				}
			} catch (error) {
				console.error(`Error fetching details for station ${connectedStation}:`, error);
			}
		}

	};

	useEffect(() => {
		setDefaultValues();
		setRunOnce(false)
	}, [runOnce]);


	useEffect(() => {
		// When the selected stations change, update the connectedTo field
		setValue('connectedTo', selectedStations.map(station => station.stationName));
	}, [selectedStations, setValue]);

	const onSubmit = async (input: StationInput) => {
		try {
			// Check if it's a new station or an existing station
			let stationResponse: Stations;

			if (stationToEdit) {
				// Editing an existing station
				stationResponse = await StationsApi.updateStation(stationToEdit._id, {
					...input,
					connectedTo: selectedStations.map(station => station._id),
				});
			} else {
				// Adding a new station
				const newStationResponse = await StationsApi.createStation(input);

				// Update the new station with a valid ID
				const newStationWithID: StationsModel = {
					...newStationResponse,
					_id: newStationResponse._id || '',
				};

				stationResponse = newStationWithID;

				// Add the new station to the selected stations list
				setSelectedStations([...selectedStations, newStationWithID]);
			}

			// Send a bulk update to update connectedTo for all relevant stations
			const bulkUpdateStations = selectedStations.map((selectedStation) => {
				const updatedConnectedTo = [...selectedStation.connectedTo, stationResponse.stationName];
				return { ...selectedStation, connectedTo: updatedConnectedTo };
			});

			// If it's a new station, add it to the bulk update as well
			if (!stationToEdit) {
				bulkUpdateStations.push({
					_id: stationResponse._id,
					stationName: stationResponse.stationName,
					coords: stationResponse.coords,
					connectedTo: selectedStations.map(station => station.stationName),
				});
			}

			await StationsApi.updateStations(bulkUpdateStations);

			onStationSaved(stationResponse);
		} catch (error) {
			console.error(error);
			alert(error);
		}
	};

	const handleCoordinatesChange = (index: number, value: string) => {
		setValue(`coords.${index}`, parseFloat(value));
	};

	const handlePolylines = (polylines: any) => {
		setPolylines(polylines)
	}

	const handleStationSelection = async (station: StationsModel) => {
		// Check if the station is already in the selected stations list
		const isStationSelected = selectedStations.some(
			(selectedStation) => selectedStation._id === station._id
		);

		// Check if the station already exists in the selected stations list
		const isStationInList = selectedStations.some(
			(selectedStation) => selectedStation.stationName === station.stationName
		);

		// Check if the stationName of the marker is the same as the current station's stationName
		const isSameStation = stationToEdit && station._id === stationToEdit._id;

		// If the station is not already selected, doesn't exist in the list, and is not the same station, add it to the list
		if (!isStationSelected && !isStationInList && !isSameStation) {
			// Check if the stationName of the marker is the same as the current station's stationName
			const isSameStation = stationToEdit && station._id === stationToEdit._id;

			// If the station is not already selected, doesn't exist in the list, and is not the same station, add it to the list
			if (!isStationSelected && !isStationInList && !isSameStation) {
				// Update connectedTo for the selected station
				const updatedSelectedStation: StationsModel = {
					...station,
					connectedTo: [...station.connectedTo, stationToEdit?._id || ''],
				};

				// Update connectedTo for other stations in selectedStations
				const updatedStations = selectedStations.map((selectedStation) => ({
					...selectedStation,
					connectedTo: [...selectedStation.connectedTo, station._id],
				}));

				// If stationToEdit is present, update its connectedTo
				if (stationToEdit) {
					stationToEdit.connectedTo.push(station._id);
				}

				// Set the updated selected stations and update connectedTo for other stations
				setSelectedStations([updatedSelectedStation, ...updatedStations]);
			}

			if (!selectedStations.some((selectedStation) => selectedStation._id === station._id)) {
				if (stationToEdit && station._id !== stationToEdit._id) {
					const distance = L.latLng(stationToEdit.coords[0], stationToEdit.coords[1]).distanceTo(
						L.latLng(station.coords[0], station.coords[1])
					);

					if (distance > 500) {
						const polyline = (
							<Polyline
								key={`polyline-${station._id}`}
								positions={[
									[
										stationToEdit.coords[0],
										stationToEdit.coords[1],
									],
									[station.coords[0], station.coords[1]],
								]}
							/>
						);

						setPolylines((prevPolylines) => [
							...prevPolylines,
							polyline,
						]);
					} else {
						setShowToast(true);
					}
				} else if (newStation && station._id !== newStation._id) {
					const distance = L.latLng(newStation.coords[0], newStation.coords[1]).distanceTo(
						L.latLng(station.coords[0], station.coords[1])
					);

					if (distance > 500) {
						const polyline = (
							<Polyline
								key={`polyline-${station._id}`}
								positions={[
									[newStation.coords[0], newStation.coords[1]],
									[station.coords[0], station.coords[1]],
								]}
							/>
						);

						setPolylines((prevPolylines) => [
							...prevPolylines,
							polyline,
						]);
					} else {
						setShowToast(true);
					}
				}
			}
			setSelectedStations([...selectedStations, station]);
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
						<Form.Label>
							{selectedStations.length > 0 ? <>Connected Stations</> : <>No Connecting Stations</>}
						</Form.Label>

						<div>
							{selectedStations.map((station) => (
								<span
									key={`${Math.random()}${station._id}`}
									className={`${styles.badge} badge badge-pill badge-primary mr-2`}
									style={{
										background: '#0275d8',
										color: 'white',
										padding: '8px 16px',
										borderRadius: '20px',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
									}}
								>
									{station.stationName} {/* Display station name instead of ID */}
								</span>
							))}
						</div>
						<div className="mt-3">
							<Button variant="primary" onClick={openConnectedToModal} className='ms-auto'>
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
				newStation={stationToEdit ? null : newStation}
				stationToEdit={stationToEdit ? stationToEdit : null}
				polylines={polylines}
				setPolylines={handlePolylines}
				showToast={showToast}

			/>
		</Modal >
	);
};

export default AddEditStationDialog;
