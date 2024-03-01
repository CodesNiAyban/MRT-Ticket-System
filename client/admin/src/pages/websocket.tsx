import { Container } from "react-bootstrap";
import WebSocketTesterIn from "../components/websocket/webSocketTesterIn"; // Import WebSocketTester component
import WebSocketTesterOut from "../components/websocket/webSocketTesterOut"; // Import WebSocketTester component
import { Admin } from "../model/adminModel";
import styles from "../styles/stationPage.module.css";

interface LoginProps {
	loggedInAdmin: Admin | null,
}

const WebSocketPage = ({ loggedInAdmin }: LoginProps) => {
	return (
		<Container className={styles.stationPage}>
			<>
				{loggedInAdmin ? (
					<>
						<WebSocketTesterIn />
					</>
				) : (
					<WebSocketTesterOut />
				)}
			</>
		</Container>
	);
}

export default WebSocketPage;
