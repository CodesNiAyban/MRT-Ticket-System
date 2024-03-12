/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { faBalanceScale, faCreditCard, faHandPointer, faTrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'flowbite-react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReactElement, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import uuid from 'react-native-uuid';
import QRCode from 'react-qr-code'; // Import QRCode component
import { useNavigate, useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import { BeepCard as BeepCardsModel } from "../model/beepCardModel";
import { Fare as FareModel } from "../model/fareModel";
import { Stations as StationsModel } from "../model/stationsModel";
import { TapInTransaction as TapInTransactionModel } from "../model/tapInTransactionModel";
import * as StationApi from '../network/mrtAPI';
import MaintenancePage from '../pages/maintenancePage';
import { formatDate } from "../utils/formatDate";

const MrtTapIn = () => {
    const [mapCenter, setMapCenter] = useState<[number, number]>([14.550561416466541, 121.02785649562283]);

    // Load Stations
    const [stations, setStations] = useState<StationsModel[]>([]);
    const [fares, setFares] = useState<FareModel[]>([]);
    const [tapInDetails, setTapInDetails] = useState<TapInTransactionModel | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);
    const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
    const [polylines, setPolylines] = useState<ReactElement[]>([]);
    const [beepCardNumber, setBeepCardNumber] = useState('637805');
    const [beepCardNumberCheck, setBeepCardNumberCheck] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [beepCard, setBeepCard] = useState<BeepCardsModel | null>(null);

    const [receivedMessage, setReceivedMessage] = useState<string | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isScanned, setIsScanned] = useState(false);
    const [room, setRoom] = useState<any>(uuid.v4()); // Generate initial room value using UUID
    const [message, setMessage] = useState('');
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const [roomJoiner, setRoomJoiner] = useState(false); // State to track whether room is joined

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
        document.title = 'MRT ONLINE TAP-IN'; // Set the title dynamically
    }, []);

    useEffect(() => {
        const initializeSocket = async () => {
            try {
                const newSocket = await StationApi.connectWebsocket();
                setSocket(newSocket);

                // Listen for messages from the server
                newSocket!.on('message', (msg: string) => {
                    setReceivedMessage(msg);
                });

                // Set connection status
                newSocket!.on('connect', () => {
                    setRoomJoiner(true)
                    setIsConnected(true);
                });

                newSocket!.on('disconnect', () => {
                    setIsConnected(false);
                    setIsRoomJoined(false); // Reset room joined status on disconnect
                });

            } catch (error) {
                console.error('Error connecting to WebSocket:', error);
            }
        };

        initializeSocket();

        return () => {
            // Cleanup function
            if (socket) {
                socket.disconnect(); // Disconnect WebSocket connection when component unmounts
            }
        };
    }, []);

    useEffect(() => {
        if (roomJoiner) {
            setRoomJoiner(false)
            console.log("natawag")
            joinRoom();
        }
    }, [roomJoiner]);

    const isValidBeepCard = (value: string) => {
        const regex = /^637805\d{9}$/;
        return regex.test(value);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (isValidBeepCard(receivedMessage!)) {
                try {
                    // Fetch the beep card details based on the received UUIC message
                    const cardDetails = await StationApi.getBeepCard(receivedMessage!);
                    setBeepCardNumber(cardDetails?.UUIC!)
                    setBeepCardNumberCheck(true);
                    setIsScanned(true)
                } catch (error) {
                    setBeepCardNumberCheck(false);
                }
            }
        };

        fetchData();
    }, [receivedMessage]);

    const sendMessage = (message: string) => {
        if (socket && room && message) {
            socket.emit('messageToRoom', { room, message });
        }
    };

    const joinRoom = async () => { // Accept newSocket as a parameter
        if (socket && room) { // Use newSocket instead of socket
            socket.emit('joinRoom', room); // Use newSocket instead of socket
            setIsRoomJoined(true);
            console.log("Nakajoin")
        }
    };

    const leaveRoom = () => {
        // Leave a room
        if (socket && room) {
            socket.emit('leaveRoom', room);
            setIsRoomJoined(false); // Reset room joined status when leaving room
        }
    };

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const maintenanceStatus = await StationApi.fetchMaintenance();
                setIsMaintenance(maintenanceStatus[0].maintenance);
                if (isMaintenance) {
                    sendMessage("Page is on Maintenance");
                }
            } catch (error) {
                console.error('Error checking maintenance:', error);
                sendMessage(error as string)
            }
        };

        checkMaintenance();
    }, [beepCardNumber, isMaintenance]);


    useEffect(() => {
        const loadStationsAndMarkers = async () => {
            try {
                setShowStationsLoadingError(false);
                const stations = await StationApi.fetchStations();
                const fares = await StationApi.fetchFares();

                setStations(stations)
                setFares(fares)

                const isStationNameValid = stations.some(station => station.stationName.replace(/[\s-]+/g, '_') === stationName);

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
                                    <h3 className="font-bold">{toTitleCase(station.stationName)}</h3>
                                    YOU ARE CURRENTLY HERE
                                </Popup>
                            ) : (
                                <Popup className={`text-center ${isCurrentStation ? 'rounded-lg shadow-lg' : ''}`}>
                                    <h3 className="font-bold">{toTitleCase(station.stationName)}</h3>
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
        // Limit input to numbers only
        const newValue = event.target.value.replace(/\D/g, '').startsWith('637805') ? event.target.value.replace(/\D/g, '') : '637805';
        setBeepCardNumber(newValue);
        // Limit input to maximum of 15 characters
        const maxLength = 15;
        const truncatedValue = newValue.slice(0, maxLength);
        setBeepCardNumber(truncatedValue);

        // Reset tap-in details when changing the beep card number
        setTapInDetails(null);
    };

    const handleTapIn = async () => {
        try {
            setIsScanned(false)
            setIsSubmitting(true);
            const cardDetails = await StationApi.getBeepCard(beepCardNumber);
            if (cardDetails?.UUIC) {
                if (cardDetails?.balance !== undefined && minimumFare?.price !== undefined) {
                    if (cardDetails.balance >= minimumFare.price) {
                        // Sufficient balance, proceed with tap-in
                        if (!cardDetails.isActive) {
                            // Construct tap-in transaction object
                            const beepCardResponse = await StationApi.tapInBeepCard(cardDetails.UUIC);

                            const tapInTransaction: TapInTransactionModel = {
                                UUIC: cardDetails.UUIC,
                                tapIn: true,
                                initialBalance: cardDetails.balance,
                                currStation: stationName?.replace(/[\s_]+/g, ' ').replace(/\b\w/g, (match) => match.toLocaleLowerCase()),
                                prevStation: "N/A",
                                fare: 0,
                                distance: 0,
                                currBalance: beepCardResponse!.balance, // Update current balance after tap-in
                                createdAt: new Date().toISOString(), // Set current timestamp as creation time
                                updatedAt: new Date().toISOString(), // Set current timestamp as update time
                            };

                            // Send tap-in transaction to API
                            const tapInDetailsResponse = await StationApi.createTapInTransaction(tapInTransaction);

                            setBeepCard(beepCardResponse);

                            // Update beep card details and tap-in details
                            setTapInDetails(tapInDetailsResponse);

                            // Show success message
                            toast.success('Tap-in successful. Enjoy your trip!', {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                            sendMessage("Tap-in successful. Enjoy your trip!")
                        } else {
                            // Beep card is already tapped in
                            toast.warn('Beep Card Already Tapped In', {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                            sendMessage("Beep Card Already Tapped In")
                        }
                    } else {
                        // Insufficient balance
                        toast.error('Insufficient balance. Please top up your beep card', {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                        sendMessage("Insufficient balance. Please top up your beep card")
                    }
                } else {
                    // Handle case where balance or price is undefined
                    console.error('Beep card balance or minimum fare price is undefined');
                    sendMessage("Beep card balance or minimum fare price is undefined")
                }
            } else {
                setBeepCardNumberCheck(false)
                toast.error('Beep card not found!', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                sendMessage("Beep card not found!")
            }
        } catch (error) {
            console.error(error);
            // Show error message
            toast.error('Tap-in failed. Please try again', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            sendMessage("Tap-in failed. Please try again")
        } finally {
            setReceivedMessage('')
            setIsSubmitting(false);
            setIsScanned(false);
            console.log("natawag" + message)
            setTimeout(() => {
                setTapInDetails(null);
                setReceivedMessage("")
                setBeepCardNumber('637805')
            }, 3000); // 5000 milliseconds = 5 seconds
        }
    }; // Empty dependencies array


    useEffect(() => {
        const loadBeepCardDetails = async () => {
            try {
                let cardDetails = await StationApi.getBeepCard(beepCardNumber);
                setBeepCard(cardDetails);
                setBeepCardNumberCheck(true)
                if (isScanned && cardDetails) {
                    cardDetails = null
                    setIsScanned(false)
                    handleTapIn()
                }
            } catch (error) {
                setBeepCardNumberCheck(false)
            }
        };

        if (beepCardNumber !== '637805') {
            loadBeepCardDetails();
        } else {
            setBeepCard(null);
        }
    }, [beepCardNumber, isScanned]);

    function toTitleCase(str: string) {
        return str.replace(/\b\w/g, function (char: string) {
            return char.toUpperCase();
        });
    }

    return (
        <>
            {isMaintenance ? (
                <MaintenancePage />
            ) : (
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
                                            maxLength={15}
                                            className="text-xl lg:text-2xl text-black mb-5 p-2 border rounded"
                                        />
                                        {tapInDetails && (
                                            <div className="mb-5">
                                                <p className="text-xl lg:text-2xl text-white mb-1">Current Station: {stationName?.replace(/[\s_]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())}</p>
                                                <p className="text-xl lg:text-2xl text-white mb-1">Date of Tap-in: {formatDate(tapInDetails.updatedAt)}</p>
                                                <p className="text-xl lg:text-2xl text-white mb-1">Current Balance: {tapInDetails.currBalance}</p>
                                            </div>
                                        )}
                                        {room && socket && isRoomJoined && !!!receivedMessage && (
                                            <div className="flex justify-center items-center mt-2 pb-4"> {/* Added pb-4 for bottom padding */}
                                                <QRCode value={room} fgColor="#333" size={150} style={{ outline: '10px solid white' }} /> {/* Reduced size of QR code */}
                                            </div>
                                        )}
                                        <Button
                                            className="w-full mt-4 lg:mt-auto bg-white text-gray-800 text-sm lg:text-base"
                                            disabled={!beepCard?.UUIC || isSubmitting || receivedMessage !== ""} // Disable the button if beepCard is null
                                            onClick={handleTapIn}
                                        >
                                            {isSubmitting ? 'TAPPING IN...' : 'TAP-IN'}
                                        </Button>
                                    </div>
                                </TabPanel>

                                <TabPanel>
                                    {fares.map((fare) => (
                                        <div key={fare._id} className="mb-3">
                                            <h2 className="text-2xl lg:text-3xl text-white mb-1">{fare.fareType}</h2>
                                            <p className="text-xl lg:text-2xl text-white mb-5">{fare.price}</p>
                                            {/* Add more details as needed */}
                                        </div>
                                    ))}
                                </TabPanel>

                                <TabPanel>
                                    {beepCard ? (
                                        <>
                                            <h2 className="text-3xl lg:text-4xl font-semibold mb-2 lg:mb-10 text-white flex items-center lg:gap-2 justify-center" style={{ marginTop: '15px' }}>
                                                Beep Card Info
                                            </h2>

                                            <p className="text-2xl lg:text-3xl text-white mb-1">Beep Card ID:</p>
                                            <p className="text-xl lg:text-2xl text-white mb-5">{beepCard.UUIC}</p>

                                            <p className="text-2xl lg:text-3xl text-white mb-1">Current Balance:</p>
                                            <p className="text-xl lg:text-2xl text-white mb-5">{beepCard.balance}</p>

                                            <p className="text-2xl lg:text-3xl text-white mb-1">Date Created:</p>
                                            <p className="text-xl lg:text-2xl text-white mb-3">{formatDate(beepCard.createdAt)}</p>

                                            <p className="text-2xl lg:text-3xl text-white mb-1">Last Updated:</p>
                                            <p className="text-xl lg:text-2xl text-white mb-3">{formatDate(beepCard.updatedAt)}</p>
                                            {/* Add more details as needed */}
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-3xl lg:text-4xl font-semibold mb-2 lg:mb-10 text-white flex items-center lg:gap-2 justify-center" style={{ marginTop: '15px' }}>
                                                No Beep Card Entered
                                            </h2>
                                        </>
                                    )}
                                </TabPanel>
                            </Tabs>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default MrtTapIn;
