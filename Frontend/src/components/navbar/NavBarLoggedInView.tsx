import { Button, Modal, Navbar } from "react-bootstrap";
import { Admin } from "../../model/adminModel";
import * as AdminApi from "../../network/adminAPI";
import styleUtils from "../styles/utils.module.css";
import { useState } from "react";

interface NavBarLoggedInViewProps {
    user: Admin,
    onLogoutSuccessful: () => void,
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
            <Navbar.Text className="me-4">
                Signed in as: {user.username}
            </Navbar.Text>
            <Button onClick={() => setShowConfirmationModal(true)} className={`mb-1`}>
                Log out
            </Button>

            {/* Confirmation Modal */}
            <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Logout Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to log out?
                </Modal.Body>
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
}

export default NavBarLoggedInView;