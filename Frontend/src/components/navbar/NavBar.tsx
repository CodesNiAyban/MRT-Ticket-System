import { Container, Nav, Navbar, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Admin } from "../../model/adminModel";
import NavBarLoggedInView from "./NavBarLoggedInView";
import NavBarLoggedOutView from "./NavBarLoggedOutView";
import styles from "./NavBar.module.css"; // Add this line if you have styles

interface NavBarProps {
    loggedInAdmin: Admin | null;
    onLoginClicked: () => void;
    onLogoutSuccessful: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
    loggedInAdmin,
    onLoginClicked,
    onLogoutSuccessful,
}: NavBarProps) => {
    return (
        <Navbar
            bg="dark"
            variant="dark"
            expand="md"
            sticky="top"
            id="main-navbar"
            className="bg-gray-100"
        >
            <Container>
                <Nav.Item>
                    <Navbar.Brand as={Link} to="/stations" className="text-white" style={{display: "inline-block" }}>
                            <div style={{position: "static", textAlign: 'center', padding: '10px' }}>
                                <h1 className="text-xl font-bold mx-auto pl-4" >MRT ONLINE</h1>
                            </div>
                    </Navbar.Brand>
                </Nav.Item>

                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="container-fluid" variant="tabs" style={{ marginLeft: 'auto' }}>
                        {loggedInAdmin ? (
                            <NavBarLoggedInView
                                user={loggedInAdmin}
                                onLogoutSuccessful={onLogoutSuccessful}
                            />
                        ) : (
                            <NavBarLoggedOutView onLoginClicked={onLoginClicked} />
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
