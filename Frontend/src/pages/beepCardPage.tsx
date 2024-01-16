import { Container } from "react-bootstrap";
import StationPageLoggedInView from "../components/stationPageLoggedInView";
import StationPageLoggedOutView from "../components/stationPageLoggedOutView";
import { Admin } from "../model/adminModel";
import styles from "../styles/stationPage.module.css";

interface LoginProps {
    loggedInAdmin: Admin | null,
}

const  stationPage = ( {loggedInAdmin}: LoginProps) => {
    return (  
        <Container className={styles.stationPage}>
				<>
					{loggedInAdmin
						? <StationPageLoggedInView />
						: <StationPageLoggedOutView />
					}
				</>
			</Container>
    );
}
 
export default stationPage;