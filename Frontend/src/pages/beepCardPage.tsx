import { Container } from "react-bootstrap";
import BeepCardPageLoggedInView from "../components/beepCards/beepCardPageLoggedInView";
import BeepCardPageLoggedOutView from "../components/beepCards/beepCardPageLoggedOutView";
import { Admin } from "../model/adminModel";
import styles from "../styles/stationPage.module.css";

interface LoginProps {
    loggedInAdmin: Admin | null,
}

const  beepCardPage = ( {loggedInAdmin}: LoginProps) => {
    return (  
        <Container className={styles.stationPage}>
				<>
					{loggedInAdmin
						? <BeepCardPageLoggedInView />
						: <BeepCardPageLoggedOutView />
					}
				</>
			</Container>
    );
}
 
export default beepCardPage;