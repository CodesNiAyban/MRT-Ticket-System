import React from "react";
import { Card } from "react-bootstrap";
import { BeepCard as BeepCardModel } from "../../../model/beepCardModel";
import { formatDate } from "../../../utils/formatDate";
import styles from "././beepCardComponent.module.css";
import { RiDeleteBin6Line } from "react-icons/ri";

interface BeepCardProps {
  beepCard: BeepCardModel;
  onBeepCardClicked: (beepCards: BeepCardModel) => void;
  onDeleteBeepCardClicked: (beepCards: BeepCardModel) => void;
  className?: string;
  editMode: boolean;
}

const BeepCard: React.FC<BeepCardProps> = ({
  beepCard,
  onBeepCardClicked,
  onDeleteBeepCardClicked,
  className,
  editMode,
}: BeepCardProps) => {
  const { UUIC, balance, isActive, createdAt, updatedAt } = beepCard;

  let createdUpdatedText: string;
  if (updatedAt > createdAt) {
    createdUpdatedText = "Updated: " + formatDate(updatedAt);
  } else {
    createdUpdatedText = "Created: " + formatDate(createdAt);
  }

  return (
    <Card className={`${styles.beepCard} ${className}`} onClick={() => onBeepCardClicked(beepCard)}>
      <Card.Body className={styles.cardBody}>
        <Card.Title className={`${styles.flexCenter} ${styles.cardTitle}`}>
          CARD: {UUIC}
          <RiDeleteBin6Line
            className={`text-muted ms-auto ${styles.deleteIcon}`}
            onClick={(e) => {
              onDeleteBeepCardClicked(beepCard);
              e.stopPropagation();
            }}
          />
        </Card.Title>
        <Card.Text className={styles.cardText}>
          BALANCE: {balance}<br/>
          TAPPED IN: {isActive ? "Yes" : "No"}
        </Card.Text>
  
      </Card.Body>
      <Card.Footer className={`text-muted ${styles.cardFooter}`}>
        {createdUpdatedText}
      </Card.Footer>
    </Card>
  );
}

export default BeepCard;
