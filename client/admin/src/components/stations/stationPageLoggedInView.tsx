import * as L from 'leaflet';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Modal, Pagination, Row, Spinner, Table } from 'react-bootstrap';
import { BiEdit } from "react-icons/bi";
import { FaMap, FaPencilAlt, FaPlus, FaTable, FaTrash } from 'react-icons/fa';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import AddEditStationDialog from './addEditStationDialog';
import styles from './station.module.css';
import MapEventHandler from './stationsCoordinates';
import * as MaintenanceApi from "../../network/maintenanceAPI";
import { useNavigate } from 'react-router-dom';

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
	const [isAddingStation, setIsAddingStation] = useState(false);
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

	const navigate = useNavigate();

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

	const handleMarkerDragEnd = async (event: any, station: StationsModel) => {
		if (!station.connectedTo) {
			// If the station is not connected to any other stations, allow dragging
			const { lat, lng } = event.target.getLatLng();
			// Update the station's coordinates
			station.coords = [lat, lng];
			// Update the station in the state
			setStations(prevStations => {
				const updatedStations = prevStations.map(s => {
					if (s._id === station._id) {
						return { ...s, coords: [lat, lng] };
					}
					return s;
				});
				return updatedStations;
			});
			return;
		}

		const stations = await StationApi.fetchStations();
		setStations(stations);

		let distance: number | undefined;
		let stationConnectedName;

		// If the station is connected to other stations, check if dragging would exceed the limit
		const isExceedingLimit = station.connectedTo.some((connectedStationId) => {
			const connectedStation = stations.find(s => s._id === connectedStationId);
			if (connectedStation) {
				stationConnectedName = connectedStation.stationName; // Assign connected station's name
				const connectedLatLng = L.latLng(connectedStation.coords[0], connectedStation.coords[1]);
				distance = event.target.getLatLng().distanceTo(connectedLatLng);
				return distance! < 500;
			} else {
				// Log a warning if the connected station cannot be found
				console.warn(`Connected station with ID ${connectedStationId} not found.`);
				return false;
			}
		});

		if (!isExceedingLimit) {
			// If dragging would not exceed the limit, allow dragging
			const { lat, lng } = event.target.getLatLng();
			// Update the station's coordinates
			station.coords = [lat, lng];
			// Update the station in the state
			// If dragging would exceed the limit, show a warning toast
			toast.info(toTitleCase(station.stationName) + " is moved. Edit to save current coordinate.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			setStations(prevStations => {
				const updatedStations = prevStations.map(s => {
					if (s._id === station._id) {
						return { ...s, coords: [lat, lng] };
					}
					return s;
				});
				return updatedStations;
			});
		} else {
			// If dragging would exceed the limit, show a warning toast
			toast.warn(toTitleCase(station.stationName) + " is " + Math.round(distance!) + "m to " + stationConnectedName + ", must be less than 500m from connected stations.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			// Reset dragging state and refresh the station marker
			refresh();
		}
	};

	useEffect(() => {
		async function fetchMaintenanceMode() {
			try {
				const maintenance = await MaintenanceApi.fetchMaintenance();
				if (maintenance) {
					// navigate("/beepcards");
				}
			} catch (error) {
				console.error(error);
			}
		}

		fetchMaintenanceMode();
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
					autoClose: 1500,
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

	// Update map center when there are no stations available
	useEffect(() => {
		if (stations.length === 0) {
			setMapCenter([14.550561416466541, 121.02785649562283]); // Set default center
		}
	}, [stations]);

	useEffect(() => {
		const loadStationsAndMarkers = async () => {
			try {
				setShowStationsLoadingError(false);
				setStationsLoading(true);

				const stations = await StationApi.fetchStations();
				setStations(stations);
				setFilteredStations(stations);

				setMapMarkers([]);

				const markers = stations.map((station) => (
					<Marker key={station._id} position={[station.coords[0], station.coords[1]]} icon={customIcon} eventHandlers={{
						mouseover: (event) => event.target.openPopup(),
						dragend: (event) => handleMarkerDragEnd(event, station),
					}}
						draggable={true}

					>
						<Popup eventHandlers={{
							mouseout: (event) => event.target.closePopup(),
						}} className="text-center">
							<h3 className="font-bold">{toTitleCase(station.stationName)}</h3>
							Latitude: {station.coords[1]}<br />
							Longitude: {station.coords[0]}<br />
							Connected To: {station.connectedTo.map((connectedStationId, index) => {
								const connectedStation = stations.find(s => s._id === connectedStationId);
								return (
									<span key={index}>
										{connectedStation ? toTitleCase(connectedStation.stationName) : ''}
										{index < station.connectedTo.length - 1 && ', '}
									</span>
								);
							})}
							<br />
							<div className="d-flex align-items-center justify-content-center space-x-2">
								<Button
									className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-primary" : "btn-primary"} button2`}
									variant="primary"
									onClick={() => setStationToEdit(station)}
								>
									<FaPencilAlt />
								</Button>
								<Button
									className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
									variant="danger"
									onClick={() => handleConfirmation(() => deleteStation(station), station)}
								>
									<FaTrash />
								</Button>{' '}
							</div>
						</Popup>
					</Marker>
				));

				setMapMarkers(markers);

				// Calculate average coordinates for the center of the map
				const totalCoords = stations.reduce((acc, station) => {
					// Ensure that station coordinates are valid numbers
					if (!isNaN(station.coords[0]) && !isNaN(station.coords[1])) {
						return [acc[0] + station.coords[0], acc[1] + station.coords[1]];
					} else {
						return acc;
					}
				}, [0, 0]);

				// Calculate the average coordinates only if there are valid coordinates
				if (totalCoords[0] !== 0 && totalCoords[1] !== 0 && stations.length > 0) {
					setMapCenter([totalCoords[0] / stations.length, totalCoords[1] / stations.length]);
				} else {
					// Fallback to a default center if no valid coordinates are found
					setMapCenter([14.550561416466541, 121.02785649562283]);
				}

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

	const toggleAddStationMode = () => {
		setIsAddingStation(prevState => !prevState); // Toggle the state
	};

	const deleteStation = async (station: StationsModel) => {
		try {
			await StationApi.deleteStation(station._id);
			setFilteredStations(filteredStations.filter((existingStation) => existingStation._id !== station._id));
			setShowConfirmation(false);
			refresh();
			await new Promise<void>((resolve: () => void) => {
				toast.warn(`Station ${toTitleCase(station.stationName)} Deleted.`, {
					position: "top-right",
					autoClose: 1500,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					onClose: () => {
						// Reset current page to 1 after deletion
						handlePageChange(1);
						resolve();
					},
				});
			});

		} catch (error) {
			await new Promise<void>((resolve: () => void) => {
				toast.error("Delete Failed, Please Try Again.", {
					position: "top-right",
					autoClose: 1500,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					onClose: resolve,
				});
			});
			console.error("An error occurred while deleting the station:", error)
		}
	};

	const handleSearch = (searchTerm: string) => {
		setSearchTerm(searchTerm);
		const filtered = stations.filter((station) => {
			const searchTermLower = searchTerm.toLowerCase();
			const stationNameLower = station.stationName.toLowerCase();
			const coords0Lower = station.coords[0].toString().toLowerCase();
			const coords1Lower = station.coords[1].toString().toLowerCase();
			const connectedToLower = station.connectedTo
				.map((connectedStationId) => {
					const connectedStation = stations.find((s) => s._id === connectedStationId);
					return connectedStation ? connectedStation.stationName.toLowerCase() : '';
				})
				.join(' ');

			return (
				stationNameLower.includes(searchTermLower) ||
				coords0Lower.includes(searchTermLower) ||
				coords1Lower.includes(searchTermLower) ||
				connectedToLower.includes(searchTermLower)
			);
		});

		setFilteredStations(filtered);
	};

	function toTitleCase(str: string) {
		return str.replace(/\b\w/g, function (char: string) {
			return char.toUpperCase();
		});
	}

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
		if (isAddingStation) {
			setClickedCoords([latlng.lat, latlng.lng]);
			setSelectedMarker(null); // Reset selectedMarker when map is clicked
		}
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
				{isMapView && !showStationsLoadingError &&
					<>
						<Button
							variant="primary"
							onClick={toggleView}
							className={`me-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
							style={{ zIndex: 999, position: "absolute" }}
						>
							{isMapView ? <FaTable /> : <FaMap />}
						</Button>
						<Button
							variant="primary"
							onClick={toggleAddStationMode}
							className={`me-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isAddingStation ? "btn-primary" : "btn-secondary"} button2`}
							style={{ zIndex: 999, position: "absolute", marginLeft: 99 }} // Adjust position as needed
						>
							{isAddingStation ? <FaPlus className="me-1" /> : (
								<>
									<FaPlus className="me-1 text-muted" />
								</>
							)}
						</Button>

					</>
				}
				{isMapView ? (
					<div ref={mapContainerRef} id="map" className="map">
						<MapContainer
							key={isMapView ? 'map-view' : 'table-view'}
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
							<div className={`${styles.flexCenterLoading} ${styles.blockCenterLoading}`} style={{ paddingTop: 30 }}>
								<Spinner animation="border" role="status">
									<span className="visually-hidden">Loading...</span>
								</Spinner>
							</div>
						)}
						{!stationsLoading && (
							<>
								<Container>
									<div className='d-flex' style={{ paddingBottom: '10px', paddingTop: '10px' }}>
										<Button
											variant="primary"
											onClick={toggleView}
											className={`me-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} btn-success button2`}
										>
											{isMapView ? <FaTable /> : <FaMap />}
										</Button>
										<Form style={{ paddingBlock: "15px" }} className="d-flex col-md-4 row-md-10 ms-auto">
											<div className="d-flex align-items-center">
												<Form.Select
													value={perPage}
													onChange={(e) => handlePerPageChange(Number(e.target.value))}
													style={{ width: "80px" }}
												>
													{[5, 10, 15, 30, 50].map((value) => (
														<option key={value} value={value}>
															{value}
														</option>
													))}
												</Form.Select>
											</div>
											<div className="input-group ms-2">
												<input
													type="text"
													className="form-control smaller-search-input"
													placeholder="Search"
													value={searchTerm}
													onChange={(e) => handleSearch(e.target.value)}
												/>
											</div>
										</Form>
									</div>

									{filteredStations.length > 0 ? (
										<>

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
															<td>{toTitleCase(station.stationName)}</td>
															<td>{station.coords[1]}</td>
															<td>{station.coords[0]}</td>
															<td>
																{station.connectedTo.map((connectedStationId, index) => {
																	const connectedStation = stations.find(
																		(s) => s._id === connectedStationId
																	);
																	return (
																		<span key={index}>
																			{connectedStation
																				? toTitleCase(connectedStation.stationName)
																				: ''}
																			{index < station.connectedTo.length - 1 && ', '}
																		</span>
																	);
																})}
															</td>
															<td>
																<Button
																	className={`mx-auto ${styles.button}`}
																	variant="danger"
																	onClick={() =>
																		handleConfirmation(() => deleteStation(station), station)
																	}
																>
																	<FaTrash />
																</Button>
																<Button
																	className={`mx-auto ${styles.button}`}
																	variant="primary"
																	onClick={() => setStationToEdit(station)}
																>
																	<BiEdit />
																</Button>
															</td>
														</tr>
													))}
												</tbody>
											</Table>

											{!stationsLoading && filteredStations.length > perPage && filteredStations.length > 0 && (
												<Row className="justify-content-end">
													<Col xs={12} className="text-end">
														<div style={{
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
														}}>
															<Pagination>
																<Pagination.First
																	onClick={handleFirstPage}
																	disabled={currentPage === 1}
																/>
																<Pagination.Prev
																	onClick={() => handlePageChange(currentPage - 1)}
																	disabled={currentPage === 1}
																/>
																{[...Array(Math.min(5, totalPages)).keys()].map((page) => (
																	<Pagination.Item
																		key={page + 1}
																		active={page + 1 === currentPage}
																		onClick={() => handlePageChange(page + 1)}
																	>
																		{page + 1}
																	</Pagination.Item>
																))}
																<Pagination.Next
																	onClick={() => handlePageChange(currentPage + 1)}
																	disabled={currentPage === totalPages}
																/>
																<Pagination.Last
																	onClick={handleLastPage}
																	disabled={currentPage === totalPages}
																/>
															</Pagination>
														</div>
													</Col>
												</Row>
											)}
										</>
									) : (
										<p className="text-center">No matching stations found</p>
									)}
								</Container>
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
								autoClose: 1500,
								hideProgressBar: false,
								closeOnClick: true,
								pauseOnHover: true,
								draggable: true,
								progress: undefined,
							});
						}}
						newStation={newStation}
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
								autoClose: 1500,
								hideProgressBar: false,
								closeOnClick: true,
								pauseOnHover: true,
								draggable: true,
								progress: undefined,
							});
						}}
						newStation={null}
						coordinates={[stationToEdit.coords[0], stationToEdit.coords[1]]}
					/>
				)}

				<Modal show={showConfirmation} onHide={closeConfirmation} className={`${styles.modalContent} beep-card-modal`} centered>
					<Modal.Header closeButton className={`${styles.confirmationModalHeader} modal-title`}>
						<Modal.Title className={`${styles.modalTitle} modal-title`}>Confirmation</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className={styles.confirmationMessage}>
							Are you sure you want to delete this Station?
						</p>
						{confirmationTarget && (
							<div>
								Station Name: <h5>{toTitleCase(confirmationTarget.stationName)}</h5>
								Connected To: <h5>{confirmationTarget.connectedTo.map(connectedId => {
									const connectedStation = stations.find(station => station._id === connectedId);
									return connectedStation ? toTitleCase(connectedStation.stationName) : '';
								}).join(', ')}</h5>
							</div>
						)}
					</Modal.Body>
					<Modal.Footer className={`${styles.modalFooter} modal-footer`}>
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