import styles from "../../styles/station.module.css"
import styleUtils from "../../styles/utils.module.css"
import { Card } from "react-bootstrap";
import { Fare as FareModel } from "../../model/fareModel"
import { formatDate } from "../../utils/formatDate";


interface FareProps {
    fares: FareModel,
    onFareClicked: (fare: FareModel) => void,
    className?: string,
}

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
        <Card
            className={`${styles.station} ${className}`}
            onClick={() => onFareClicked(fares)}>
            <Card.Body className={styles.cardBody}>
                <Card.Title className={styleUtils.flexCenter}>
                    {fareType}
                </Card.Title>
                <Card.Text className={styles.cardText}>
                    Price: {price}
                </Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">
                {createdUpdatedText}
            </Card.Footer>
        </Card>
    )
}

export default Fare;