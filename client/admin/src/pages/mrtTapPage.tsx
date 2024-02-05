import { Container } from "react-bootstrap";
import MrtPageView from "../components/mrt/mrtTap";
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
						? <MrtPageView />
						: <MrtPageView />
					}
				</>
			</div>
    );
}
 
export default stationPage;