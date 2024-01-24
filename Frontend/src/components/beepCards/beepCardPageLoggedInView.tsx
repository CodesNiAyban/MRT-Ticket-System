import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Spinner,
  Modal,
  Alert,
  Container,
} from "react-bootstrap";
import { FaPesoSign } from "react-icons/fa6";
import { BeepCard as BeepCardsModel } from "../../model/beepCardModel";
import * as BeepCardApi from "../../network/beepCardAPI";
import styles from "./beepCardPageLoggedInView.module.css";
import AddEditBeepCardDialog from "./addEditBeepCardDialog";
import BeepCards from "./beepCardComponent";
import { formatDate } from "../../utils/formatDate";
// Import necessary icons and styles
import { BiEdit, BiPlus } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";


const BeepCardPageLoggedInView = () => {
  const [beepCards, setBeepCards] = useState<BeepCardsModel[]>([]);
  const [beepCardsLoading, setBeepCardsLoading] = useState(true);
  const [showBeepCardsLoadingError, setShowBeepCardsLoadingError] =
    useState(false);
  const [showAddBeepCardDialog, setShowAddBeepCardDialog] = useState(false);
  const [beepCardToEdit, setBeepCardToEdit] = useState<BeepCardsModel | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    action: () => void;
    message: string;
  }>({ show: false, action: () => { }, message: "" });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlert, setcusShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">(
    "success"
  );

  const [editMode, setEditMode] = useState(false);

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
          setBeepCards(
            beepCards.filter(
              (existingBeepCard) => existingBeepCard._id !== beepCard._id
            )
          );
          cusShowAlert("success", "Beep Card deleted successfully.");
          setConfirmationModal({ show: false, action: () => { }, message: "" });
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

  const filteredBeepCards = beepCards.filter(
    (beepCard) =>
      beepCard.UUIC.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      beepCard
        .balance!.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      formatDate(beepCard.createdAt)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      formatDate(beepCard.updatedAt)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      beepCard.createdAt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beepCard.updatedAt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const currentBeepCards = filteredBeepCards.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredBeepCards.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const buttons = (
    <>
      <Row className="mb-3">
        <Col xs={12} sm={6} lg={8} className={`${styles.blockStart} d-flex align-items-center`}>
          <Button className={`me-1 ${styles.blockStart} ${styles.customButton} ${styles.flexCenter}`} onClick={() => setShowAddBeepCardDialog(true)}>
            <BiPlus />
            Add New Beep Card
          </Button>

          <Button className={`ms-1 customButton ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${editMode ? "btn-warning" : "btn-info"}`} onClick={() => setEditMode(!editMode)}>
            {editMode ? (
              <>
                <BiEdit />
                Exit Edit Beep Card Mode
              </>
            ) : (
              <>
                <FaPesoSign />
                Load Beep Card Mode
              </>
            )}
          </Button>
        </Col>
        <Col
          xs={12}
          sm={6}
          lg={4}
          className={`${styles.blockStart} d-flex align-items-center`}
        >
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="input-group-append">
              <Button
                variant="outline-secondary"
                onClick={() => setSearchQuery("")}
              >
                <BsSearch />
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );

  const beepCardsGrid =
    currentBeepCards.length > 0 ? (
      <>
        <Row xs={1} md={2} xl={3} className={`mb-1 ${styles.beepCardGrid}`}>
          {currentBeepCards.map((beepCard) => (
            <Col key={beepCard._id} xs={12} sm={6} lg={4} className={`mb-3 ${styles.beepCardGrid}`}>
              <BeepCards
                beepCard={beepCard}
                className={styles.beepCard}
                onBeepCardClicked={setBeepCardToEdit}
                onDeleteBeepCardClicked={deleteBeepCard}
                editMode={editMode}
              />
            </Col>
          ))}
        </Row>
        {filteredBeepCards.length > itemsPerPage && (
          <div className={` ms-auto me-2`} style={{width: '65vh', justifyContent: 'center'}}>
            <Button
              variant="outline-secondary"
              className="mb-3 mr-2"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline-secondary"
              className="mb-3 mr-2"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </>
    ) : (
      <p>No matching Beep Cards found.</p>
    );

    return (
      <Container>
        <div className={`${styles.containerMiddle} ${styles.textShadow}`}>
          <h1 className={`${styles.textCenter} mb-4`}>BEEP CARDS</h1>
        </div>
  
        {showAlert && (
          <div className={`${styles.alertOverlay} ${styles.blockCenter}`} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center', background: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRadius: '8px' }}>
            <div className={`${styles.alertContainer}`}>
              <Alert variant={alertVariant}>
                {alertMessage}
              </Alert>
            </div>
          </div>
        )}
  
        {beepCardsLoading && (
          <div
            className={`${styles.flexCenterLoading} ${styles.blockCenterLoading}`}
          >
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
  
        {showBeepCardsLoadingError && (
          <Alert variant="danger" className={`${styles.alertOverlay} ${styles.blockCenter}`}>
            Something went wrong. Please refresh the page.
          </Alert>
        )}
  
        {!beepCardsLoading && !showBeepCardsLoadingError && <>{buttons}</>}
        {!beepCardsLoading && !showBeepCardsLoadingError && <>{beepCardsGrid}</>}
  
        {showAddBeepCardDialog && (
          <AddEditBeepCardDialog
            onDismiss={() => setShowAddBeepCardDialog(false)}
            editMode={editMode}
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
            editMode={editMode}
            onBeepCardSaved={(updateBeepCard) => {
              setBeepCards(
                beepCards.map((existingBeepCard) =>
                  existingBeepCard._id === updateBeepCard._id
                    ? updateBeepCard
                    : existingBeepCard
                )
              );
              setBeepCardToEdit(null);
              cusShowAlert("success", "Beep Card updated successfully.");
            }}
          />
        )}
  
        <Modal
          show={confirmationModal.show}
          onHide={() =>
            setConfirmationModal({ show: false, action: () => { }, message: "" })
          }
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmationModal.message}</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                setConfirmationModal({
                  show: false,
                  action: () => { },
                  message: "",
                })
              }
            >
              No
            </Button>
            <Button variant="danger" onClick={() => confirmationModal.action()}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  };

export default BeepCardPageLoggedInView;