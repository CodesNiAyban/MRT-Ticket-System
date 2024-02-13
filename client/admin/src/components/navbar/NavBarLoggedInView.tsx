import { Button, Modal, Navbar, Nav } from "react-bootstrap";
import { Admin } from "../../model/adminModel";
import * as AdminApi from "../../network/adminAPI";
import { useState } from "react";
import styles from "./NavBar.module.css"
import { Link } from "react-router-dom";

interface NavBarLoggedInViewProps {
    user: Admin;
    onLogoutSuccessful: () => void;
}

const NavBarLoggedInView: React.FC<NavBarLoggedInViewProps> = ({
    user,
    onLogoutSuccessful,
}) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    async function logout() {
        try {
            await AdminApi.logout();
            onLogoutSuccessful();
        } catch (error) {
            console.error(error);
        }
    }

    const handleLogoutConfirmation = () => {
        logout();
        setShowConfirmationModal(false);
    };

    return (
        <>
            <Nav.Item>
                <Nav.Link as={Link} to="/beepcards">
                <h5>Beep Cards</h5>
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to="/stations">
                <h5>Stations</h5>
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to="/fare">
                    <h5>Fare</h5>
                </Nav.Link>
            </Nav.Item>

            <Nav.Item className="ms-auto d-lg-flex align-items-center me-4 center-content">
                <Navbar.Text className="me-lg-2"><h5>Signed in as: <u>{user.username}</u></h5></Navbar.Text>
                <Button
                    className="ms-lg-2 btn-logout"
                    onClick={() => setShowConfirmationModal(true)}
                    style={{display: "inline-block"}}
                >
                    <h6 style={{position: "static", textAlign: 'center', display: "inline-block" }}>Logout</h6>
                </Button>
            </Nav.Item>

            {/* Confirmation Modal */}
            <Modal
                show={showConfirmationModal}
                centered
                onHide={() => setShowConfirmationModal(false)}
                className={`${styles.modalContent} beep-card-modal`}
                style={{ borderRadius: "12px", backgroundColor: "white" }}
            >
                <Modal.Header closeButton className={`${styles.modalHeader} modal-header`}>
                    <Modal.Title className={`${styles.modalTitle} modal-title`}>
                        Logout Confirmation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${styles.modalBody} modal-body`}>
                    Are you sure you want to log out?
                </Modal.Body>
                <Modal.Footer className={`${styles.modalFooter} modal-footer`}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowConfirmationModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleLogoutConfirmation}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NavBarLoggedInView;