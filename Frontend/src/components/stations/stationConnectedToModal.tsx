import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure this import for Leaflet styles
import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import styles from './station.module.css';

interface StationConnectedToModalProps {
	show: boolean;
	onHide: () => void;
	onStationSelection: (station: StationsModel) => void;
	selectedStations: StationsModel[];
	onRemoveStation: (station: StationsModel) => void;
	onClearSelectedStations: () => void;
	newStation: StationsModel | null;
	stationToEdit?: StationsModel | null;
}

const StationConnectedToModal: React.FC<StationConnectedToModalProps> = ({
	show,
	onHide,
	onStationSelection,
	selectedStations,
	onRemoveStation,
	onClearSelectedStations,
	newStation,
	stationToEdit
}: StationConnectedToModalProps) => {
	const [stations, setStations] = useState<StationsModel[]>([]);
	const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
	const [newMapMarker, setNewMapMarker] = useState<ReactElement[]>([]);
	const [clickedMarker, setClickedMarker] = useState<StationsModel | null>(null); // Track the clicked marker
	const [clickedMarkerCoordinates, setClickedMarkerCoordinates] = useState<[number, number] | null>(null); // Track the clicked marker's coordinates
	const [stationsLoading, setStationsLoading] = useState(true);
	const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);
	const [polylines, setPolylines] = useState<ReactElement[]>([]);


	const customIcon = L.icon({
		iconUrl: 'https://react-component-depot.netlify.app/static/media/marker.a3b2d28b.png',
		iconSize: [40, 40],
		iconAnchor: [17, 46],
		popupAnchor: [0, -46],
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [40, 40],
		shadowAnchor: [10, 46],
	});

	const newCustomIcon = L.icon({
		iconUrl: '/newMarker.png',
		iconSize: [38, 44],
		iconAnchor: [17, 46], //[left/right, top/bottom]
		popupAnchor: [0, -46], //[left/right, top/bottom]
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [40, 40],
		shadowAnchor: [5, 46],
	});

	useEffect(() => {
		async function loadStations() {
			try {
				const stations = await StationApi.fetchStations();
				setStations(stations);
			} catch (error) {
				console.error(error);
			}
		}
		loadStations();
	}, []);

	useEffect(() => {
		if (newStation) {
			const newMarker = (
				<Marker
					key="newMarker"
					position={[newStation.coords[0], newStation.coords[1]]}
					icon={newCustomIcon}
					eventHandlers={{
						mouseover: (event) => event.target.openPopup(),
						mouseout: (event) => event.target.closePopup(),
					}}
				>
					<Popup>
						NEW STATION<br />
						Latitude: {newStation.coords[1]}<br />
						Longitude: {newStation.coords[0]}<br />
					</Popup>
				</Marker>
			);

			setNewMapMarker([newMarker]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newStation]);
	useEffect(() => {
		async function loadStationsAndMarkers() {
			try {
				setShowStationsLoadingError(false);
				setStationsLoading(true);

				const stations = await StationApi.fetchStations();
				setStations(stations);

				const markers = stations.map((station) => (
					<Marker
						key={station._id}
						position={[station.coords[0], station.coords[1]]}
						icon={customIcon}
						eventHandlers={{
							click: () => {
								if (stationToEdit) {
									if (stationToEdit && station._id !== stationToEdit._id) {
										setClickedMarker(station); // Update clicked marker
										setClickedMarkerCoordinates([station.coords[0], station.coords[1]]); // Update clicked marker coordinates
										onStationSelection(station);
									}
								} else {
									setClickedMarker(station); // Update clicked marker
									setClickedMarkerCoordinates([station.coords[0], station.coords[1]]); // Update clicked marker coordinates
									onStationSelection(station);
								}
							},
							mouseover: (event) => event.target.openPopup(),
							mouseout: (event) => event.target.closePopup(),
						}}
					>
						<Popup>
							<span
								className={`${styles.badge} badge badge-pill badge-primary mr-2`}
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
						</Popup>
					</Marker>
				));

				setMapMarkers(markers);

				// Create polylines based on connectedTo information
				const lines: ReactElement[] = [];
				stations.forEach((station) => {
					station.connectedTo.forEach((connectedStationName) => {
						const connectedStation = stations.find((s) => s.stationName === connectedStationName);
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

				// Create polylines based on clickedMarkerCoordinates
				if (clickedMarkerCoordinates) {
					stations.forEach((station) => {
						let targetCoordinates: [number, number];

						if (newStation && !stationToEdit) {
							targetCoordinates = [newStation.coords[0], newStation.coords[1]];
						} else if (!newStation && stationToEdit) {
							targetCoordinates = [stationToEdit.coords[0], stationToEdit.coords[1]];
						} else {
							targetCoordinates = [station.coords[0], station.coords[1]];
						}

						const line = (
							<Polyline
								key={`${clickedMarkerCoordinates[0]}-${clickedMarkerCoordinates[1]}-${station._id}`}
								positions={[
									clickedMarkerCoordinates,
									targetCoordinates,
								]}
								color="black"
								weight={3}
								opacity={0.7}
								dashArray="5, 10"
							/>
						);
						lines.push(line);
					});
				}

				setPolylines((prevLines) => [...prevLines, ...lines]); // Merge existing lines with new lines
			} catch (error) {
				console.error(error);
				setShowStationsLoadingError(true);
			} finally {
				setStationsLoading(false);
			}
		}

		loadStationsAndMarkers();
	}, [onStationSelection, clickedMarkerCoordinates, newStation, stationToEdit]);


	// Create polylines based on clicked marker's coordinates
	// useEffect(() => {
	// }, [clickedMarkerCoordinates, newStation, stationToEdit, stations]);

	const handleRemoveStationName = (stationName: string) => {
		// Find the clicked station in selectedStations array
		const stationToRemove = selectedStations.find((station) => station.stationName === stationName);

		// Check if the station is found before attempting removal
		if (stationToRemove) {
			// Remove the clicked station from the selected stations
			onRemoveStation(stationToRemove);

			// Remove the corresponding polyline from polylines state
			setPolylines((prevLines) => {
				return prevLines.filter(
					(line) => !line.key?.includes(stationToRemove._id as string)
				);
			});
		}
	};

	const handleCancel = () => {
		onClearSelectedStations(); // Clear selected stations
		setClickedMarker(null); // Reset clicked marker
		onHide();
	};

	return (
		<Modal show={show} onHide={onHide} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Connect Stations</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div id="map" className={`${styles.mapContainer} border rounded`} style={{ width: '100%', height: '400px' }}>
					<MapContainer center={[14.550561416466541, 121.02785649562283]} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
						<TileLayer
							url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
						/>
						{mapMarkers}{newMapMarker}{polylines}
					</MapContainer>
				</div>
				<div className="mt-3">
					Selected Stations:
					{selectedStations.length > 0 && (
						<>
							{selectedStations.map((selectedStation) => (
								<span
									key={selectedStation._id}
									className={`${styles.badge} badge badge-pill badge-primary mr-2`}
									style={{
										background: '#0275d8',
										color: 'white',
										padding: '8px 16px',
										borderRadius: '20px',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
										cursor: 'pointer', // Add cursor style to indicate clickability
									}}
									onClick={() => handleRemoveStationName(selectedStation.stationName)} // Add click handler
								>
									{selectedStation.stationName}
								</span>
							))}
						</>
					)}
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleCancel}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onHide}
				// disabled={selectedStations.length === 0}
				>
					Confirm
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default StationConnectedToModal;