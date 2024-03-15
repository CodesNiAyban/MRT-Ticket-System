import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Nav, Navbar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Admin } from '../../model/adminModel';
import * as MaintenanceApi from "../../network/maintenanceAPI";
import * as AdminApi from "../../network/adminAPI";
import styles from "./NavBar.module.css";

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

    const navigate = useNavigate();

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
    }, [maintenanceMode]);

    const navigateToCardsPage = () => {
        navigate("/beepcards");
    };

    const handleLogoutConfirmation = () => {
        logout();
        setShowConfirmationModal(false);
    };

    const handleMaintenanceSwitch = async () => {
        try {
            // Update maintenance mode status when the switch is toggled
            const maintenance = await MaintenanceApi.updateMaintenance({
                maintenance: !maintenanceMode,
            });
            setMaintenanceMode(maintenance.maintenance);
            if (!!!maintenance.maintenance) {
                navigateToCardsPage(); // Navigate to Cards page when activating maintenance
            }
        } catch (error: any) {
            setMaintenanceMode(!maintenanceMode);
            alert(error.message)
            console.error(error);
        }
    };

    async function logout() {
        try {
            await AdminApi.logout();
            onLogoutSuccessful();
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

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
                            <Nav.Link as={Link} to="/stations" disabled={!maintenanceMode}>
                                <h5 className={`nav-link-text ${maintenanceMode ? 'disabled' : ''}`}>Stations</h5>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav.Item>
                    <Nav.Item>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-fare">Fare</Tooltip>}
                        >
                            <Nav.Link as={Link} to="/fare" disabled={!maintenanceMode}>
                                <h5 className={`nav-link-text ${maintenanceMode ? 'disabled' : ''}`}>Fare</h5>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav.Item>
                </Nav>
                <Nav>
                    <Navbar.Text>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip id="tooltip-maintenance">{maintenanceMode ? 'Enable Operational Mode: Deploy MRT Online Tap' : 'Enable Maintenance Mode: Station and Fare Control'}</Tooltip>}
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
