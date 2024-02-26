import { Button, Modal, Navbar, Nav, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Admin } from "../../model/adminModel";
import * as AdminApi from "../../network/adminAPI";
import * as MaintenanceApi from "../../network/maintenanceAPI"
import { useEffect, useState } from "react";
import styles from "./NavBar.module.css";
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
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        async function fetchMaintenanceMode() {
            try {
                const maintenance = await MaintenanceApi.fetchMaintenance();
                setMaintenanceMode(maintenance[0].maintenance);
            } catch (error) {
                console.error(error);
            }
        }

        fetchMaintenanceMode();
    }, []); // Run once when component mounts


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

    const handleMaintenanceSwitch = async () => {
        setMaintenanceMode(!maintenanceMode);
        try {
            // Update maintenance mode status when the switch is toggled
            await MaintenanceApi.updateMaintenance({
                maintenance: !maintenanceMode,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Item>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-cards">Cards</Tooltip>}
                        >
                            <Nav.Link as={Link} to="/beepcards">
                                <h5 className="nav-link-text">Cards</h5>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav.Item>
                    <Nav.Item>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-stations">Stations</Tooltip>}
                        >
                            <Nav.Link as={Link} to="/stations">
                                <h5 className="nav-link-text">Stations</h5>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav.Item>
                    <Nav.Item>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-fare">Fare</Tooltip>}
                        >
                            <Nav.Link as={Link} to="/fare">
                                <h5 className="nav-link-text">Fare</h5>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav.Item>
                    <Nav.Item>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-transactions">Transactions</Tooltip>}
                        >
                            <Nav.Link as={Link} to="/fare">
                                <h5 className="nav-link-text">Transactions</h5>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav.Item>
                </Nav>
                <Nav>
                    <Navbar.Text>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-maintenance">Maintenance</Tooltip>}
                        >
                            <Form.Check
                                type="switch"
                                id="maintenance-switch"
                                checked={maintenanceMode}
                                onChange={handleMaintenanceSwitch}
                            />
                        </OverlayTrigger>
                    </Navbar.Text>
                    <Navbar.Text>
                        <h6 className="nav-link-text">Signed in as: <u>{user.username}</u></h6>
                    </Navbar.Text>
                    <Button
                        className="mb-1 ms-lg-2 btn-logout"
                        onClick={() => setShowConfirmationModal(true)}
                    >
                        <h6 style={{ position: "static", textAlign: 'center', display: "inline-block" }}>Logout</h6>
                    </Button>
                </Nav>
            </Navbar.Collapse>

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
