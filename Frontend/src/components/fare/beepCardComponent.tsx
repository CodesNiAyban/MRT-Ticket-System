import styles from "../../styles/station.module.css"
import styleUtils from "../../styles/utils.module.css"
import { Card } from "react-bootstrap";
import { BeepCard as BeepCardModel } from "../../model/beepCardModel"
import { formatDate } from "../../utils/formatDate";
import { MdDelete } from "react-icons/md"


interface BeepCardProps {
    beepCard: BeepCardModel,
    onBeepCardClicked: (beepCards: BeepCardModel) => void,
    onDeleteBeepCardClicked: (beepCards: BeepCardModel) => void,
    className?: string,
}

const BeepCard = ({ beepCard, onBeepCardClicked, onDeleteBeepCardClicked, className }: BeepCardProps) => {
    const {
        UUIC,
        balance,
        createdAt,
        updatedAt
    } = beepCard;

    let createdUpdatedText: string;
    if (updatedAt > createdAt) {
        createdUpdatedText = "Updated: " + formatDate(updatedAt);
    } else {
        createdUpdatedText = "Created: " + formatDate(createdAt);
    }

    return (
        <Card
            className={`${styles.beepCard} ${className}`}
            onClick={() => onBeepCardClicked(beepCard)}>
            <Card.Body className={styles.cardBody}>
                <Card.Title className={styleUtils.flexCenter}>
                    UUIC: {UUIC}
                    <MdDelete
                        className="text-muted ms-auto"
                        onClick={(e) => {
                            onDeleteBeepCardClicked(beepCard);
                            e.stopPropagation();
                        }}
                    />
                </Card.Title>
                <Card.Text className={styles.cardText}>
                    Balance: {balance}
                </Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">
                {createdUpdatedText}
            </Card.Footer>
        </Card>
    )
}

export default BeepCard;