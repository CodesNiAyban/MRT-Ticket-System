import { useState } from "react";
import { Button } from "react-bootstrap";

interface NavBarLoggedOutViewProps {
    onLoginClicked: () => void;
    isNavbarCollapsed?: boolean; // Make the prop optional
}

const NavBarLoggedOutView = ({ onLoginClicked, isNavbarCollapsed }: NavBarLoggedOutViewProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleClick = () => {
        onLoginClicked();
        if (isNavbarCollapsed) {
            setIsCollapsed(false);
        }
    };

    return (
        <>
            <Button
                className={`mb-1 btn-logout d-block d-${isCollapsed ? "block" : "sm-inline-block"} d-sm-inline-block`}
                onClick={handleClick}
                style={{ float: isCollapsed ? 'right' : 'none' }}
            >
                <h6 style={{ position: "static", textAlign: 'center', display: "inline-block" }}>Login</h6>
            </Button>
        </>
    );
}

export default NavBarLoggedOutView;
