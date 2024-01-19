import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaPencilAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { Stations as StationsModel } from '../../model/stationsModel';
import * as StationApi from '../../network/stationsAPI';
import color from '../../styles/beepCard.module.css'
import styleUtils from '../../styles/utils.module.css';
import AddEditStationDialog from './addEditStationDialog';

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
    <Container>
      <h1 className={`${styleUtils.blockCenter} mb-4`}>STATIONS</h1>

      {showAlert && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <Row className="mb-4">
        <Col xs={12} sm={6} lg={4}>
          <Button
            className={`mb-4 ${styleUtils.blockStart} ${styleUtils.flexCenter}`}
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
        <div className={`${styleUtils.flexCenterLoading} ${styleUtils.blockCenterLoading}`}>
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
                    <td>{station.coords}</td>
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
          onDismiss={() => setShowAddStationDialog(false)}
          onStationSaved={(newStation) => {
            setStations([...stations, newStation]);
            setFilteredStations([...filteredStations, newStation]);
            setShowAddStationDialog(false);
            showAlertMessage('Station added successfully', 'success');
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
  );
};

export default StationPageLoggedInView;