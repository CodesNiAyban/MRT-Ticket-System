import * as L from 'leaflet';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Modal, Pagination, Row, Spinner, Table } from 'react-bootstrap';
import { BiEdit } from "react-icons/bi";
import { FaMap, FaPencilAlt, FaTable, FaTrash } from 'react-icons/fa';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import AddEditStationDialog from './addEditStationDialog';
import styles from './station.module.css';
import MapEventHandler from './stationsCoordinates';

const StationPageLoggedInView = () => {
	const [isMapView, setIsMapView] = useState(true); // true for map, false for table

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

	const [isModalClosed, setIsModalClosed] = useState(false);

	const [mapCenter, setMapCenter] = useState<[number, number]>([14.550561416466541, 121.02785649562283]);
	const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
	const [newMapMarker, setNewMapMarker] = useState<ReactElement[]>([]);
	const [selectedMarker, setSelectedMarker] = useState<StationsModel | null>(null);
	const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
	const [polylines, setPolylines] = useState<ReactElement[]>([]);
	const [newStation, setNewStation] = useState<StationsModel | null>(null);
	const [draggedCoords, setDraggedCoords] = useState<[number, number] | null>(null);
	const [isDragged, setIsDragged] = useState(false)
	const mapContainerRef = useRef<HTMLDivElement>(null);

	const [perPage, setPerPage] = useState(5);
	const [currentPage, setCurrentPage] = useState(1);

	const startIndex = (currentPage - 1) * perPage;
	const endIndex = startIndex + perPage;

	const paginatedStations = filteredStations.slice(startIndex, endIndex);

	const totalPages = Math.ceil(filteredStations.length / perPage);

	const handlePerPageChange = (newPerPage: number) => {
		setPerPage(newPerPage);
		setCurrentPage(1);
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

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

	const handleMarkerDragEnd = (event: any, station: StationsModel) => {
		const { lat, lng } = event.target.getLatLng();
		setIsDragged(true)
		setDraggedCoords([lat, lng]);
	};

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
					<Popup className={`${styles.customPopup} rounded-lg shadow-lg`} >
						<h2 className="font-bold">NEW STATION</h2><br />
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

			toast.info(
				`New Station coords: 
				lat: ${clickedCoords[1]}
				lng: ${clickedCoords[0]} 
				Click it again to save.`,
				{
					position: "top-right",
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					style: { whiteSpace: 'pre-line' },
				}
			);

			setNewMapMarker([newMarker]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clickedCoords]);

	useEffect(() => {
		const loadStationsAndMarkers = async () => {
			try {
				setShowStationsLoadingError(false);
				setStationsLoading(true);
				setIsDragged(false)

				const stations = await StationApi.fetchStations();
				setStations(stations);
				setFilteredStations(stations);

				const markers = stations.map((station) => (
					<Marker key={station._id} position={[station.coords[0], station.coords[1]]} icon={customIcon} eventHandlers={{
						mouseover: (event) => event.target.openPopup(),
						dragend: (event) => handleMarkerDragEnd(event, station),
					}}
						draggable={true}

					>
						<Popup eventHandlers={{
							mouseout: (event) => event.target.closePopup(),
						}}>
							<h3 className="font-bold">{station.stationName}</h3>
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
							<div className="flex space-x-2">
								<Button className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
									variant="danger" onClick={() => handleConfirmation(() => deleteStation(station), station)}>
									<FaTrash />
								</Button>{' '}
								<Button className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
									variant="primary" onClick={() => setStationToEdit(station)}>
									<FaPencilAlt />
								</Button>
							</div>
						</Popup>
					</Marker>
				));

				setMapMarkers(markers);

				// Calculate average coordinates for the center of the map
				const totalCoords = stations.reduce((acc, station) => {
					return [acc[0] + station.coords[0], acc[1] + station.coords[1]];
				}, [0, 0]);

				setMapCenter([totalCoords[0] / stations.length, totalCoords[1] / stations.length]);

				setPolylines([]);
				const lines: ReactElement[] = [];
				const processedConnections: Set<string> = new Set();

				stations.forEach((station) => {
					station.connectedTo.forEach((connectedStationId) => {
						const connectedStation = stations.find((s) => s._id === connectedStationId);
						if (connectedStation) {
							const connectionKey = [station._id, connectedStation._id].sort().join('-');

							// Check if the connection has been processed to avoid duplicates
							if (!processedConnections.has(connectionKey)) {
								const line = (
									<Polyline
										key={connectionKey}
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
								processedConnections.add(connectionKey);
							}
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
			toast.error(`Station ${station.stationName} Deleted.`, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
		} catch (error) {
			toast.error("Delete Failed, Please Try Again.", {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			console.error("An error occurred while deleting the station:", error)
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

	const handleMapClick = (latlng: { lat: number; lng: number }) => {
		setClickedCoords([latlng.lat, latlng.lng]);
		setSelectedMarker(null); // Reset selectedMarker when map is clicked
	};

	const handleNewMarkerClick = () => {
		setShowAddStationDialog(true); // Show the edit dialog
	};

	const toggleView = () => {
		setIsMapView(!isMapView);
	};
	const handleFirstPage = () => {
		handlePageChange(1);
	};

	const handleLastPage = () => {
		handlePageChange(totalPages);
	};

	return (
		<>
			<ToastContainer limit={3} />
			<Container>
				{showStationsLoadingError && <p>Something went wrong. Please refresh the page.</p>}
				<div className="fullscreen-buttons">
					<Button variant="primary"
						onClick={toggleView}
						className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
						style={{ position: "absolute", zIndex: 999 }}
					>
						{isMapView ? <FaTable /> : <FaMap />}
					</Button>
				</div>
				{isMapView ? (
					<div ref={mapContainerRef} id="map" className="map">
						<MapContainer
							center={mapCenter}
							zoomControl={false}
							zoom={13}
							scrollWheelZoom={true}
							style={{ width: '100%', height: '100%', position: 'absolute', left: 0 }}
						>
							<TileLayer
								url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
							/>
							<MapEventHandler onClick={handleMapClick} />
							{mapMarkers}
							{newMapMarker}
							{polylines}
						</MapContainer>
					</div>
				) : (
					<>
						{stationsLoading && (
							<div className={`${styles.flexCenterLoading} ${styles.blockCenterLoading}`}>
								<Spinner animation="border" role="status">
									<span className="visually-hidden">Loading...</span>
								</Spinner>
							</div>
						)}
						{!stationsLoading && (
							<>
								{filteredStations.length > 0 ? (
									<>
										<Row className="mb-4">
											<Col xs={12} sm={6} lg={4} className="text-end">
												<div className="input-group">
													<input
														type="text"
														className="form-control"
														placeholder="Search"
														value={searchTerm}
														onChange={(e) => handleSearch(e.target.value)}
													/>
												</div>

												<Col xs={12} sm={6} lg={4} className="text-end">
													<Form>
														<Form.Label>Show entries per page</Form.Label>
														<Form.Select
															value={perPage}
															onChange={(e) => handlePerPageChange(Number(e.target.value))}
														>
															{[5, 10, 30, 50, 100].map((value) => (
																<option key={value} value={value}>
																	{value}
																</option>
															))}
														</Form.Select>
													</Form>
												</Col>
												<Col xs={12} className="text-end">
													<Pagination>
														<Pagination.First onClick={handleFirstPage} disabled={currentPage === 1} />
														<Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
														{[...Array(Math.min(5, totalPages)).keys()].map((page) => (
															<Pagination.Item
																key={page + 1}
																active={page + 1 === currentPage}
																onClick={() => handlePageChange(page + 1)}
															>
																{page + 1}
															</Pagination.Item>
														))}
														<Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
														<Pagination.Last onClick={handleLastPage} disabled={currentPage === totalPages} />
													</Pagination>
												</Col>
											</Col>
										</Row>
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
												{paginatedStations.map((station) => (
													<tr key={station._id}>
														<td>{station.stationName}</td>
														<td>{station.coords[1]}</td>
														<td>{station.coords[0]}</td>
														<td>
															{station.connectedTo.map((connectedStationId, index) => {
																const connectedStation = stations.find((s) => s._id === connectedStationId);
																return (
																	<span key={index}>
																		{connectedStation ? connectedStation.stationName : 'Unknown Station'}
																		{index < station.connectedTo.length - 1 && ', '}
																	</span>
																);
															})}
														</td>
														<td>
															<Button
																className={`mx-auto ${styles.button}`}
																variant="danger"
																onClick={() => handleConfirmation(() => deleteStation(station), station)}
															>
																<FaTrash />
															</Button>
															<Button className={`mx-auto ${styles.button}`} variant="primary" onClick={() => setStationToEdit(station)}>
																<BiEdit />
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</Table>
									</>
								) : (
									<p>No matching stations found</p>
								)}
							</>
						)}
					</>
				)}
				{showAddStationDialog && (
					<AddEditStationDialog

						stations={stations}
						stationToEdit={selectedMarker || undefined}
						coordinates={clickedCoords}
						onDismiss={() => {
							setNewMapMarker([]);
							setShowAddStationDialog(false);
							refresh();
						}}
						onStationSaved={(newStation) => {
							setShowAddStationDialog(false);
							setSelectedMarker(null);
							refresh();
							setNewMapMarker([]);
							toast.success(`Station ${newStation.stationName} successfully created.`, {
								position: "top-right",
								autoClose: 5000,
								hideProgressBar: false,
								closeOnClick: true,
								pauseOnHover: true,
								draggable: true,
								progress: undefined,
							});
						}}
						newStation={newStation}
						isDragged={false}

					/>
				)}

				{stationToEdit && (
					<AddEditStationDialog
						stations={stations}
						stationToEdit={stationToEdit}
						onDismiss={() => {
							setStationToEdit(null);
							refresh();
							setNewMapMarker([]);
						}}
						onStationSaved={(updateStation) => {
							refresh();
							setNewMapMarker([]);
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
							toast.success(`Station ${updateStation.stationName} successfully updated.`, {
								position: "top-right",
								autoClose: 5000,
								hideProgressBar: false,
								closeOnClick: true,
								pauseOnHover: true,
								draggable: true,
								progress: undefined,
							});
						}}
						newStation={null}
						coordinates={draggedCoords}
						isDragged={isDragged}

					/>
				)}

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
			</Container >
		</>
	);
};

export default StationPageLoggedInView;