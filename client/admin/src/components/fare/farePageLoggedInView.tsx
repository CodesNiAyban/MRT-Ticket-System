import { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Spinner,
  Toast
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Fare as FaresModel } from "../../model/fareModel";
import * as FareApi from "../../network/fareAPI";
import * as MaintenanceApi from "../../network/maintenanceAPI";
import styles from "./fare.module.css";
import Fare from "./fareComponent";
import UpdateFareDialog from "./updateFareDialog";


const FarePageLoggedInView = () => {
  const [fares, setFares] = useState<FaresModel[]>([]);
  const [faresLoading, setFaresLoading] = useState(true);
  const [fareToEdit, setFareToEdit] = useState<FaresModel | null>(null);
  const [updateText, setUpdateText] = useState("");

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">(
    "success"
  );

  const [editFormData, setEditFormData] = useState<FaresModel | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    async function fetchMaintenanceMode() {
      try {
        const maintenance = await MaintenanceApi.fetchMaintenance();
        if (maintenance) {
          // navigate("/beepcards");
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchMaintenanceMode();
  }, []);

  const showToastMessage = (variant: "success" | "danger", message: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage(null);
    }, 3000);
  };

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
      setFareToEdit(null);
      setUpdateText("");
      setShowEditForm(false);
      showToastMessage("success", `${updatedFare.fareType.charAt(0).toUpperCase() + updatedFare.fareType.slice(1)} updated successfully.`);
    } catch (error) {
      console.error(error);
      showToastMessage("danger", "Error updating fare. Please try again");
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
    <Container>
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

      <Toast
        show={showAlert}
        onClose={() => setShowAlert(false)}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          width: '300px',
          background: alertVariant === "success" ? "#28a745" : "#dc3545",
          color: "#fff",
        }}
        className={`${styles.customToast}`}
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">
            {alertVariant === "success" ? "Success" : "Error"}
          </strong>
        </Toast.Header>
        <Toast.Body>{alertMessage}</Toast.Body>
      </Toast>

      {showEditForm && editFormData && (
        <UpdateFareDialog
          fareToEdit={editFormData}
          onDismiss={handleEditFormClose}
          onFareSaved={handleFareUpdate}
        />
      )}
    </Container>
  );
};

export default FarePageLoggedInView;
