import React from "react";
import { Button, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { BiEdit } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { TbCurrencyPeso } from "react-icons/tb";
import styles from "././beepCardPageLoggedInView.module.css";

interface ButtonsProps {
  editMode: boolean;
  setSearchQuery: (query: string) => void;
  setShowAddBeepCardDialog: (show: boolean) => void;
  setEditMode: (editMode: boolean) => void;
}

const Buttons: React.FC<ButtonsProps> = ({
  editMode,
  setSearchQuery,
  setShowAddBeepCardDialog,
  setEditMode,
}) => {
  return (
    <Row className="mb-3">
      <Col
        xs={12}
        md={8}
        lg={8}
        className={`${styles.blockStart} d-flex align-items-center`}
      >
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="add-tooltip">Add a new beep card with default load and minimum fare</Tooltip>}
        >
          <Button
            className={`me-1 ${styles.blockStart} ${styles.customButton} ${styles.flexCenter} button1`}
            onClick={() => setShowAddBeepCardDialog(true)}
          >
            <FaPlus />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="edit-tooltip">Switch to {editMode ? "load mode" : "edit mode"}</Tooltip>}
        >
          <Button
            className={`ms-1 ${styles.blockStart} ${styles.flexCenter} ${styles.customButton} ${editMode ? "btn-warning" : "btn-success"} button2`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <BiEdit />
              </>
            ) : (
              <>
                <TbCurrencyPeso />
              </>
            )}
          </Button>
        </OverlayTrigger>
      </Col>
      <Col
        xs={12}
        md={4}
        lg={4}
        className={`${styles.blockStart} ${styles.searchButton} d-flex align-items-center`}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Col>
    </Row>
  );
};

export default Buttons;
