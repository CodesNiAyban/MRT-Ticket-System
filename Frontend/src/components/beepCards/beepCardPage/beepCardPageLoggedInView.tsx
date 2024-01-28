// BeepCardPageLoggedInView.tsx

import React, { useEffect, useState } from "react";
import { Button, Spinner, Modal, Container, Card } from "react-bootstrap";
import { BeepCard as BeepCardsModel } from "../../../model/beepCardModel";
import * as BeepCardApi from "../../../network/beepCardAPI";
import styles from "././beepCardPageLoggedInView.module.css";
import AddEditBeepCardDialog from "../addEditBeepCard/addEditBeepCardDialog";
import { formatDate } from "../../../utils/formatDate";
import Buttons from "./beepCardPageButtons";
import BeepCardsGrid from "./beepCardPageGrid";
import AlertComponent from "./beepCardPageToast";

interface ConfirmationModalState {
  show: boolean;
  action: () => void;
  message: string;
  card: BeepCardsModel | null;
}

const BeepCardPageLoggedInView = () => {
  const [beepCards, setBeepCards] = useState<BeepCardsModel[]>([]);
  const [beepCardsLoading, setBeepCardsLoading] = useState(true);
  const [showBeepCardsLoadingError, setShowBeepCardsLoadingError] = useState(false);
  const [showAddBeepCardDialog, setShowAddBeepCardDialog] = useState(false);
  const [beepCardToEdit, setBeepCardToEdit] = useState<BeepCardsModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
    show: false,
    action: () => { },
    message: "",
    card: null,
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">("success");
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
    setConfirmationModal((prevModal: ConfirmationModalState) => ({
      ...prevModal,
      show: true,
      action: async () => {
        try {
          setBeepCardsLoading(true);
          await BeepCardApi.deleteBeepCard(beepCard._id);
          setBeepCards(
            beepCards.filter(
              (existingBeepCard) => existingBeepCard._id !== beepCard._id
            )
          );
          showCustomAlert("success", "Beep Card deleted successfully.");
        } catch (error) {
          console.error(error);
          showCustomAlert("danger", "Error deleting Beep Card. Please try again.");
        } finally {
          setBeepCardsLoading(false);
          setConfirmationModal({
            show: false,
            action: () => { },
            message: "",
            card: null,
          });
        }
      },
      message: "Are you sure you want to delete this Beep Card?",
      card: beepCard,
    } as ConfirmationModalState)); // Explicitly provide the type
  };

  const showCustomAlert = (variant: "success" | "danger", message: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage(null);
    }, 3000);
  };
  const filteredBeepCards = beepCards.filter(
    (beepCard) =>
      beepCard.UUIC.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      beepCard.balance!.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(beepCard.createdAt).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(beepCard.updatedAt).toLowerCase().includes(searchQuery.toLowerCase()) ||
      beepCard.createdAt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beepCard.updatedAt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredBeepCards.length / itemsPerPage);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  let createdUpdatedText: string;
  if (confirmationModal.card) {
    const { createdAt, updatedAt } = confirmationModal.card;
    if (updatedAt && updatedAt > createdAt) {
      createdUpdatedText = "Updated: " + formatDate(updatedAt);
    } else {
      createdUpdatedText = "Created: " + formatDate(createdAt);
    }
  } else {
    createdUpdatedText = "N/A";
  }

  return (
    <Container>
      <div className={`${styles.containerMiddle} ${styles.textShadow}`}>
        <h2 className={`${styles.textCenter} mb-4`}>BEEP CARDS</h2>
      </div>

      <AlertComponent
        variant={alertVariant}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

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
        <AlertComponent
          variant="danger"
          message="Something went wrong. Please refresh the page."
          onClose={() => setShowBeepCardsLoadingError(false)}
        />
      )}

      {!beepCardsLoading && !showBeepCardsLoadingError && (
        <Buttons
          editMode={editMode}
          setSearchQuery={setSearchQuery}
          setShowAddBeepCardDialog={setShowAddBeepCardDialog}
          setEditMode={setEditMode}
        />
      )}

      {!beepCardsLoading && !showBeepCardsLoadingError && (
        <BeepCardsGrid
          filteredBeepCards={filteredBeepCards}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          deleteBeepCard={deleteBeepCard}
          editMode={editMode}
          setBeepCardToEdit={setBeepCardToEdit}
        />
      )}

      {showAddBeepCardDialog && (
        <AddEditBeepCardDialog
          onDismiss={() => setShowAddBeepCardDialog(false)}
          editMode={editMode}
          onBeepCardSaved={(newBeepCard) => {
            setBeepCards([...beepCards, newBeepCard]);
            setShowAddBeepCardDialog(false);
            showCustomAlert("success", "Beep Card added successfully.");
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
            showCustomAlert("success", "Beep Card updated successfully.");
          }}
        />
      )}


      <Modal show={confirmationModal.show} onHide={() => setConfirmationModal({
        show: false,
        action: () => { },
        message: "",
        card: null,
      } as ConfirmationModalState)} className={`${styles.modalContent}`}centered>
        <Modal.Header closeButton>
          <Modal.Title className={`${styles.modalTitle} modal-title`}>
            Delete Confirmation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Card className={`${styles.beepCard}`}>
            <Card.Body className={styles.cardBody}>
              <Card.Title className={styles.flexCenter}>
                CARD: {confirmationModal?.card?.UUIC || "N/A"}
              </Card.Title>
              <Card.Text className={styles.cardText}>
                BALANCE: {confirmationModal?.card?.balance || "N/A"}
              </Card.Text>
            </Card.Body>
            <Card.Footer className={`text-muted ${styles.cardFooter}`}>
              {createdUpdatedText}
            </Card.Footer>
          </Card>

          <p className={styles.confirmationMessage}>
            Are you sure you want to delete this Beep Card?
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmationModal({
              show: false,
              action: () => { },
              message: "",
              card: null,
            } as ConfirmationModalState)}
            disabled={beepCardsLoading}
            className={`btn-secondary ${styles.secondaryButton}`}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmationModal.action}
            disabled={beepCardsLoading}
            className={`btn-danger ${styles.primaryButton} d-flex align-items-center`}
          >
            {beepCardsLoading && (
                <>
                  <Spinner
                    animation="border"
                    variant="secondary"
                    size="sm"
                    className={`${styles.loadingcontainer}`}
                  />
                  <span className="ml-2">Deleting...</span>
                </>
              )}
              {!beepCardsLoading && 'Delete'}

          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default BeepCardPageLoggedInView;