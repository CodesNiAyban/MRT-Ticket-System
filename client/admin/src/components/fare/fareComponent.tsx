import styles from "./fare.module.css";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Fare as FareModel } from "../../model/fareModel";
import { formatDate } from "../../utils/formatDate";

interface FareProps {
    fares: FareModel;
    onFareClicked: (fare: FareModel) => void;
    className?: string;
}

const fareTypeDescriptions: Record<string, string> = {
    "MINIMUM FARE": "Minimum fare and fare per km.",
    "DEFAULT LOAD": "Price of beep cards, added to the minimum fare for new cards.",
    "PENALTY FEE": "Charge for passenger penalties (in development)."
};

const Fare = ({ fares, onFareClicked, className }: FareProps) => {
    const {
        fareType,
        price,
        createdAt,
        updatedAt
    } = fares;

    let createdUpdatedText: string;
    if (updatedAt > createdAt) {
        createdUpdatedText = "Updated: " + formatDate(updatedAt);
    } else {
        createdUpdatedText = "Created: " + formatDate(createdAt);
    }

    return (
        <>
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="toggle-view-tooltip">Click to Edit</Tooltip>}
            >
                <Card
                    className={`${styles.fare} ${className}`}
                    onClick={() => onFareClicked(fares)}>
                    <Card.Body className={styles.cardBody}>
                        <Card.Title className={styles.flexCenter}>
                            {fareType === "MINIMUM FARE" ? "MINIMUM FARE/FARE PER KM" : fareType}
                        </Card.Title>
                        <Card.Text className={styles.cardText}>
                            Value: ₱{price}<br />
                            Description: {fareTypeDescriptions[fareType] || fareType}
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer className="text-muted">
                        {createdUpdatedText}
                    </Card.Footer>
                </Card>
            </OverlayTrigger>
        </>
    );
};

export default Fare;
