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
// import styles from './station.module.css';
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
					<Popup className={`rounded-lg shadow-lg`} >
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
						}} className="text-center">
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
							<div className="d-flex align-items-center justify-content-center space-x-2">
								<Button
									// className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
									variant="primary"
									onClick={() => setStationToEdit(station)}
								>
									<FaPencilAlt />
								</Button>
								<Button
									// className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${isMapView ? "btn-warning" : "btn-success"} button2`}
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
			<div className="flex flex-col lg:flex-row h-screen">
				<div className="lg:w-3/4 bg-gray-200 p-4 lg:p-8 h-full">
					<h1 className="text-2xl lg:text-4xl font-bold text-gray-800 border-b-2 border-gray-400 pb-4 lg:pb-2 flex items-center lg:gap-2">
						<div className="text-gray-800"></div>
						AYALA STATION{"\n              "}
					</h1>
					<div className="mt-4">
						<div id="map" className={`border rounded`} style={{ width: '100%', height: '400px' }}>
							<MapContainer center={[14.550561416466541, 121.02785649562283]} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
								<TileLayer
									url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
								/>
							</MapContainer>
						</div>
					</div>
				</div>
				<div className="lg:w-1/4 bg-gray-800 p-4 lg:p-8 text-white flex flex-col items-start h-full">
					<h2 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-6 text-white flex items-center lg:gap-2">
						<div className="text-white"></div>
						TAP-IN{"\n              "}
					</h2>
					<div className="flex items-center gap-2 w-full mb-2 lg:mb-6">
						<div className="text-white"></div>
						<Form.Control className="bg-gray-600 h-10 lg:h-12 w-full text-sm lg:text-base text-white px-2" placeholder="Enter text here" type="text" />
					</div>
					<p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
						<div className="text-white"></div>
						CURRENT BALANCE: <span className="font-bold">400.00</span>
					</p>
					<p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
						<div className="text-white"></div>
						TRANSACTION DATE:
						<br />
						<span className="font-bold">2024-02-04T12:30:00</span>
					</p>
					<p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
						<div className="text-white"></div>
						CURRENT LOCATION:
						<br />
						<span className="font-bold">AYALA STATION</span>
					</p>
					<p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
						<div className="text-white"></div>
						LONGITUDE:
						<br />
						<span className="font-bold">121.02786549652283</span>
					</p>
					<p className="text-base lg:text-lg mb-4 lg:mb-6 flex items-center gap-2">
						<div className="text-white"></div>
						LATITUDE:
						<br />
						<span className="font-bold">14.550516141646541</span>
					</p>
					<Button className="w-full mt-2 lg:mt-auto bg-white text-gray-800 text-sm lg:text-base">TAP-IN NOW</Button>
				</div>
			</div>
		</>
	);
};

export default StationPageLoggedInView;