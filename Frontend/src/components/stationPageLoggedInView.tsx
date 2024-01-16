import { useEffect, useState } from 'react';
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { Stations as StationsModel } from '../model/stationsModel';
import * as StationApi from "../network/stationsAPI";
import styles from "../styles/stationPage.module.css";
import styleUtils from "../styles/utils.module.css";
import AddEditStationDialog from "./addEditStationDialog";
import Stations from './stationComponent';

const AdminDashboardPageLoggedInView = () => {

    const [stations, setStations] = useState<StationsModel[]>([]);
    const [stationsLoading, setStationsLoading] = useState(true);
    const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);

    const [showAddStationDialog, setShowAddStationDialog] = useState(false);
    const [stationToEdit, setStationToEdit] = useState<StationsModel | null>(null);

    useEffect(() => {
        async function loadStations() {
            try {
                setShowStationsLoadingError(false);
                setStationsLoading(true);
                const stations = await StationApi.fetchStations();
                setStations(stations);
            } catch (error) {
                console.error(error);
                setShowStationsLoadingError(true);
            } finally {
                setStationsLoading(false);
            }
        }
        loadStations();
    }, []);

    async function deleteStation(station: StationsModel) {
        try {
            await StationApi.deleteStation(station._id);
            setStations(stations.filter(existingStation => existingStation._id !== station._id));
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    const stationsGrid =
        <Row xs={1} md={2} xl={3} className={`g-4 ${styles.stationGrid}`}>
            {stations.map(station => (
                <Col key={station._id}>
                    <Stations
                        station={station}
                        className={styles.station}
                        onStationClicked={setStationToEdit}
                        onDeleteStationClicked={deleteStation}
                    />
                </Col>
            ))}
        </Row>

    return (
        <>
            <Button
                className={`mb-4 ${styleUtils.blockCenter} ${styleUtils.flexCenter}`}
                onClick={() => setShowAddStationDialog(true)}>
                <FaPlus />
                Add new station
            </Button>
            {stationsLoading && <Spinner animation='border' variant='primary' />}
            {showStationsLoadingError && <p>Something went wrong. Please refresh the page.</p>}
            {!stationsLoading && !showStationsLoadingError &&
                <>
                    {stations.length > 0
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
                    onStationSaved={(updateStation) => {
                        setStations(stations.map(existingStation => existingStation._id === updateStation._id ? updateStation : existingStation));
                        setStationToEdit(null);
                    }}
                />
            }
        </>
    );
}

export default AdminDashboardPageLoggedInView;