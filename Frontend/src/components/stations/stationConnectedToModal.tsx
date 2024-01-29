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
}

const StationConnectedToModal: React.FC<StationConnectedToModalProps> = ({
  show,
  onHide,
  onStationSelection,
  selectedStations,
  onRemoveStation,
}: StationConnectedToModalProps) => {
  const [stations, setStations] = useState<StationsModel[]>([]);
  const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
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
              click: () => onStationSelection(station),
            }}
          >
            <Popup>{station.stationName}</Popup>
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

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Connect Stations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div id="map" className={`${styles.mapContainer} border rounded`} style={{ width: '100%', height: '400px' }}>
          <MapContainer center={[14.550561416466541, 121.02785649562283]} zoom={13} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
            />
            <MapEventHandler onClick={onStationSelection} />
            {mapMarkers}
          </MapContainer>
        </div>
        <Button variant="primary" onClick={onHide}>
          Confirm
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default StationConnectedToModal;
