import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointer, faBalanceScale, faExchangeAlt, faTrain, faCreditCard, faMoneyBill } from '@fortawesome/free-solid-svg-icons'; // Import the icons you need
import 'leaflet/dist/leaflet.css';
import 'react-tabs/style/react-tabs.css';

const StationPageLoggedInView = () => {
	const [mapCenter] = useState<[number, number]>([14.550561416466541, 121.02785649562283]);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);

	useEffect(() => {
		// You can add additional logic here for any map-related effects or updates
	}, []);

	return (
		<>
			<div className="flex flex-col lg:flex-row h-screen">
				<MapContainer center={mapCenter} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ width: '100%', height: '100vh' }}>
					<TileLayer
						url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
					/>

					{/* Add the big text label in the top left corner */}
					<div
						style={{
							position: 'absolute',
							top: '20px',
							left: '20px',
							fontSize: '28px',
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
						<h2 style={{ marginLeft: '10px' }}>AYALA STATION</h2>
					</div>
				</MapContainer>
				<div className="lg:w-1/2 bg-gray-800 p-4 lg:p-8 text-white flex flex-col items-center h-full">
					<Tabs
						style={{ width: '100%' }}
						selectedTabClassName="react-tabs__tab--selected" // Use the default class for styling the selected tab
						onSelect={(index) => setSelectedTabIndex(index)}
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
									Cards
								</span>
							</Tab>
						</TabList>

						<TabPanel>
							<div className="flex flex-col justify-center h-full">
								<h2 className="text-3xl lg:text-4xl font-semibold mb-2 lg:mb-10 text-white flex items-center lg:gap-2 justify-center" style={{ marginTop: '15px' }}>
									TAP-IN DETAILS
								</h2>
								{/* Placeholder content, replace with actual MRT Beepcard details */}
								<p className="text-2xl lg:text-3xl text-white mb-1">Card Number:</p>
								<p className="text-xl lg:text-2xl text-white mb-5">1234-5678-9012-3456</p>

								<p className="text-2xl lg:text-3xl text-white mb-1">Balance:</p>
								<p className="text-xl lg:text-2xl text-white mb-5">$50.00</p>

								<p className="text-2xl lg:text-3xl text-white mb-1">Last Tap-in:</p>
								<p className="text-xl lg:text-2xl text-white mb-3">2024-02-05 08:30 AM</p>
								{/* Add more details as needed */}
								<Button className="w-full mt-4 lg:mt-auto bg-white text-gray-800 text-sm lg:text-base">
									TAP-IN NOW
								</Button>
							</div>
						</TabPanel>

						<TabPanel>
							PUT SOMETHING HERE SOON...
						</TabPanel>

						<TabPanel>
							WAIT FOR UPDATES...
						</TabPanel>
					</Tabs>
				</div>
			</div>
		</>
	);
};

export default StationPageLoggedInView;
