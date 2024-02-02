
import L, { } from 'leaflet'
import 'leaflet/dist/leaflet.css'; // Ensure this import for Leaflet styles
import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Modal, Toast } from 'react-bootstrap';
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
	polylines: ReactElement[];
	setPolylines: React.Dispatch<React.SetStateAction<ReactElement[]>>;
	showToast: any;
	stations: StationsModel[];
}

const StationConnectedToModal: React.FC<StationConnectedToModalProps> = ({
	show,
	onHide,
	onStationSelection,
	selectedStations,
	onRemoveStation,
	onClearSelectedStations,
	newStation,
	stationToEdit,
	polylines,
	setPolylines,
	showToast,
	stations
}: StationConnectedToModalProps) => {
	const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
	const [newMapMarker, setNewMapMarker] = useState<ReactElement[]>([]);
	const [top, setTop] = useState(false); // Track the clicked marker's coordinates
	const [mapPolylines, setMapPolylines] = useState<ReactElement[]>([]);

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
	}, []);

	useEffect(() => {
		function loadStationsAndMarkers() {
			const markers = stations.map((station) => {
				const isConnectedToStation = station.connectedTo.includes(stationToEdit?._id || "");

				return (
					<Marker
						key={`${station._id}-${Math.random()}`}
						position={[station.coords[0], station.coords[1]]}
						icon={station === stationToEdit ? newCustomIcon : customIcon}
						eventHandlers={{
							click: () => {
								onStationSelection(station);
							},
							mouseover: (event) => event.target.openPopup(),
							mouseout: (event) => event.target.closePopup(),
						}}
					>
						<Popup>
							<div className={styles.popupContainer}>
								<span className={styles.popupTitle}>
									{station === stationToEdit ? <>STATION UPDATE <br /> </> : <> STATION INFO <br /></>}
								</span>
								<span className={styles.popupContent}>
									<strong>Station:</strong> {station.stationName}<br />
									<strong>Latitude:</strong> {station.coords[1]}<br />
									<strong>Longitude:</strong> {station.coords[0]}<br />
									<>
									{station === stationToEdit ? <><strong>CONNECTION LOGS:</strong> <br /> </> : <> STATION INFO <br /></>}
										{station.connectedTo.map((connectedStationId) => {
											const connectedStation = stations.find((s) => s._id === connectedStationId);
											const connectedDistance =
												connectedStation &&
												L.latLng(station.coords[0], station.coords[1]).distanceTo(
													L.latLng(connectedStation.coords[0], connectedStation.coords[1])
												);

											return connectedStation ? (
												<span key={connectedStationId}>
													<br />
													{connectedStation.stationName}
													(Distance: {connectedDistance?.toFixed(2)} meters)
												</span>
											) : null;
										})}
									</>
								</span>
							</div>
						</Popup>
					</Marker>
				);
			});

			setMapMarkers(markers);
			setTop(true);
		}

		loadStationsAndMarkers();
	}, [onStationSelection, stations, stationToEdit]);

	useEffect(() => {
		function loadPolylines() {
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

			const createPolyline = (station1: StationsModel, station2: StationsModel) => {
				const connectionKey = [station1._id, station2._id].sort().join('-');
				const line = (
					<Polyline
						key={`polyline-${connectionKey}`}
						positions={[
							[station1.coords[0], station1.coords[1]],
							[station2.coords[0], station2.coords[1]],
						]}
						color="green"
					/>
				);
				lines.push(line);
				processedConnections.add(connectionKey);
				setPolylines((prevPolylines) => [
					...prevPolylines,
					line,
				]);
			};

			// Create polylines based on selectedStations
			if (stationToEdit) {
				selectedStations.forEach((selectedStation) => {
					const connectionKey = [stationToEdit?._id, selectedStation._id].sort().join('-');

					// Check if the connection has been processed to avoid duplicates
					if (!processedConnections.has(connectionKey)) {
						createPolyline(stationToEdit!, selectedStation);
					}
				});

				// Create polylines based on stationToEdit
				if (stationToEdit) {
					stationToEdit.connectedTo.forEach((connectedStationId) => {
						const connectedStation = stations.find((s) => s._id === connectedStationId);
						if (connectedStation) {
							createPolyline(stationToEdit, connectedStation);
						}
					});
				}
			}


			setMapPolylines(lines);
		}
		loadPolylines();
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
	const handleRemoveStationName = (stationName: string, stationId: string) => {
		// Find the clicked station in selectedStations array
		const stationToRemove = selectedStations.find(
			(station) => station._id === stationId
		);

		if (stationToRemove) {
			onRemoveStation(stationToRemove);

			// Remove the corresponding polylines when a station is removed
			setPolylines((prevPolylines) =>
				prevPolylines.filter((polyline) => {
					const polylineStationIds = polyline.key?.split('-');
					return !polylineStationIds?.includes(stationId || "");
				})
			);
		}
	};


	return (
		<>
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
							{mapMarkers}{newMapMarker}{mapPolylines}{polylines}
						</MapContainer>
					</div>
					<div className="mt-3">
						Selected Stations:
						{selectedStations.length > 0 && (
							<>
								{selectedStations.map((selectedStation) => (
									<span
										key={`${selectedStation._id}${Math.random()}`}
										className={`${styles.badge} badge badge-pill badge-primary mr-2`}
										style={{
											background: '#0275d8',
											color: 'white',
											padding: '8px 16px',
											borderRadius: '20px',
											boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
											cursor: 'pointer', // Add cursor style to indicate clickability
										}}
										onClick={() => handleRemoveStationName(selectedStation.stationName, selectedStation._id)} // Add click handler
									>
										{selectedStation.stationName}
									</span>
								))}
							</>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary" onClick={onHide}
					// disabled={selectedStations.length === 0}
					>
						Confirm
					</Button>
				</Modal.Footer>
			</Modal>
			{showToast && (
				<div
					style={{
						position: 'fixed',
						top: '10px',
						right: '10px',
						zIndex: 1000,
					}}
				>
					<Toast autohide onClose={() => null}>
						<Toast.Header>
							<strong className="mr-auto">Distance Violation</strong>
						</Toast.Header>
						<Toast.Body>
							The selected station must be at least 500 meters away from existing stations.
						</Toast.Body>
					</Toast>
				</div>
			)}
		</>
	);
};

export default StationConnectedToModal;