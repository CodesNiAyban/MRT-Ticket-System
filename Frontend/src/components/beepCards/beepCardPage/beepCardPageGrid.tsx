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
                        sm={12}
                        lg={12}
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
        </>
    );
};

export default BeepCardsGrid;
