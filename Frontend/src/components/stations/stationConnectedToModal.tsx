
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
	const [showToast, setShowToast] = useState(false);
	const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
	const [newMapMarker, setNewMapMarker] = useState<ReactElement[]>([]);
	const [clickedMarkerCoordinates, setClickedMarkerCoordinates] = useState<[number, number] | null>(null); // Track the clicked marker's coordinates
	const [polylines, setPolylines] = useState<ReactElement[]>([]);
	const [mapLoading, setMapLoading] = useState(true);

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
	}, [newStation]);

	useEffect(() => {
		setMapLoading(true);
		async function loadStationsAndMarkers() {
			try {
				const stations = await StationApi.fetchStations();
				const markers = stations.map((station, index) => (
					<Marker
						key={`${station._id}-${Math.random()}`}
						position={[station.coords[0], station.coords[1]]}
						icon={customIcon}
						eventHandlers={{
							click: () => {
								if (
									!selectedStations.some(
										(selectedStation) => selectedStation._id === station._id
									)
								) {
									// Only proceed if the station is not in selectedStations
									let targetCoordinates: [number, number];

									if (newStation && !stationToEdit) {
										targetCoordinates = [newStation.coords[0], newStation.coords[1]];
									} else if (!newStation && stationToEdit) {
										targetCoordinates = [
											stationToEdit.coords[0],
											stationToEdit.coords[1],
										];
									} else {
										targetCoordinates = [station.coords[0], station.coords[1]];
									}

									const distance = L.latLng(targetCoordinates).distanceTo(
										L.latLng(station.coords[0], station.coords[1])
									);

									if (distance > 500) {
										if (stationToEdit) {
											if (stationToEdit && station._id !== stationToEdit._id) {
												onStationSelection(station);

												// Create a new polyline when stationToEdit is selected
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
											}
										} else if (newStation && station._id !== newStation._id) {
											setClickedMarkerCoordinates([
												station.coords[0],
												station.coords[1],
											]);
											onStationSelection(station);

											// Create a new polyline when a newStation is selected
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
											// handleRemoveStationName(station.stationName, station._id)
										}
									} else {
										setShowToast(true);
									}
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
			} catch (error) {
				console.error(error);
			} finally {
				setMapLoading(false);
			}
		}

		loadStationsAndMarkers();
	}, [clickedMarkerCoordinates, onStationSelection, newStation, stationToEdit, selectedStations]);


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
			(station) => station.stationName === stationName
		);

		if (stationToRemove) {
			onRemoveStation(stationToRemove);

			// Remove the corresponding polyline when a station is removed
			const polylineToRemove = polylines.find((polyline) =>
				polyline.key?.includes(stationId || "")
			);

			if (polylineToRemove) {
				setPolylines((prevPolylines) =>
					prevPolylines.filter((polyline) => polyline !== polylineToRemove)
				);
			}

			setClickedMarkerCoordinates(null);
		}
	};

	const handleCancel = () => {
		onClearSelectedStations(); // Clear selected stations
		setPolylines([]);
		onHide();
	};

	return (
		<>
			<Modal show={show} onHide={onHide} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Connect Stations</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{mapLoading && (
						<div className={styles.loadingOverlay}>
							{/* Display a loading spinner */}
							<div className={`spinner-border text-primary ${styles.spinner}`} role="status">
								<span className="sr-only">Loading...</span>
							</div>
							{/* Block clicks with a low-opacity component */}
							<div className={styles.blockingComponent} />
						</div>
					)}
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
			{showToast && (
				<div
					style={{
						position: 'fixed',
						top: '10px',
						right: '10px',
						zIndex: 1000,
					}}
				>
					<Toast onClose={() => setShowToast(false)}>
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