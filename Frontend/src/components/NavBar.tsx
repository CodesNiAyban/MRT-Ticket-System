import { Container, Nav, Navbar } from "react-bootstrap";
import { Admin } from "../model/adminModel";
import NavBarLoggedInView from "./NavBarLoggedInView";
import NavBarLoggedOutView from "./NavBarLoggedOutView";

interface NavBarProps {
    loggedInAdmin: Admin | null,
    onLoginClicked: () => void,
    onLogoutSuccessful: () => void,
}

const NavBar = ({loggedInAdmin, onLoginClicked, onLogoutSuccessful}: NavBarProps) => {
    return ( 
        <Navbar bg="primary" variant="dark" expand="sm" sticky="top">
            <Container>
                <Navbar.Brand>
                    MRT ONLINE
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto">
                        { loggedInAdmin
                        ? <NavBarLoggedInView user={loggedInAdmin} onLogoutSuccessful={onLogoutSuccessful} />
                        : <NavBarLoggedOutView onLoginClicked={onLoginClicked}/>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
     );
}
 
export default NavBar;