// Buttons.tsx

import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { BiEdit, BiPlus } from "react-icons/bi";
import { TbCurrencyPeso } from "react-icons/tb";
import styles from "././beepCardPageLoggedInView.module.css";
import { FaPlus } from "react-icons/fa";

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
        <Button
          className={`me-1 ${styles.blockStart} ${styles.customButton} ${styles.flexCenter} button1`}
          onClick={() => setShowAddBeepCardDialog(true)}
        >
          <FaPlus />
        </Button>

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