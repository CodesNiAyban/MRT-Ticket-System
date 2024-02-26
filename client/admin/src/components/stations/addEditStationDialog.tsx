import L from 'leaflet';
import { ReactElement, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Polyline } from 'react-leaflet';
import { Stations, Stations as StationsModel } from '../../model/stationsModel';
import * as StationsApi from '../../network/stationsAPI';
import { StationInput } from '../../network/stationsAPI';
import TextInputField from '../form/textInputFields';
import styles from './station.module.css';
import StationConnectedToModal from './stationConnectedToModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddEditStationDialogProps {
	stationToEdit?: Stations;
	onDismiss: () => void;
	onStationSaved: (station: Stations) => void;
	coordinates?: [number, number] | null;
	newStation: StationsModel | null;
	stations: StationsModel[];
}

const AddEditStationDialog = ({
	stationToEdit,
	onDismiss,
	onStationSaved,
	coordinates,
	newStation,
	stations,
}: AddEditStationDialogProps) => {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting }
	} = useForm<StationInput>({
		defaultValues: {
			stationName: stationToEdit?.stationName || '',
			coords: stationToEdit?.coords || coordinates || [0, 0],
			connectedTo: stationToEdit?.connectedTo || [],
		},
	});

	const [showConnectedToModal, setShowConnectedToModal] = useState(false);
	const [selectedStations, setSelectedStations] = useState<StationsModel[]>([]);
	const [runOnce, setRunOnce] = useState(true)

	const [polylines, setPolylines] = useState<ReactElement[]>([]);

	const setDefaultValues = () => {
		setValue('stationName', stationToEdit?.stationName || '');

		// Handle the connectedTo field
		const connectedToStations = stationToEdit?.connectedTo || [];

		// Explicitly define the type of selectedStations
		const newSelectedStations: Stations[] = [];
		let i: number = 0;
		for (const connectedStation of connectedToStations) {
			try {
				const stationDetails = stations.find(station => station._id === connectedStation);

				if (stationDetails) {
					const connectedStationDetails: Stations = {
						_id: stationDetails._id || '',
						stationName: stationDetails.stationName || '',
						coords: stationDetails.coords,
						connectedTo: [connectedToStations[i] || ''],
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
		setValue('connectedTo', selectedStations.map(station => station._id));
	}, [selectedStations, setValue]);

	const onSubmit = async (input: StationInput) => {
		try {
			const updatedInput = {
				...input,
				connectedTo: input.connectedTo,
				stationName: input.stationName.toLowerCase(), // Convert station name to lowercase
			};

			let stationResponse: Stations;
			if (stationToEdit) {
				stationResponse = await StationsApi.updateStation(stationToEdit._id, updatedInput);
			} else {
				stationResponse = await StationsApi.createStation(updatedInput);
			}
			onStationSaved(stationResponse);
		} catch (error) {
			console.error(error);
			alert(error);
		}
	};

	const handlePolylines = (polylines: any) => {
		setPolylines(polylines)
	}

	const handleStationSelection = async (station: StationsModel) => {
		const isCurrentStationToEdit = stationToEdit && stationToEdit.stationName === station.stationName;
		if (!isCurrentStationToEdit) {
			if (!selectedStations.some((selectedStation) => selectedStation._id === station._id)) {
				// If stationToEdit is present, update its connectedTo
				if (stationToEdit) {
					stationToEdit.connectedTo.push(station._id);
				}

				if (stationToEdit && station._id !== stationToEdit._id) {
					const distance = L.latLng(stationToEdit.coords[0], stationToEdit.coords[1]).distanceTo(
						L.latLng(station.coords[0], station.coords[1])
					);

					if (distance > 500) {
						const polyline = (
							<Polyline
								key={`polyline-${station._id}`}
								positions={[
									[stationToEdit.coords[0], stationToEdit.coords[1],],
									[station.coords[0], station.coords[1]],
								]}
							/>
						);

						setPolylines((prevPolylines) => [
							...prevPolylines,
							polyline,
						]);
						setSelectedStations([...selectedStations, station]);
					} else {
						toast.error("Stations cannot be connected less than 500m.", {
							position: "top-right",
							autoClose: 1500,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
						});
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
						setSelectedStations([...selectedStations, station]);
					} else {
						toast.error("Stations cannot be connected less than 500m.", {
							position: "top-right",
							autoClose: 1500,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
						});
					}
				}
			}
		}
	}; // FIX STRUCTURE //SIMPLIFY

	const handleRemoveStationName = (stationName: string, stationId: string) => {
		// Find the clicked station in selectedStations array
		const stationToRemove = selectedStations.find(
			(station) => station._id === stationId
		);

		if (stationToRemove) {
			setSelectedStations(selectedStations.filter((s) => s._id !== stationId));

			// Remove the corresponding polylines when a station is removed
			setPolylines((prevPolylines) =>
				prevPolylines.filter((polyline) => {
					const polylineStationIds = polyline.key?.split('-');
					return !polylineStationIds?.includes(stationId || "");
				})
			);
		}
	};


	const handleRemoveStation = (station: StationsModel) => {
		setSelectedStations(selectedStations.filter((s) => s._id !== station._id));
	};

	const openConnectedToModal = () => {
		setShowConnectedToModal(true);
	};

	const closeConnectedToModal = () => {
		setShowConnectedToModal(false);
	};

	return (
		<Modal show onHide={onDismiss}  className={`${styles.modalContent} beep-card-modal`} centered>
			<Modal.Header closeButton className={styles.modalHeader}>
				<Modal.Title className={`${styles.modalTitle} modal-title`}>{stationToEdit ? 'Edit Station' : 'Add Station'}</Modal.Title>
			</Modal.Header>

			<Modal.Body className={`${styles.modalBody} modal-body`} style={{ zIndex: "999" }}>
				<Form id="addEditStationForm" onSubmit={handleSubmit(onSubmit)}>
					<TextInputField
						name="stationName"
						label="Station Name"
						type="text"
						placeholder="Title"
						register={register}
						registerOptions={{
							required: 'Required',
							maxLength: 50, // Limit to 10 characters
							pattern: {
								value: /^[a-zA-Z0-9\s]*$/, // Allow only alphanumeric characters and spaces
								message: 'Invalid input. Only alphanumeric characters and spaces are allowed.',
							},
						}}
						error={errors.stationName}
						transformInput={(value: string) => value.toLowerCase()} // Transform input to lowercase
					/>

					{/* Latitude form input */}
					<Form.Group className="mb-3">
						<Form.Label>Latitude</Form.Label>
						<Form.Control
							type="number"
							placeholder="Latitude"
							isInvalid={!!errors.coords}
							defaultValue={(coordinates?.[0] || stationToEdit?.coords[0] || 0).toString()}
							onChange={(e) => setValue('coords.0', parseFloat(e.target.value))}
						/>
						<Form.Control.Feedback type="invalid">
							{errors.coords?.message}
						</Form.Control.Feedback>
					</Form.Group>

					{/* Longitude form input */}
					<Form.Group className="mb-3">
						<Form.Label>Longitude</Form.Label>
						<Form.Control
							type="number"
							placeholder="Longitude"
							isInvalid={!!errors.coords}
							defaultValue={(coordinates?.[1] || stationToEdit?.coords[1] || 0).toString()}
							onChange={(e) => setValue('coords.1', parseFloat(e.target.value))}
						/>
						<Form.Control.Feedback type="invalid">
							{errors.coords?.message}
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>
							{selectedStations.length > 0 ? <>Connected Stations</> : <>No Connecting Stations</>}
						</Form.Label>

						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px' }}>
							{selectedStations.map((station) => (
								<span
									key={`${Math.random()}${station._id}`}
									className={`${styles.badge} badge badge-pill mr-2`}
									style={{
										background: '#4CAF50', // Change the background color
										color: '#FFFFFF', // Change the text color
										padding: '10px 20px', // Adjust padding
										borderRadius: '25px', // Adjust border radius
										boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Adjust box shadow
										border: '2px solid #4CAF50', // Adjust border color and width
										display: 'flex',
										cursor: 'pointer',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
									onClick={() => handleRemoveStationName(station.stationName, station._id)}
								>
									<span>{station.stationName}</span>
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
			<Modal.Footer className={`${styles.modalFooter} modal-footer`}>
				<Button type="submit" form="addEditStationForm" disabled={isSubmitting}>
					Save
				</Button>
			</Modal.Footer>
			{showConnectedToModal && (
				<StationConnectedToModal
					show={showConnectedToModal}
					onHide={closeConnectedToModal}
					onStationSelection={handleStationSelection}
					selectedStations={selectedStations}
					onRemoveStation={handleRemoveStation}
					onClearSelectedStations={() => setSelectedStations([])}
					stations={stations}
					newStation={stationToEdit ? null : newStation}
					stationToEdit={stationToEdit ? stationToEdit : null}
					polylines={polylines}
					setPolylines={handlePolylines}
				/>
			)}
		</Modal >
	);
};

export default AddEditStationDialog;
