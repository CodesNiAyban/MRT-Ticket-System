import { Container, Nav, Navbar } from "react-bootstrap";
import { Admin } from "../../model/adminModel";
import NavBarLoggedInView from "./NavBarLoggedInView";
import NavBarLoggedOutView from "./NavBarLoggedOutView";
import { Link } from "react-router-dom";
import { adminLogin } from "../../network/adminAPI";

interface NavBarProps {
    loggedInAdmin: Admin | null,
    onLoginClicked: () => void,
    onLogoutSuccessful: () => void,
}

const navBarLinks =
    <Nav className="container-fluid" variant="tabs">

        <Nav.Item>
            <Nav.Link as={Link} to="/beepcards">Beep Cards</Nav.Link>
        </Nav.Item>

        <Nav.Item>
            <Nav.Link as={Link} to="/stations">Stations</Nav.Link>
        </Nav.Item>

        <Nav.Item>
            <Nav.Link as={Link} to="/fare">Fare</Nav.Link>
        </Nav.Item>
    </Nav>

const NavBar = ({ loggedInAdmin, onLoginClicked, onLogoutSuccessful }: NavBarProps) => {
    return (
        <Navbar bg="dark" variant="dark" expand="sm" sticky="top" id="main-navbar">
            <Container>
                <Nav.Item>
                    <Navbar.Brand as={Link} to="/stations">
                        <img
                            alt=""
                            src="./mrtlogo.png"
                            width="35"
                            height="35"
                            className="d-inline-block align-top"
                        />{' '}
                        MRT ONLINE
                    </Navbar.Brand>
                </Nav.Item>

                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="container-fluid" variant="tabs">
                        {loggedInAdmin ? (
                            <NavBarLoggedInView user={loggedInAdmin} onLogoutSuccessful={onLogoutSuccessful} />
                        ) : (
                            <NavBarLoggedOutView onLoginClicked={onLoginClicked} />
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;