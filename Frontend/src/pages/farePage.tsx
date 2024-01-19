import { Container } from "react-bootstrap";
import FarePageLoggedInView from "../components/fare/farePageLoggedInView";
import FarePageLoggedOutView from "../components/fare/farePageLoggedOutView";
import { Admin } from "../model/adminModel";
import styles from "../styles/stationPage.module.css";

interface LoginProps {
    loggedInAdmin: Admin | null,
}

const  farePage = ( {loggedInAdmin}: LoginProps) => {
    return (  
        <Container className={styles.stationPage}>
				<>
					{loggedInAdmin
						? <FarePageLoggedInView />
						: <FarePageLoggedOutView />
					}
				</>
			</Container>
    );
}
 
export default farePage;