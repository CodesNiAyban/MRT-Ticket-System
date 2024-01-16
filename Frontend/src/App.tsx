import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar/NavBar';
import LoginModal from './components/adminLogin';
import { Admin } from './model/adminModel';
import * as adminApi from "./network/adminAPI";
import BeepCardPage from './pages/beepCardPage';
import PageNotFound from './pages/pageNotFound';
import StationsPage from './pages/stationsPage';
import styles from "./styles/app.module.css"

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
		<BrowserRouter>
			<div>
				<NavBar
					loggedInAdmin={loggedInAdmin}
					onLoginClicked={() => setShowLoginModal(true)}
					onLogoutSuccessful={() => setLoggedInAdmin(null)}
				/>
				<Container className={styles.pageContainer}>
					<Routes>
						<Route
							path='/stations'
							element={<StationsPage loggedInAdmin={loggedInAdmin} />}
						/>
						<Route
							path='/beepcards'
							element={<BeepCardPage loggedInAdmin={loggedInAdmin}/>}
						/>
						<Route
							path='/*'
							element={<PageNotFound />}
						/>
					</Routes>
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
		</BrowserRouter>
	);
}

export default App;