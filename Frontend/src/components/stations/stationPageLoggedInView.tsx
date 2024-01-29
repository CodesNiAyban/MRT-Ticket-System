import React, { ReactElement, useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaPencilAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import styles from './station.module.css';
import AddEditStationDialog from './addEditStationDialog';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import MapEventHandler from './stationsCoordinates';

import 'leaflet/dist/leaflet.css'; // Ensure this import for Leaflet styles
import L from 'leaflet';

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

  const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
  const [newMapMarker, setNewMapMarker] = useState<ReactElement[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<StationsModel | null>(null);

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

  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    setClickedCoords([latlng.lat, latlng.lng]);
    setSelectedMarker(null); // Reset selectedMarker when map is clicked
  };

  const handleNewMarkerClick = () => {
    setShowAddStationDialog(true); // Show the edit dialog
  };

  useEffect(() => {
    if (clickedCoords) {
      const newMarker = (
        <Marker
          key="newMarker"
          position={clickedCoords}
          icon={customIcon}
          eventHandlers={{
            click: () => handleNewMarkerClick()
          }}
        >
          <Popup>
            New Marker
            <br />
            Easily customizable.
          </Popup>
        </Marker>
      );

      setNewMapMarker([newMarker]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedCoords]);

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
    async function loadStationsAndMarkers() {
      try {
        setShowStationsLoadingError(false);
        setStationsLoading(true);

        const stations = await StationApi.fetchStations();
        setStations(stations);
        setFilteredStations(stations);

        const markers = stations.map((station) => (
          <Marker key={station._id} position={[station.coords[0], station.coords[1]]} icon={customIcon}  eventHandlers={{
            click:() => setStationToEdit(station)
          }}>
            <Popup>
              {station.stationName}
              <br />
              Easily customizable.
            </Popup>
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
  }, []);

  const deleteStation = async (station: StationsModel) => {
    try {
      await StationApi.deleteStation(station._id);
      setStations(stations.filter((existingStation) => existingStation._id !== station._id));
      setFilteredStations(filteredStations.filter((existingStation) => existingStation._id !== station._id));
      setShowConfirmation(false);
      showAlertMessage('Station deleted successfully', 'success');
    } catch (error) {
      console.error(error);
      alert(error);
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

  return (
    <>
      {/* Existing content */}
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
                    <th>Coordinates</th>
                    <th>Connected To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.map((station) => (
                    <tr key={station._id}>
                      <td>{station.stationName}</td>
                      <td>{"Lat: " + station.coords[0] + " Lng:" + station.coords[1]}</td>
                      <td>{station.connectedTo.join(', ')}</td>
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
            }}
            onStationSaved={() => {
              setShowAddStationDialog(false);
              showAlertMessage('Station saved successfully', 'success');
              setSelectedMarker(null); // Reset selectedMarker after saving
            }}
          />
        )}


        {stationToEdit && (
          <AddEditStationDialog
            stationToEdit={stationToEdit}
            onDismiss={() => setStationToEdit(null)}
            onStationSaved={(updateStation) => {
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
          />
        )}

        <div id="map" className={`${styles.mapContainer} border rounded`} style={{ width: '100%', height: '500px' }}>
          <MapContainer center={[14.550561416466541, 121.02785649562283]} zoom={13} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEventHandler onClick={handleMapClick} />
            {mapMarkers}{newMapMarker}
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
