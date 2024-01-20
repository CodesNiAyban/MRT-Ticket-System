import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner, Modal, Alert, Container } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import { BeepCard as BeepCardsModel } from "../../model/beepCardModel";
import * as BeepCardApi from "../../network/beepCardAPI";
import styles from "../../styles/stationPage.module.css";
import styleUtils from "../../styles/utils.module.css";
import AddEditBeepCardDialog from "./addEditBeepCardDialog";
import BeepCards from "./beepCardComponent";

// Define the main component
const BeepCardPageLoggedInView = () => {
  const [beepCards, setBeepCards] = useState<BeepCardsModel[]>([]);
  const [beepCardsLoading, setBeepCardsLoading] = useState(true);
  const [showBeepCardsLoadingError, setShowBeepCardsLoadingError] = useState(false);
  const [showAddBeepCardDialog, setShowAddBeepCardDialog] = useState(false);
  const [beepCardToEdit, setBeepCardToEdit] = useState<BeepCardsModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    action: () => void;
    message: string;
  }>({ show: false, action: () => {}, message: "" });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlert, setcusShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">("success");

  useEffect(() => {
    async function loadBeepCards() {
      try {
        setShowBeepCardsLoadingError(false);
        setBeepCardsLoading(true);
        const beepCards = await BeepCardApi.fetchBeepCard();
        setBeepCards(beepCards);
      } catch (error) {
        console.error(error);
        setShowBeepCardsLoadingError(true);
      } finally {
        setBeepCardsLoading(false);
      }
    }
    loadBeepCards();
  }, []);

  const deleteBeepCard = (beepCard: BeepCardsModel) => {
    setConfirmationModal({
      show: true,
      action: async () => {
        try {
          await BeepCardApi.deleteBeepCard(beepCard._id);
          setBeepCards(beepCards.filter((existingBeepCard) => existingBeepCard._id !== beepCard._id));
          cusShowAlert("success", "Beep Card deleted successfully.");
          setConfirmationModal({ show: false, action: () => {}, message: "" });
        } catch (error) {
          console.error(error);
          cusShowAlert("danger", "Error deleting Beep Card. Please try again.");
          setTimeout(() => {
            setcusShowAlert(false);
            setAlertMessage(null);
          }, 3000);
        }
      },
      message: "Are you sure you want to delete this Beep Card?",
    });
  };

  const cusShowAlert = (variant: "success" | "danger", message: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setcusShowAlert(true);
    setTimeout(() => {
      setcusShowAlert(false);
      setAlertMessage(null);
    }, 3000);
  };

  const filteredBeepCards = beepCards.filter((beepCard) =>
    beepCard.UUIC.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const beepCardsGrid =
    filteredBeepCards.length > 0 ? (
      <Row xs={1} md={2} xl={3} className={`mb-4 ${styles.stationGrid}`}>
        {filteredBeepCards.map((beepCard) => (
          <Col key={beepCard._id} xs={12} sm={6} lg={4}>
            <BeepCards
              beepCard={beepCard}
              className={styles.station}
              onBeepCardClicked={setBeepCardToEdit}
              onDeleteBeepCardClicked={deleteBeepCard}
            />
          </Col>
        ))}
      </Row>
    ) : (
      <p>No matching Beep Cards found.</p>
    );

  return (
    <Container>
      <h1 className={`${styleUtils.textCenter} mb-4`}>BEEP CARDS</h1>

      <Row className="mb-3">
        <Col xs={12} sm={6} lg={8} className="d-flex align-items-center">
          <Button
            className={` ${styleUtils.blockStart} ${styleUtils.flexCenter}`}
            onClick={() => setShowAddBeepCardDialog(true)}
          >
            <FaPlus />
            Add New Beep Card
          </Button>
        </Col>
        <Col xs={12} sm={6} lg={4} className={`${styles.blockStart} ${"d-flex align-items-center"}`}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="input-group-append">
              <Button variant="outline-secondary" onClick={() => setSearchQuery("")}>
                <FaSearch />
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {beepCardsLoading && (
        <div className={`${styleUtils.flexCenterLoading} ${styleUtils.blockCenterLoading}`}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {showBeepCardsLoadingError && <p>Something went wrong. Please refresh the page.</p>}

      {!beepCardsLoading && !showBeepCardsLoadingError && <>{beepCardsGrid}</>}

      {showAddBeepCardDialog && (
        <AddEditBeepCardDialog
          onDismiss={() => setShowAddBeepCardDialog(false)}
          onBeepCardSaved={(newBeepCard) => {
            setBeepCards([...beepCards, newBeepCard]);
            setShowAddBeepCardDialog(false);
            cusShowAlert("success", "Beep Card added successfully.");
          }}
        />
      )}

      {beepCardToEdit && (
        <AddEditBeepCardDialog
          beepCardToEdit={beepCardToEdit}
          onDismiss={() => setBeepCardToEdit(null)}
          onBeepCardSaved={(updateBeepCard) => {
            setBeepCards(
              beepCards.map((existingBeepCard) =>
                existingBeepCard._id === updateBeepCard._id ? updateBeepCard : existingBeepCard
              )
            );
            setBeepCardToEdit(null);
            cusShowAlert("success", "Beep Card updated successfully.");
          }}
        />
      )}

      <Modal
        show={confirmationModal.show}
        onHide={() => setConfirmationModal({ show: false, action: () => {}, message: "" })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmationModal.message}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmationModal({ show: false, action: () => {}, message: "" })}
          >
            No
          </Button>
          <Button variant="primary" onClick={() => confirmationModal.action()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      {showAlert && (
        <Alert variant={alertVariant} className={styleUtils.blockCenter}>
          {alertMessage}
        </Alert>
      )}
    </Container>
  );
};

export default BeepCardPageLoggedInView;