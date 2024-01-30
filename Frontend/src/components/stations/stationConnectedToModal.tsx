import { Modal, Button } from 'react-bootstrap';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import React, { ReactElement, useEffect, useState } from 'react';
import styles from './station.module.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MapEventHandler from './stationsMarkerClicked';
import 'leaflet/dist/leaflet.css'; // Ensure this import for Leaflet styles
import L from 'leaflet';

interface StationConnectedToModalProps {
  show: boolean;
  onHide: () => void;
  onStationSelection: (station: StationsModel) => void;
  selectedStations: StationsModel[];
  onRemoveStation: (station: StationsModel) => void;
  onClearSelectedStations: () => void;
}

const StationConnectedToModal: React.FC<StationConnectedToModalProps> = ({
  show,
  onHide,
  onStationSelection,
  selectedStations,
  onRemoveStation,
  onClearSelectedStations
}: StationConnectedToModalProps) => {
  const [stations, setStations] = useState<StationsModel[]>([]);
  const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
  const [clickedMarker, setClickedMarker] = useState<StationsModel | null>(null); // Track the clicked marker
  const [stationsLoading, setStationsLoading] = useState(true);
  const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);

  const customIcon = L.icon({
    iconUrl: 'https://react-component-depot.netlify.app/static/media/marker.a3b2d28b.png',
    iconSize: [40, 40],
    iconAnchor: [17, 46],
    popupAnchor: [0, -46],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [40, 40],
    shadowAnchor: [10, 46],
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
                setClickedMarker(station); // Update clicked marker
                onStationSelection(station);

              },
              mouseover: (event) => event.target.openPopup(),
              mouseout: (event) => event.target.closePopup(),
            }}
          >
            <Popup> <span
              // key={clickedMarker.stationName}
              className={`${styles.badge} badge badge-pill badge-primary mr-2`}
              style={{
                background: '#0275d8',  // Example gradient, adjust as needed
                color: 'white',  // Text color
                padding: '8px 16px',  // Padding for the badge
                borderRadius: '20px',  // Border radius for rounded corners
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',  // Box shadow for a subtle lift
              }}
            >
              {station.stationName}
            </span></Popup>
          </Marker>
        ));

        setMapMarkers(markers);
      } catch (error) {
        console.error(error);
        setShowStationsLoadingError(true);
      } finally {
        setStationsLoading(false);
      }
    }
    loadStationsAndMarkers();
  }, [onStationSelection]);

  const handleRemoveStationName = (stationName: string) => {
    // Find the clicked station in selectedStations array
    const stationToRemove = selectedStations.find((station) => station.stationName === stationName);

    // Check if the station is found before attempting removal
    if (stationToRemove) {
      // Remove the clicked station from the selected stations
      onRemoveStation(stationToRemove); // Pass a single station to onRemoveStation
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
            {mapMarkers}
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
        <Button variant="primary" onClick={onHide} disabled={selectedStations.length === 0}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StationConnectedToModal;