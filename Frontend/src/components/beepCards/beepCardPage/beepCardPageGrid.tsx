// BeepCardsGrid.tsx
import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import BeepCards from "../beepCardComponent/beepCardComponent";
import styles from "././beepCardPageLoggedInView.module.css";
import { BeepCard as BeepCardsModel } from "../../../model/beepCardModel";

interface BeepCardsGridProps {
    filteredBeepCards: BeepCardsModel[];
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    handlePageChange: (newPage: number) => void;
    deleteBeepCard: (beepCard: BeepCardsModel) => void;
    editMode: boolean;
    setBeepCardToEdit: (beepCard: BeepCardsModel | null) => void;
}

const BeepCardsGrid: React.FC<BeepCardsGridProps> = ({
    filteredBeepCards,
    itemsPerPage,
    currentPage,
    totalPages,
    handlePageChange,
    deleteBeepCard,
    editMode,
    setBeepCardToEdit,
}) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const currentBeepCards = filteredBeepCards.slice(startIndex, endIndex);

    return (
        <>
            <Row xs={1} md={2} xl={3} className={`mb-1 ${styles.beepCardGrid}`}>
                {currentBeepCards.map((beepCard) => (
                    <Col
                        key={beepCard._id}
                        xs={12}
                        sm={6}
                        lg={4}
                        className={`mb-3 ${styles.beepCardGrid}`}
                    >
                        <BeepCards
                            beepCard={beepCard}
                            className={styles.beepCard}
                            onBeepCardClicked={setBeepCardToEdit}
                            onDeleteBeepCardClicked={() => deleteBeepCard(beepCard)}
                            editMode={editMode}
                        />
                    </Col>
                ))}
            </Row>
            {filteredBeepCards.length > itemsPerPage && (
                <div
                    className={` ms-auto me-2`}
                    style={{ justifyContent: "center" }}
                >
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
    );
};

export default BeepCardsGrid;
