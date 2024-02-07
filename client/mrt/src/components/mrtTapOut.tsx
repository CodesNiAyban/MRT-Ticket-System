import { faBalanceScale, faCreditCard, faHandPointer, faTrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'flowbite-react';
import { Graph, alg } from 'graphlib';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReactElement, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BeepCard as BeepCardsModel } from "../model/beepCardModel";
import { Fare as FareModel } from "../model/fareModel";
import { Stations as StationsModel } from "../model/stationsModel";
import { TapInTransaction as TapInTransactionModel } from "../model/tapInTransactionModel";
import { TapOutTransaction as TapOutTransactionModel } from "../model/tapOutTransactionModel";
import * as StationApi from '../network/mrtAPI';
import { formatDate } from "../utils/formatDate";

const MrtTapOut = () => {
    const [mapCenter, setMapCenter] = useState<[number, number]>([14.550561416466541, 121.02785649562283]);

    // Load Stations
    const [stations, setStations] = useState<StationsModel[]>([]);
    const [fares, setFares] = useState<FareModel[]>([]);
    const [tapOutDetails, setTapOutDetails] = useState<TapOutTransactionModel | null>(null);

    const [showStationsLoadingError, setShowStationsLoadingError] = useState(false);
    const [mapMarkers, setMapMarkers] = useState<ReactElement[]>([]);
    const [polylines, setPolylines] = useState<ReactElement[]>([]);
    const [pathPolylines, setPathPolylines] = useState<ReactElement[]>([]);
    const [beepCardNumber, setBeepCardNumber] = useState('637805');
    const [beepCard, setBeepCard] = useState<BeepCardsModel | null>(null);
    const [transactionResponse, setTransactionResponse] = useState<TapInTransactionModel | null>(null);
    const [farePerMeters, setFarePerMeters] = useState(Number)

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
        document.title = 'MRT ONLINE TAP-OUT'; // Set the title dynamically
    }, []);

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

        // Reset tap-in details when changing the beep card number
        setTapOutDetails(null);
    };


    const findShortestPath = (stations: StationsModel[], startStationId: string, endStationId: string): string[] => {
        const graph = new Graph();

        // Add stations and their connections to the graph
        stations.forEach(station => {
            graph.setNode(station._id);
            station.connectedTo.forEach(connectedStationId => {
                graph.setEdge(station._id, connectedStationId);
            });
        });

        // Find the shortest path using Dijkstra's algorithm
        const shortestPath = alg.dijkstra(graph, startStationId);

        // Get the shortest path as an array of station IDs
        const path: string[] = [];
        let currentStationId = endStationId;
        while (currentStationId !== startStationId) {
            path.push(currentStationId);
            currentStationId = shortestPath[currentStationId].predecessor;
        }
        path.push(startStationId); // Add the start station ID
        path.reverse(); // Reverse the array to get the correct order from start to end
        return path;
    };

    const handleTapOut = async () => {
        try {
            if (beepCard?.UUIC) {
                if (beepCard?.balance !== undefined && minimumFare?.price !== undefined) {
                    if (beepCard.balance >= minimumFare.price) {
                        // Sufficient balance, proceed with tap-in
                        if (beepCard.isActive) {
                            // Construct tap-in transaction object
                            const beepCardResponse = await StationApi.tapOutBeepCard(beepCard.UUIC, farePerMeters); //replace 10 with minimumFare per 500m approximately then if not exact value, return approximate

                            const tapOutTransaction: TapOutTransactionModel = {
                                UUIC: beepCard.UUIC,
                                tapIn: false,
                                initialBalance: beepCard.balance,
                                prevStation: transactionResponse?.currStation,
                                currStation: stationName?.replace(/[\s_]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase()),
                                fare: farePerMeters, //Change to per km fare 
                                currBalance: beepCardResponse?.balance,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            };

                            // Send tap-in transaction to API
                            const tapOutDetailsResponse = await StationApi.createTapOutTransaction(tapOutTransaction);

                            setBeepCard(beepCardResponse);

                            // Update beep card details and tap-in details
                            setTapOutDetails(tapOutDetailsResponse);

                            // Show success message
                            toast.success('Tap-out successful! Thank you for using MRT-3', {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                        } else {
                            // Beep card is already tapped in
                            toast.warn('Beep Card Already Tapped Out.', {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });
                        }
                    } else {
                        // Insufficient balance
                        toast.error('Insufficient balance. Please top up your beep card.', {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                } else {
                    // Handle case where balance or price is undefined
                    console.error('Beep card balance or minimum fare price is undefined');
                }
            } else {
                // Beep card not found
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
            // Show error message
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

    const calculateFare = (pathDistance: number, minimumFare: FareModel | undefined) => {
        const baseFare = minimumFare?.price;
        const additionalMeters = pathDistance - 500; // Exclude the first 500 meters
        const farePer500Meters = minimumFare?.price; // Adjust this value as needed

        // Calculate the additional fare for every 500 meters beyond the first 500 meters
        const additionalFare = Math.ceil(additionalMeters / 500) * farePer500Meters!;

        // Total fare is the base fare plus additional fare
        const totalFare = baseFare! + additionalFare;

        return totalFare;
    };

    useEffect(() => {
        setPathPolylines([])
        const loadBeepCardDetails = async () => {
            try {
                const cardDetails = await StationApi.getBeepCard(beepCardNumber);
                if (cardDetails) {
                    const transactionResponse = await StationApi.getTapInTransactionByUUIC(beepCardNumber);
                    setTransactionResponse(transactionResponse)
                    setBeepCard(cardDetails);

                    const prevStationId = stations.find(station => station.stationName === transactionResponse?.currStation)?._id;
                    const currStationId = stations.find(station => station.stationName.replace(/[\s-]+/g, '_').toLocaleLowerCase() === stationName)?._id;

                    if (prevStationId && currStationId) {
                        const shortestPath = findShortestPath(stations, prevStationId, currStationId);
                        const pathDistance = shortestPath.reduce((acc, stationId, index) => {
                            if (index > 0) {
                                const prevStation = stations.find(station => station._id === shortestPath[index - 1]);
                                const currStation = stations.find(station => station._id === stationId);
                                if (prevStation && currStation) {
                                    const distance = L.latLng(prevStation.coords[0], prevStation.coords[1])
                                        .distanceTo(L.latLng(currStation.coords[0], currStation.coords[1]));
                                    return acc + distance;
                                }
                            }
                            return acc;
                        }, 0);
                        setFarePerMeters(calculateFare(pathDistance, minimumFare))

                        const pathPolylines = shortestPath.map((stationId, index) => {
                            if (index > 0) {
                                const prevStation = stations.find(station => station._id === shortestPath[index - 1]);
                                const currStation = stations.find(station => station._id === stationId);
                                if (prevStation && currStation) {
                                    return (
                                        <Polyline
                                            key={`path-${prevStation._id}-${currStation._id}`}
                                            positions={[
                                                [prevStation.coords[0], prevStation.coords[1]],
                                                [currStation.coords[0], currStation.coords[1]],
                                            ]}
                                            color="red"
                                            weight={5}
                                            opacity={0.7}
                                        />
                                    );
                                }
                            }
                            return null;
                        });
                        const pathPolylinesFiltered = pathPolylines.filter((element) => element !== null) as ReactElement[];
                        setPathPolylines(pathPolylinesFiltered);
                    } else {
                        toast.warn('Path not found, please contact admin.', {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                        return
                    }

                }
            } catch (error) {
                console.log(error)
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
                    {pathPolylines}
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
                                {tapOutDetails && (
                                    <div className="mb-5">
                                        <p className="text-xl lg:text-2xl text-white mb-1">Initial Balance: {tapOutDetails.initialBalance}</p>
                                        <p className="text-xl lg:text-2xl text-white mb-1">Previous Station: {tapOutDetails.prevStation}</p>
                                        <p className="text-xl lg:text-2xl text-white mb-1">Current Station: {stationName?.replace(/[\s_]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())}</p>
                                        <p className="text-xl lg:text-2xl text-white mb-1">Date of Tap-in: {formatDate(tapOutDetails.updatedAt)}</p>
                                        <p className="text-xl lg:text-2xl text-white mb-1">Fare: {farePerMeters}</p>
                                        <p className="text-xl lg:text-2xl text-white mb-1">Current Balance: {tapOutDetails.currBalance}</p>
                                    </div>
                                )}
                                <Button
                                    className="w-full mt-4 lg:mt-auto bg-white text-gray-800 text-sm lg:text-base"
                                    disabled={!beepCard?.UUIC} // Disable the button if beepCard is null
                                    onClick={handleTapOut} // Call handleTapIn when the button is clicked
                                >
                                    TAP-OUT
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

export default MrtTapOut;