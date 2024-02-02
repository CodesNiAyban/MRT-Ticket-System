import { Container } from "react-bootstrap";
import StationPageLoggedInView from "../components/stations/stationPageLoggedInView";
import StationPageLoggedOutView from "../components/stations/stationPageLoggedOutView";
import { Admin } from "../model/adminModel";
import styles from "../styles/stationPage.module.css";

interface LoginProps {
    loggedInAdmin: Admin | null,
}

const  stationPage = ( {loggedInAdmin}: LoginProps) => {
    return (  
        <div className={styles.stationPage} style={{ width:'100%' , height:'100%'}}>
				<>
					{loggedInAdmin
						? <StationPageLoggedInView />
						: <StationPageLoggedOutView />
					}
				</>
			</div>
    );
}
 
export default stationPage;