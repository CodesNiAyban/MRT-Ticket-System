import { Button } from "react-bootstrap";

interface NavBarLoggedOutViewProps {
    onLoginClicked: () => void,
}

const NavBarLoggedOutView = ({ onLoginClicked }: NavBarLoggedOutViewProps) => {
    return (
        <>
            <Button
                className="mb-1 ms-auto btn-logout"
                onClick={onLoginClicked}
                style={{ display: "inline-block" }}
            >
                <h6 style={{ position: "static", textAlign: 'center', display: "inline-block" }}>Login</h6>
            </Button>
        </>

    );
}

export default NavBarLoggedOutView;