import { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Spinner
} from "react-bootstrap";
import { Fare as FaresModel } from "../../model/fareModel";
import * as FareApi from "../../network/fareAPI";
import styles from "./fare.module.css";
import Fare from "./fareComponent";
import UpdateFareDialog from "./updateFareDialog";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FarePageLoggedInView = () => {
  const [fares, setFares] = useState<FaresModel[]>([]);
  const [faresLoading, setFaresLoading] = useState(true);

  const [editFormData, setEditFormData] = useState<FaresModel | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    async function loadFares() {
      try {
        setFaresLoading(true);
        const fetchedFares = await FareApi.fetchFare();
        setFares(fetchedFares);
      } catch (error) {
        console.error(error);
      } finally {
        setFaresLoading(false);
      }
    }
    loadFares();
  }, []);

  const handleEditFormOpen = (fare: FaresModel) => {
    setEditFormData(fare);
    setShowEditForm(true);
  };

  const handleEditFormClose = () => {
    setShowEditForm(false);
    setEditFormData(null);
  };

  const handleFareUpdate = async (updatedFare: FaresModel) => {
    try {
      // Reload fares after a successful update
      const updatedFares = await FareApi.fetchFare();
      setFares(updatedFares);
      setShowEditForm(false);
      toast.error(updatedFare.fareType.split(' ').map(word => word.charAt(0).toUpperCase() + word.toLocaleLowerCase().slice(1)).join(' ') + " price updated.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error Updating " + updatedFare.fareType.toLocaleLowerCase + " . Please try again. Make sure that input ID's are unique.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const faresGrid =
    fares.length > 0 ? (
      <Row xs={1} md={2} xl={3} className={`g-4 ${styles.fareGrid}`}>
        {fares.map((fare) => (
          <Col key={fare._id}>
            <Fare
              onFareClicked={() => handleEditFormOpen(fare)}
              className={styles.beepCard}
              fares={fare}
            />
          </Col>
        ))}
      </Row>
    ) : (
      <p>No Fare found.</p>
    );

  return (
    <>
      <ToastContainer limit={3} style={{ zIndex: 9999 }} />
      <Container className={styles.settingsContainer}>
        <header className="bg-gray-100 py-4">
          <div className="container mx-auto">
          </div>
        </header>
        {faresLoading && (
          <div
            className={`${styles.flexCenterLoading} ${styles.blockCenterLoading}`}
          >
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!faresLoading && <>{faresGrid}</>}
        {showEditForm && editFormData && (
          <UpdateFareDialog
            fareToEdit={editFormData}
            onDismiss={handleEditFormClose}
            onFareSaved={handleFareUpdate}
          />
        )}
      </Container>
    </>
  );
};

export default FarePageLoggedInView;
