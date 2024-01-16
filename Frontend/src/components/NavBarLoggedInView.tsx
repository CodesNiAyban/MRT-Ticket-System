import { Button, Navbar } from "react-bootstrap";
import { Admin } from "../model/adminModel";
import * as AdminApi from "../network/adminAPI";

interface NavBarLoggedInViewProps {
    user: Admin,
    onLogoutSuccessful: () => void,
}

const NavBarLoggedInView = ({ user, onLogoutSuccessful }: NavBarLoggedInViewProps) => {

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
            <Navbar.Text className="me-2">
                Signed in as: {user.username}
            </Navbar.Text>
            <Button onClick={logout}>Log out</Button>
        </>
    );
}

export default NavBarLoggedInView;