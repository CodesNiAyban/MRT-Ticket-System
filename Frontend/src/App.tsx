import { Container } from 'react-bootstrap';
import LoginModal from './components/adminLogin';
import NavBar from './components/NavBar';
import styles from "./styles/stationPage.module.css";
import { useEffect, useState } from 'react';
import { Admin } from './model/adminModel';
import * as adminApi from "./network/adminAPI";
import StationPageLoggedInView from './components/stationPageLoggedInView';
import StationPageLoggedOutView from './components/stationPageLoggedOutView';

function App() {
	const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
	const [showLoginModal, setShowLoginModal] = useState(false);

	useEffect(() => {
		async function fetchLoggedInAdmin() {
			try {
				const admin = await adminApi.getLoggedInAdmin();
				setLoggedInAdmin(admin);
			} catch (error) {
				console.error(error);
			}
		}
		fetchLoggedInAdmin();
	}, []);

	return (
		<div>
			<NavBar
				loggedInAdmin={loggedInAdmin}
				onLoginClicked={() => setShowLoginModal(true)}
				onLogoutSuccessful={() => setLoggedInAdmin(null)}
			/>
			<Container className={styles.stationPage}>
				<>
					{loggedInAdmin
						? <StationPageLoggedInView />
						: <StationPageLoggedOutView />
					}
				</>
			</Container>
			{showLoginModal &&
				<LoginModal
					onDismiss={() => setShowLoginModal(false)}
					onLoginSuccessful={(admin) => {
						setLoggedInAdmin(admin);
						setShowLoginModal(false);
					}}
				/>
			}
		</div>
	);
}

export default App;