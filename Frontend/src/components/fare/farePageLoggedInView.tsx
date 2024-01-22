import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Spinner,
  Alert,
  Container,
  Form,
  Modal,
} from "react-bootstrap";
import { Fare as FaresModel } from "../../model/fareModel";
import * as FareApi from "../../network/fareAPI";
import styles from "../../styles/stationPage.module.css";
import styleUtils from "../../styles/utils.module.css";
import Fare from "./fareComponent";
import EditFareDialog from "./editFareDialog"; // Import the EditFareDialog component

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

  const showAlertMessage = (variant: "success" | "danger", message: string) => {
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
      showAlertMessage("success", "Fare updated successfully.");

      // Reload fares after successful update
      const updatedFares = await FareApi.fetchFare();
      setFares(updatedFares);

      setFareToEdit(null);
      setUpdateText("");
      setShowEditForm(false);
    } catch (error) {
      console.error(error);
      showAlertMessage("danger", "Error updating fare. Please try again.");
    }
  };

  const faresGrid =
    fares.length > 0 ? (
      <Row xs={1} md={2} xl={3} className={`g-4 ${styles.stationGrid}`}>
        {fares.map((fare) => (
          <Col key={fare._id}>
            <Fare
              onFareClicked={() => handleEditFormOpen(fare)}
              className={styles.station}
              fares={fare}
            />
          </Col>
        ))}
      </Row>
    ) : (
      <p>No Fare found.</p>
    );

  return (
    <Container className={styles.settingsContainer}>
      <h1
        className={`${styleUtils.blockCenter} ${
          styles.settingsTitle
        } ${"mb-4"}`}
      >
        OFFICIAL FARES
      </h1>

      {faresLoading && (
        <div
          className={`${styleUtils.flexCenterLoading} ${styleUtils.blockCenterLoading}`}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {!faresLoading && <>{faresGrid}</>}

      {fareToEdit && (
        <div>
          <Form.Control
            type="text"
            placeholder="Enter update text"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            className={`mb-3 ${styles.updateText}`}
          />
          <Button
            variant="primary"
            className={`mb-3 ${styles.confirmButton}`}
            onClick={() => handleFareUpdate(fareToEdit)}
          >
            Confirm Update
          </Button>
        </div>
      )}

      {showAlert && (
        <Alert variant={alertVariant} className={styleUtils.blockCenter}>
          {alertMessage}
        </Alert>
      )}

      {showEditForm && editFormData && (
        <EditFareDialog
          fareToEdit={editFormData}
          onDismiss={handleEditFormClose}
          onFareSaved={handleFareUpdate}
        />
      )}
    </Container>
  );
};

export default FarePageLoggedInView;
