import { Button, Navbar } from "react-bootstrap";
import { Admin } from "../../model/adminModel";
import * as AdminApi from "../../network/adminAPI";
import styleUtils from "../styles/utils.module.css"

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
            <Navbar.Text className="me-3">
                Signed in as: {user.username}
            </Navbar.Text>
            <Button onClick={logout} className={`mb-1`}>Log out</Button>
        </>
    );
}

export default NavBarLoggedInView;