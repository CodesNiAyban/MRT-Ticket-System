import { useEffect, useState } from 'react';
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { BeepCard as BeepCardsModel } from '../../model/beepCardModel';
import * as BeepCardApi from "../../network/beepCardAPI";
import styles from "../../styles/stationPage.module.css";
import styleUtils from "../../styles/utils.module.css";
import AddEditBeepCardDialog from "./addEditBeepCardDialog";
import BeepCards from './beepCardComponent';

const AdminDashboardPageLoggedInView = () => {

    const [beepCards, setBeepCards] = useState<BeepCardsModel[]>([]);
    const [beepCardsLoading, setBeepCardsLoading] = useState(true);
    const [showBeepCardsLoadingError, setShowBeepCardsLoadingError] = useState(false);

    const [showAddBeepCardDialog, setShowAddBeepCardDialog] = useState(false);
    const [beepCardToEdit, setBeepCardToEdit] = useState<BeepCardsModel | null>(null);

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

    async function deleteBeepCard(beepCard: BeepCardsModel) {
        try {
            await BeepCardApi.deleteBeepCard(beepCard._id);
            setBeepCards(beepCards.filter(existingBeepCard => existingBeepCard._id !== beepCard._id));
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    const beepCardsGrid =
        <Row xs={1} md={2} xl={3} className={`g-4 ${styles.stationGrid}`}>
            {beepCards.map(beepCard => (
                <Col key={beepCard._id}>
                    <BeepCards
                        beepCard={beepCard}
                        className={styles.beepCard}
                        onBeepCardClicked={setBeepCardToEdit}
                        onDeleteBeepCardClicked={deleteBeepCard}
                    />
                </Col>
            ))}
        </Row>

    return (
        <>
            <Button
                className={`mb-4 ${styleUtils.blockCenter} ${styleUtils.flexCenter}`}
                onClick={() => setShowAddBeepCardDialog(true)}>
                <FaPlus />
                Add new beepCard
            </Button>
            {beepCardsLoading &&  <Spinner animation="border" />}
            {showBeepCardsLoadingError && <p>Something went wrong. Please refresh the page.</p>}
            {!beepCardsLoading && !showBeepCardsLoadingError &&
                <>
                    {beepCards.length > 0
                        ? beepCardsGrid
                        : <p>You don't have any beepCards yet</p>
                    }
                </>
            }
            {showAddBeepCardDialog &&
                <AddEditBeepCardDialog
                    onDismiss={() => setShowAddBeepCardDialog(false)}
                    onBeepCardSaved={(newBeepCard) => {
                        setBeepCards([...beepCards, newBeepCard]);
                        setShowAddBeepCardDialog(false);
                    }}
                />
            }
            {beepCardToEdit &&
                <AddEditBeepCardDialog
                    beepCardToEdit={beepCardToEdit}
                    onDismiss={() => setBeepCardToEdit(null)}
                    onBeepCardSaved={(updateBeepCard) => {
                        setBeepCards(beepCards.map(existingBeepCard => existingBeepCard._id === updateBeepCard._id ? updateBeepCard : existingBeepCard));
                        setBeepCardToEdit(null);
                    }}
                />
            }
        </>
    );
}

export default AdminDashboardPageLoggedInView;