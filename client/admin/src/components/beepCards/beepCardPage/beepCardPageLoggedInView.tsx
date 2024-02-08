// BeepCardPageLoggedInView.tsx

import React, { useEffect, useState } from "react";
import { Button, Spinner, Modal, Container, Card, Pagination, Alert, Toast } from "react-bootstrap";
import { BeepCard as BeepCardsModel } from "../../../model/beepCardModel";
import * as BeepCardApi from "../../../network/beepCardAPI";
import styles from "././beepCardPageLoggedInView.module.css";
import AddEditBeepCardDialog from "../addEditBeepCard/addEditBeepCardDialog";
import { formatDate } from "../../../utils/formatDate";
import Buttons from "./beepCardPageButtons";
import BeepCardsGrid from "./beepCardPageGrid";

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
  const [alertVariant, setAlertVariant] = useState<"success" | "danger">("success");
  const [editMode, setEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    if (!beepCard.isActive) {
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
            showCustomToast("danger", `Beep Card ${beepCard.UUIC} deleted.`);
          } catch (error) {
            console.error(error);
            showCustomToast("danger", "Error deleting Beep Card. Please try again.");
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
      } as ConfirmationModalState));
    } else {
      showCustomToast("danger", "Beep Card is currently active.");
    }
  };

  const showCustomToast = (variant: "success" | "danger", message: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
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
      beepCard.updatedAt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (beepCard.isActive ? "Yes" : "No").toLowerCase().includes(searchQuery.toLowerCase()) // Change isActive to "Yes" or "No"
  );

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredBeepCards.length / itemsPerPage);
  const showPagination = filteredBeepCards.length > itemsPerPage;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderPaginationButtons = () => {
    if (!showPagination) {
      return null;
    }

    const buttons = [];
    const maxButtons = 5;
    const totalPageButtons = Math.min(maxButtons, totalPages);
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxButtons / 2), totalPages - maxButtons + 1));

    for (let i = startPage; i < startPage + totalPageButtons; i++) {
      buttons.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return buttons;
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
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          width: '300px', // Set the width as needed
          background: alertVariant === "success" ? "#28a745" : "#dc3545", // Background color
          color: "#fff", // Text color
        }}
        className={`${styles.customToast}`}
      >
        <Toast.Header>
          <strong className={`me-auto`}>
            {alertVariant === "success" ? "Success" : "Error"}
          </strong>
        </Toast.Header>
        <Toast.Body>{alertMessage}</Toast.Body>
      </Toast>

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
        <Alert
          variant="danger"
          onClose={() => setShowBeepCardsLoadingError(false)}
          dismissible
        >
          Something went wrong. Please refresh the page.
        </Alert>
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

      {!beepCardsLoading && (
        filteredBeepCards.length === 0 && (
          <div className={`${styles.containerMiddle} ${styles.textShadow}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <h4>No results found</h4>
          </div>
        )
      )}

      {!beepCardsLoading && (
        beepCards.length === 0 && !beepCardsLoading && (
          <div className={`${styles.containerMiddle} ${styles.textShadow}`}>
            <h4>No beep cards generated</h4>
          </div>
        )
      )}


      {showAddBeepCardDialog && (
        <AddEditBeepCardDialog
          onDismiss={() => setShowAddBeepCardDialog(false)}
          editMode={editMode}
          onBeepCardSaved={(newBeepCard) => {
            setBeepCards([...beepCards, newBeepCard]);
            setShowAddBeepCardDialog(false);
            showCustomToast("success", `Beep Card ${newBeepCard.UUIC} created successfully.`);
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
            showCustomToast("success", `Beep Card ${updateBeepCard.UUIC} updated successfully.`);
          }}
        />
      )}

      <Modal
        show={confirmationModal.show}
        onHide={() => setConfirmationModal({
          show: false,
          action: () => { },
          message: "",
          card: null,
        } as ConfirmationModalState)}
        className={`${styles.modalContent} beep-card-modal`} // Add beep-card-modal class
        centered
      >
        <Modal.Header closeButton className={`${styles.modalHeader} modal-header`}>
          <Modal.Title className={`${styles.modalTitle} modal-title`}>
            Delete Confirmation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Card className={`${styles.beepCard} beep-card`}>
            <Card.Body className={styles.cardBody}>
              <Card.Title className={styles.flexCenter}>
                CARD: {confirmationModal?.card?.UUIC || "N/A"}
              </Card.Title>
              <Card.Text className={styles.cardText}>
                BALANCE: {confirmationModal?.card?.balance || "N/A"}<br />
                TAPPED IN: {confirmationModal.card?.isActive ? "Yes" : "No" || "N/A"}
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

        <Modal.Footer className={`${styles.modalFooter} modal-footer`}>
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

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: showPagination ? 'visible' : 'hidden', // Hide or show based on showPagination
      }}>
        <Pagination>
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          />
          {renderPaginationButtons()}
          <Pagination.Next
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </Container>
  );
};

export default BeepCardPageLoggedInView;
