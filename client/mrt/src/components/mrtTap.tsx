import { faBalanceScale, faCreditCard, faHandPointer, faTrain } from '@fortawesome/free-solid-svg-icons'; // Import the icons you need
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'flowbite-react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReactElement, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify'; // Import React Toastify
import 'react-toastify/dist/ReactToastify.css';
import { formatDate } from "..//utils/formatDate";
import { BeepCard as BeepCardsModel } from "../model/beepCardModel";
import { Fare as FareModel } from "../model/fareModel";
import { Stations as StationsModel } from "../model/stationsModel";
import * as StationApi from '../network/mrtAPI';

const StationPageLoggedInView = () => {
	const [mapCenter, setMapCenter] = useState<[number, number]>([14.550561416466541, 121.02785649562283]);

	// Load Stations
	const [stations, setStations] = useState<StationsModel[]>([]);
	const [fares, setFares] = useState<FareModel[]>([]);
	const [tapInDetails, setTapInDetails] = useState<BeepCardsModel | null>(null);

	const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);
	const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
	const [polylines, setPolylines] = useState<ReactElement[]>([]);
	const [beepCardNumber, setBeepCardNumber] = useState('637805');
	const [beepCard, setBeepCard] = useState<BeepCardsModel | null>(null);

	const minimumFare = fares.find(fare => fare.fareType === 'MINIMUM FARE');
	const { stationName } = useParams();
	const navigate = useNavigate();

	const newCustomIcon = L.icon({
		iconUrl: '/newMarker.png',
		iconSize: [38, 44],
		iconAnchor: [17, 46], //[left/right, top/bottom]
		popupAnchor: [0, -46], //[left/right, top/bottom]
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [40, 40],
		shadowAnchor: [5, 46],
	});

	const customIcon = L.icon({
		iconUrl: 'https://react-component-depot.netlify.app/static/media/marker.a3b2d28b.png',
		iconSize: [40, 40],
		iconAnchor: [17, 46], //[left/right, top/bottom]
		popupAnchor: [0, -46], //[left/right, top/bottom]
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [40, 40],
		shadowAnchor: [10, 46],
	});


	useEffect(() => {
		const loadStationsAndMarkers = async () => {
			try {
				setShowStationsLoadingError(false);
				const stations = await StationApi.fetchStations();
				const fares = await StationApi.fetchFares();

				setStations(stations)
				setFares(fares)

				const isStationNameValid = stations.some(station => station.stationName.replace(/[\s-]+/g, '_').toLocaleLowerCase() === stationName);

				if (!isStationNameValid) {
					// Redirect to PageNotFound if the stationName is not valid
					navigate('/');
					return null; // Return null to prevent rendering the rest of the component
				}

				const markers = stations.map((station) => {
					const isCurrentStation = station.stationName.replace(/[\s-]+/g, '_').toLocaleLowerCase() === stationName;
					return (
						<Marker
							key={station._id}
							position={[station.coords[0], station.coords[1]]}
							icon={isCurrentStation ? newCustomIcon : customIcon} // Use newCustomIcon for the current station
							eventHandlers={{
								mouseover: (event) => event.target.openPopup(),
								mouseout: (event) => event.target.closePopup()
							}}
						>
							{isCurrentStation ? (
								<Popup className={`text-center ${isCurrentStation ? 'rounded-lg shadow-lg' : ''}`}>
									<h3 className="font-bold">{station.stationName}</h3>
									YOU ARE CURRENTLY HERE ^^
								</Popup>
							) : (
								<Popup className={`text-center ${isCurrentStation ? 'rounded-lg shadow-lg' : ''}`}>
									<h3 className="font-bold">{station.stationName}</h3>
									<br />
								</Popup>
							)}
						</Marker>
					);
				});

				setMapMarkers(markers);

				// Calculate average coordinates for the center of the map
				const totalCoords = stations.reduce((acc, station) => {
					return [acc[0] + station.coords[0], acc[1] + station.coords[1]];
				}, [0, 0]);

				setMapCenter([totalCoords[0] / stations.length, totalCoords[1] / stations.length]);

				setPolylines([]);
				const lines: ReactElement[] = [];
				const processedConnections: Set<string> = new Set();

				stations.forEach((station) => {
					station.connectedTo.forEach((connectedStationId) => {
						const connectedStation = stations.find((s) => s._id === connectedStationId);
						if (connectedStation) {
							const connectionKey = [station._id, connectedStation._id].sort().join('-');

							// Check if the connection has been processed to avoid duplicates
							if (!processedConnections.has(connectionKey)) {
								const line = (
									<Polyline
										key={connectionKey}
										positions={[
											[station.coords[0], station.coords[1]],
											[connectedStation.coords[0], connectedStation.coords[1]],
										]}
										color="black"
										weight={3}
										opacity={0.7}
										dashArray="5, 10"
									/>
								);
								lines.push(line);
								processedConnections.add(connectionKey);
							}
						}
					});
				});

				setPolylines(lines);

			} catch (error) {
				console.error(error);
				setShowStationsLoadingError(true);
			}
		}

		loadStationsAndMarkers();
	}, []);

	const handleBeepCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value.startsWith('637805') ? event.target.value : '637805';
		setBeepCardNumber(newValue);
	};

	const handleTapIn = async () => {
		try {
			if (beepCard?.UUIC) {
				// Call tapInBeepCard with the beepCard UUIC
				const tapInDetailsResponse = await StationApi.tapInBeepCard(beepCard.UUIC);

				// Update the local state with the latest beep card details and tap-in details
				setBeepCard(tapInDetailsResponse);
				setTapInDetails(tapInDetailsResponse);

				// Notify the user with React Toastify
				toast.success('Tap-in successful!', {
					position: 'top-right',
					autoClose: 2000, // Auto-close after 2 seconds
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			} else {
				// Notify the user if beepCard is not available
				toast.error('Beep card not found!', {
					position: 'top-right',
					autoClose: 2000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			}
		} catch (error) {
			console.error(error);

			// Notify the user in case of an error
			toast.error('Tap-in failed. Please try again.', {
				position: 'top-right',
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		}
	};

	useEffect(() => {
		const loadBeepCardDetails = async () => {
			try {
				const cardDetails = await StationApi.getBeepCard(beepCardNumber);
				setBeepCard(cardDetails);
			} catch (error) {
				console.error(error);
			}
		};

		if (beepCardNumber !== '637805') {
			loadBeepCardDetails();
		} else {
			setBeepCard(null);
		}
	}, [beepCardNumber]);

	return (
		<>
			<ToastContainer limit={3} />
			{showStationsLoadingError && <p>Something went wrong. Please refresh the page.</p>}
			<div className="flex flex-col lg:flex-row h-screen">
				<MapContainer center={mapCenter} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ width: '100%', height: '100vh' }}>
					<TileLayer
						url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
					/>
					<div
						style={{
							position: 'absolute',
							top: '20px',
							left: '20px',
							fontSize: '20px',
							fontWeight: 'bold',
							color: 'white', // Light black color
							display: 'flex',
							alignItems: 'center',
							zIndex: 9999,
							background: 'rgba(0, 0, 0, 0.7)', // Semi-black background
							borderRadius: '15px', // Bigger border radius
							padding: '10px', // Added padding
						}}
					>
						<FontAwesomeIcon icon={faTrain} size="lg" style={{ marginRight: '10px', color: 'white' }} />
						<h2 style={{ marginLeft: '10px' }}>{stationName!.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</h2>
					</div>
					{mapMarkers}
					{polylines}
				</MapContainer>
				<div className="lg:w-1/2 bg-gray-800 p-4 lg:p-8 text-white flex flex-col items-center h-full">
					<Tabs
						style={{ width: '100%' }}
						selectedTabClassName="react-tabs__tab--selected" // Use the default class for styling the selected tab}
					>
						<TabList className="flex flex-wrap justify-center content-around" style={{ overflow: 'hidden', borderBottom: '2px solid white' }}>
							<Tab>
								<FontAwesomeIcon icon={faHandPointer} size="lg" title="Tap" /> {/* Tap icon */}
								<span className={`text-lg ml-2`}>Tap</span>
							</Tab>
							<Tab>
								<FontAwesomeIcon icon={faBalanceScale} size="lg" title="Fares" /> {/* Balance icon */}
								<span className={`text-lg ml-2`}>Fares</span>
							</Tab>
							<Tab>
								<span className={`text-lg ml-2`}>
									<FontAwesomeIcon icon={faCreditCard} title="Cards" size="lg" style={{ marginRight: '5px' }} />
									Card
								</span>
							</Tab>
						</TabList>

						<TabPanel>
							<div className="flex flex-col justify-center h-full">
								<p className="text-2xl lg:text-3xl text-white mb-1">Card Number:</p>
								<input
									type="text"
									value={beepCardNumber}
									onChange={handleBeepCardNumberChange}
									placeholder="Enter Beep Card Number"
									className="text-xl lg:text-2xl text-black mb-5 p-2 border rounded"
								/>
								{tapInDetails && (
									<div className="mb-5">
										<p className="text-xl lg:text-2xl text-white mb-1">Initial Value: {beepCard?.balance ? beepCard.balance + (minimumFare?.price || 0) : 0}</p>
										<p className="text-xl lg:text-2xl text-white mb-1">Current Station: {stationName?.replace(/[\s_]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())}</p>
										<p className="text-xl lg:text-2xl text-white mb-1">Date of Tap-in: {formatDate(tapInDetails.updatedAt)}</p>
										<p className="text-xl lg:text-2xl text-white mb-1">Deducted Minimum Fare: {minimumFare?.price}</p>
										<p className="text-xl lg:text-2xl text-white mb-1">Current Balance: {tapInDetails.balance}</p>
									</div>
								)}
								<Button
									className="w-full mt-4 lg:mt-auto bg-white text-gray-800 text-sm lg:text-base"
									disabled={!beepCard?.UUIC} // Disable the button if beepCard is null
									onClick={handleTapIn} // Call handleTapIn when the button is clicked
								>
									TAP-IN NOW
								</Button>
							</div>
						</TabPanel>

						<TabPanel>
							{fares.map((fare) => (
								<div key={fare._id} className="mb-3">
									<h2 className="text-2xl lg:text-3xl text-white mb-1">{fare.fareType}</h2>
									<p className="text-xl lg:text-2xl text-white mb-5">${fare.price}</p>
									{/* Add more details as needed */}
								</div>
							))}
						</TabPanel>

						<TabPanel>
							{beepCard && (
								<>
									<h2 className="text-3xl lg:text-4xl font-semibold mb-2 lg:mb-10 text-white flex items-center lg:gap-2 justify-center" style={{ marginTop: '15px' }}>
										Beep Card Info
									</h2>

									<p className="text-2xl lg:text-3xl text-white mb-1">Beep Card ID:</p>
									<p className="text-xl lg:text-2xl text-white mb-5">{beepCard.UUIC}</p>

									<p className="text-2xl lg:text-3xl text-white mb-1">Current Balance:</p>
									<p className="text-xl lg:text-2xl text-white mb-5">${beepCard.balance}</p>

									<p className="text-2xl lg:text-3xl text-white mb-1">Date Created:</p>
									<p className="text-xl lg:text-2xl text-white mb-3">{formatDate(beepCard.createdAt)}</p>

									<p className="text-2xl lg:text-3xl text-white mb-1">Last Updated:</p>
									<p className="text-xl lg:text-2xl text-white mb-3">{formatDate(beepCard.updatedAt)}</p>
									{/* Add more details as needed */}
								</>
							)}
						</TabPanel>
					</Tabs>
				</div>
			</div>
		</>
	);
};

export default StationPageLoggedInView;