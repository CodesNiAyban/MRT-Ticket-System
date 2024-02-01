import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure this import for Leaflet styles
import { ReactElement, useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaPencilAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import AddEditStationDialog from './addEditStationDialog';
import styles from './station.module.css';
import MapEventHandler from './stationsCoordinates';

const StationPageLoggedInView = () => {
	const [stations, setStations] = useState<StationsModel[]>([]);
	const [stationsLoading, setStationsLoading] = useState(true);
	const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);

	const [showAddStationDialog, setShowAddStationDialog] = useState(false);
	const [stationToEdit, setStationToEdit] = useState<StationsModel | null>(null);

	const [searchTerm, setSearchTerm] = useState('');
	const [filteredStations, setFilteredStations] = useState<StationsModel[]>(stations);

	const [showConfirmation, setShowConfirmation] = useState(false);
	const [confirmationAction, setConfirmationAction] = useState<(() => void) | null>(null);
	const [confirmationTarget, setConfirmationTarget] = useState<StationsModel | null>(null);

	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [showAlert, setShowAlert] = useState(false);
	const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');
	const [isModalClosed, setIsModalClosed] = useState(false);

	const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
	const [newMapMarker, setNewMapMarker] = useState<ReactElement[]>([]);
	const [selectedMarker, setSelectedMarker] = useState<StationsModel | null>(null);
	const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
	const [polylines, setPolylines] = useState<ReactElement[]>([]);
	const [newStation, setNewStation] = useState<StationsModel | null>(null);

	const newCustomIcon = L.icon({
		iconUrl: '/newMarker.png',
		iconSize: [38, 44],
		iconAnchor: [17, 46], //[left/right, top/bottom]
		popupAnchor: [0, -46], //[left/right, top/bottom]
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [40, 40],
		shadowAnchor: [5, 46],
	});

	const customIcon = L.icon({
		iconUrl: 'https://react-component-depot.netlify.app/static/media/marker.a3b2d28b.png',
		iconSize: [40, 40],
		iconAnchor: [17, 46], //[left/right, top/bottom]
		popupAnchor: [0, -46], //[left/right, top/bottom]
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [40, 40],
		shadowAnchor: [10, 46],
	});

	useEffect(() => {
		async function loadStations() {
			try {
				setShowStationsLoadingError(false);
				setStationsLoading(true);
				const stations = await StationApi.fetchStations();
				setStations(stations);
				setFilteredStations(stations);
			} catch (error) {
				console.error(error);
				setShowStationsLoadingError(true);
			} finally {
				setStationsLoading(false);
			}
		}
		loadStations();
	}, []);

	useEffect(() => {
		if (clickedCoords) {
			const newMarker = (
				<Marker
					key="newMarker"
					position={clickedCoords}
					icon={newCustomIcon}
					eventHandlers={{
						click: () => handleNewMarkerClick(),
						mouseover: (event) => event.target.openPopup(),
						mouseout: (event) => event.target.closePopup(),
					}}
				>
					<Popup>
						NEW STATION<br />
						Click to create to coords <br />
						Latitude: {clickedCoords[1]}<br />
						Longitude: {clickedCoords[0]}<br />
					</Popup>
				</Marker>
			);

			setNewStation({
				_id: 'new', // Set a unique ID for the new station
				stationName: 'New Station',
				coords: [clickedCoords[0], clickedCoords[1]],
				connectedTo: [],
			});

			setNewMapMarker([newMarker]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clickedCoords]);

	useEffect(() => {
		const loadStationsAndMarkers = async () => {
			try {
				setShowStationsLoadingError(false);
				setStationsLoading(true);

				const stations = await StationApi.fetchStations();
				setStations(stations);
				setFilteredStations(stations);

				const markers = stations.map((station) => (
					<Marker key={station._id} position={[station.coords[0], station.coords[1]]} icon={customIcon} eventHandlers={{
						mouseover: (event) => event.target.openPopup(),
					}}>
						<Popup eventHandlers={{
							mouseout: (event) => event.target.closePopup(),
						}}>
							{station.stationName}<br />
							Latitude: {station.coords[1]}<br />
							Longitude: {station.coords[0]}<br />
							Connected To: {station.connectedTo.map((connectedStationId, index) => {
								const connectedStation = stations.find(s => s._id === connectedStationId);
								return (
									<span key={index}>
										{connectedStation ? connectedStation.stationName : 'Unknown Station'}
										{index < station.connectedTo.length - 1 && ', '}
									</span>
								);
							})}
							<br />
							<Button className="mx-auto" variant="danger" onClick={() => handleConfirmation(() => deleteStation(station), station)}>
								<FaTrash /> DELETE
							</Button>{' '}
							<Button variant="primary" onClick={() => setStationToEdit(station)}>
								<FaPencilAlt /> UPDATE
							</Button>
						</Popup>
					</Marker>
				));

				setMapMarkers(markers);

				// Create polylines based on connectedTo information
				setPolylines([]);
				const lines: ReactElement[] = [];
				stations.forEach((station) => {
					station.connectedTo.forEach((connectedStationId) => {
						const connectedStation = stations.find((s) => s._id === connectedStationId);
						if (connectedStation) {
							const line = (
								<Polyline
									key={`${station._id}-${connectedStation._id}`}
									positions={[
										[station.coords[0], station.coords[1]],
										[connectedStation.coords[0], connectedStation.coords[1]],
									]}
									color="black"
									weight={3}
									opacity={0.7}
									dashArray="5, 10"
								/>
							);
							lines.push(line);
						}
					});
				});

				setPolylines(lines);

			} catch (error) {
				console.error(error);
				setShowStationsLoadingError(true);
			} finally {
				setStationsLoading(false);
				setIsModalClosed(false);
			}
		}

		loadStationsAndMarkers();
	}, [isModalClosed]);

	const refresh = () => {
		setIsModalClosed(true);
	};

	const deleteStation = async (station: StationsModel) => {
		try {
			// Remove the station from connectedTo of other stations
			const updatedStations = stations.map((existingStation) => {
				return {
					...existingStation,
					connectedTo: existingStation.connectedTo.filter((connectedStationId) => connectedStationId !== station._id),
				};
			});

			if (station.connectedTo.length > 0) await StationApi.updateStations(updatedStations);

			await StationApi.deleteStation(station._id);

			// Update the local state after successful deletion
			setStations(updatedStations);
			setFilteredStations(filteredStations.filter((existingStation) => existingStation._id !== station._id));
			setShowConfirmation(false);
			refresh();
			showAlertMessage('Station deleted successfully', 'success');
		} catch (error) {
			console.error("An error occurred while deleting the station:", error);
			showAlertMessage('Error deleting station', 'danger');
		}
	};


	const handleSearch = (searchTerm: string) => {
		setSearchTerm(searchTerm);
		const filtered = stations.filter(
			(station) =>
				station.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				station.coords.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
				station.connectedTo.toString().toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredStations(filtered);
	};

	const handleConfirmation = (action: () => void, target: StationsModel) => {
		setShowConfirmation(true);
		setConfirmationAction(() => action);
		setConfirmationTarget(target);
	};

	const closeConfirmation = () => {
		setShowConfirmation(false);
		setConfirmationAction(null);
		setConfirmationTarget(null);
	};

	const showAlertMessage = (message: string, variant: 'success' | 'danger') => {
		setAlertMessage(message);
		setAlertVariant(variant);
		setShowAlert(true);

		// Automatically hide the alert after 3 seconds
		setTimeout(() => {
			setShowAlert(false);
			setAlertMessage(null);
		}, 3000);
	};

	const handleMapClick = (latlng: { lat: number; lng: number }) => {
		setClickedCoords([latlng.lat, latlng.lng]);
		setSelectedMarker(null); // Reset selectedMarker when map is clicked
	};

	const handleNewMarkerClick = () => {
		setShowAddStationDialog(true); // Show the edit dialog
	};

	return (
		<>
			<Container>
				<h1 className={`${styles.blockCenter} mb-4`}>STATIONS</h1>

				{showAlert && <Alert variant={alertVariant}>{alertMessage}</Alert>}

				<Row className="mb-4">
					<Col xs={12} sm={6} lg={4}>
						<Button
							className={`mb-4 ${styles.blockStart} ${styles.flexCenter}`}
							onClick={() => setShowAddStationDialog(true)}
						>
							<FaPlus />
							Add New Station
						</Button>
					</Col>

					<Col xs={12} sm={6} lg={4}>
					</Col>

					<Col xs={12} sm={6} lg={4} className="text-end">
						<div className="input-group">
							<input
								type="text"
								className="form-control"
								placeholder="Search"
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
							/>
							<div className="input-group-append">
								<Button variant="outline-secondary" onClick={() => handleSearch(searchTerm)}>
									<FaSearch />
								</Button>
							</div>
						</div>
					</Col>
				</Row>

				{/* Loading Spinner */}
				{stationsLoading && (
					<div className={`${styles.flexCenterLoading} ${styles.blockCenterLoading}`}>
						<Spinner animation="border" role="status">
							<span className="visually-hidden">Loading...</span>
						</Spinner>
					</div>
				)}

				{showStationsLoadingError && <p>Something went wrong. Please refresh the page.</p>}

				{!stationsLoading && !showStationsLoadingError && (
					<>
						{filteredStations.length > 0 ? (
							<Table striped bordered responsive className="text-center">
								<thead>
									<tr>
										<th>Name</th>
										<th>Latitude</th>
										<th>Longitude</th>
										<th>Connected To</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredStations.map((station) => (
										<tr key={station._id}>
											<td>{station.stationName}</td>
											<td>{station.coords[1]}</td>
											<td>{station.coords[0]}</td>
											<td>{station.connectedTo.map((connectedStationId, index) => {
												const connectedStation = stations.find(s => s._id === connectedStationId);
												return (
													<span key={index}>
														{connectedStation ? connectedStation.stationName : 'Unknown Station'}
														{index < station.connectedTo.length - 1 && ', '}
													</span>
												);
											})}
											</td>
											<td>
												<Button className="mx-auto" variant="danger" onClick={() => handleConfirmation(() => deleteStation(station), station)}>
													<FaTrash /> DELETE
												</Button>{' '}
												<Button variant="primary" onClick={() => setStationToEdit(station)}>
													<FaPencilAlt /> UPDATE
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						) : (
							<p>No matching stations found</p>
						)}
					</>
				)}

				{showAddStationDialog && (
					<AddEditStationDialog
						stationToEdit={selectedMarker} // Pass the selectedMarker as stationToEdit
						coordinates={clickedCoords} // Pass the clicked coordinates as a prop
						onDismiss={() => {
							// setNewMapMarker([]);
							setShowAddStationDialog(false);
							refresh();
						}}
						onStationSaved={() => {
							setShowAddStationDialog(false);
							showAlertMessage('Station saved successfully', 'success');
							setSelectedMarker(null); // Reset selectedMarker after 
							refresh();
							setNewMapMarker([]);
						}}
						newStation={newStation}
					/>
				)}


				{stationToEdit && (
					<AddEditStationDialog
						stationToEdit={stationToEdit}
						onDismiss={() => {
							setStationToEdit(null);
							refresh(); // Call refresh() when dismissing the dialog
						}}
						onStationSaved={(updateStation) => {
							refresh();
							setStations(
								stations.map((existingStation) =>
									existingStation._id === updateStation._id ? updateStation : existingStation
								)
							);
							setFilteredStations(
								filteredStations.map((existingStation) =>
									existingStation._id === updateStation._id ? updateStation : existingStation
								)
							);
							setStationToEdit(null);
							showAlertMessage('Station updated successfully', 'success');
						}}
						newStation={null}
					/>
				)}

				<div id="map" className={`${styles.mapContainer} border rounded`} style={{ width: '100%', height: '500px' }}>
					<MapContainer center={[14.550561416466541, 121.02785649562283]} zoomControl={false} zoom={13} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
						<TileLayer
							url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`} //https://www.jawg.io/lab/access-tokens
						/>
						<MapEventHandler onClick={handleMapClick} />
						{mapMarkers}{newMapMarker}{polylines}
					</MapContainer>
				</div>

				<Modal show={showConfirmation} onHide={closeConfirmation}>
					<Modal.Header closeButton>
						<Modal.Title>Confirmation</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to delete this station?</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={closeConfirmation}>
							No
						</Button>
						<Button variant="danger" onClick={() => confirmationAction && confirmationTarget && confirmationAction()}>
							Yes
						</Button>
					</Modal.Footer>
				</Modal>
			</Container>
		</>
	);
};

export default StationPageLoggedInView;
