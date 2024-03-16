import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
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
  const { UUIC, userID, balance, isActive, createdAt, updatedAt } = beepCard;

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
        overlay={<Tooltip id="toggle-view-tooltip">{editMode ? "Click to Edit Card" : "Click to Load Card"}</Tooltip>}
      >
        <Card className={`${styles.beepCard} ${className}`} onClick={() => onBeepCardClicked(beepCard)}>
          <Card.Body className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <div className={styles.flexRow}>
                <Card.Title className={`${styles.cardTitle}`}>
                  CARD: {UUIC}
                </Card.Title>
              </div>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="delete-icon-tooltip">Delete Card</Tooltip>}
              >
                <RiDeleteBin6Line
                  className={`${styles.deleteIcon} ${styles.lightRedIcon}`}
                  onClick={(e) => {
                    onDeleteBeepCardClicked(beepCard);
                    e.stopPropagation();
                  }}
                />
              </OverlayTrigger>
            </div>
            <Card.Text className={styles.cardText}>
              {userID && <>USER: {userID}<br /></>}
              BALANCE: ₱{balance}<br />
              <div className={isActive ? styles.flexRowActive : styles.flexRowInactive}>
                <div className={isActive ? styles.greenCircle : styles.redCircle} />
                {isActive ? 'OnBoarded' : 'Not Onboarded'}
              </div>
            </Card.Text>
          </Card.Body>
          <Card.Footer className={`text-white ${styles.cardFooter}`}>
            {createdUpdatedText}
          </Card.Footer>
        </Card>
      </OverlayTrigger>
    </>
  );
}

export default BeepCard;
