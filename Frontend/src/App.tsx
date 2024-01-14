import "bootstrap/dist/css/bootstrap.min.css"
import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
// import { Button } from "react-bootstrap";
import { Stations as StationsModel } from "./model/stationsModel";
import Stations from "./components/stationComponent";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import styles from "./styles/stationPage.module.css"
import styleUtils from "./styles/utils.module.css"
import * as StationsApi from "./network/stationsAPI"
import AddEditStationDialog from "./components/addEditStationDialog";
import { FaPlus } from "react-icons/fa";

function App() {
  const [stations, setStations] = useState<StationsModel[]>([])
  const [stationLoading, setStationLoading] = useState(true);
  const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);

  const [showAddStationDialog, setShowAddStationDialog] = useState(false);
  const [stationToEdit, setStationToEdit] = useState<StationsModel | null>(null);

  // const [stationToEdit, setStationToEdit] = useS

  useEffect(() => {
    async function loadStations() {
      try {
        setShowStationsLoadingError(false);
        setStationLoading(true);
        const stations = await StationsApi.fetchStations();
        setStations(stations);
      } catch (error) {
        console.error(error);
        setShowStationsLoadingError(true);
      } finally {
        setStationLoading(false);
      }
    }
    loadStations();
  }, []);

  async function deleteStation(station: StationsModel) {
    try {
      await StationsApi.deleteStation(station._id);
      setStations(stations.filter(existingStation => existingStation._id !== station._id))
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  const stationsGrid =
    <Row xs={1} md={2} lg={10} xl={10} className={`g-4 ${styles.stationGrid}`}>
      {stations.map(station => (
        <Col key={station._id}>
          <Stations
            station={station}
            className={styles.station}
            onStationClicked={setStationToEdit}
            onDeleteNoteClicked={deleteStation}
          />
        </Col>
      ))}
    </Row>

  return (
    <>
      <Container className={styles.stationPage}>
        <Button
          className={`mb-4 ${styleUtils.blockCenter} ${styleUtils.deleteIconFix}`}
          onClick={() => setShowAddStationDialog(true)}>
          <FaPlus />
          Add new station
        </Button>
        {stationLoading && <Spinner animation="border" variant="primary" />}
        {showStationsLoadingError && <p>Something went wrong. Please Refresh the page.</p>}
        {!stationLoading && !showStationsLoadingError &&
        <>
        { stations.length > 0
          ? stationsGrid
          : <p>You don't have any stations yet</p>

        }
        </>
        }
        {showAddStationDialog &&
          <AddEditStationDialog
            onDismiss={() => setShowAddStationDialog(false)}
            onStationSaved={(newStation) => {
              setStations([...stations, newStation]);
              setShowAddStationDialog(false);
            }}
          />
        }
        {stationToEdit &&
          <AddEditStationDialog
            stationToEdit={stationToEdit}
            onDismiss={() => setStationToEdit(null)}
            onStationSaved={(updatedStation) => {
              setStations(stations.map(existingStation => existingStation._id === updatedStation._id ? updatedStation : existingStation))
              setStationToEdit(null);
            }}
          />
        }
      </Container>
    </>
  );
}

export default App;
