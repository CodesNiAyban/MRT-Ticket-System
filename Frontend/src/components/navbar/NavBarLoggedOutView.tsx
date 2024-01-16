import { Button } from "react-bootstrap";

interface NavBarLoggedOutViewProps {
    onLoginClicked: () => void,
}

const NavBarLoggedOutView = ({ onLoginClicked }: NavBarLoggedOutViewProps) => {
    return (
        <>
            <Button onClick={onLoginClicked} className={`mb-1`}>Log In</Button>
        </>
    );
}

export default NavBarLoggedOutView;