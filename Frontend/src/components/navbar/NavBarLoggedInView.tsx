// NavBarLoggedInView.tsx
import { Button, Modal, Navbar, Nav } from "react-bootstrap";
import { Admin } from "../../model/adminModel";
import * as AdminApi from "../../network/adminAPI";
import styleUtils from "../styles/utils.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface NavBarLoggedInViewProps {
    user: Admin;
    onLogoutSuccessful: () => void;
}

const NavBarLoggedInView = ({ user, onLogoutSuccessful }: NavBarLoggedInViewProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    async function logout() {
        try {
            await AdminApi.logout();
            onLogoutSuccessful();
        } catch (error) {
            console.error(error);
            alert(error);
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
                    Beep Cards
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to="/stations">
                    Stations
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to="/fare">
                    Fare
                </Nav.Link>
            </Nav.Item>
            <Nav.Item className={`${"ms-auto"}`}>
            <Navbar.Text className={`${"me-4"}`}>
                    Signed in as: {user.username}
                </Navbar.Text>
                <Button onClick={() => setShowConfirmationModal(true)} className={`${"ms-auto"}`}>
                    Log out
                </Button>
            </Nav.Item>

            {/* Confirmation Modal */}
            <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Logout Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to log out?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
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
