import { Button } from "flowbite-react";
// import L, { } from 'leaflet'
import 'leaflet/dist/leaflet.css'; // Ensure this import for Leaflet styles
import { MapContainer, TileLayer } from 'react-leaflet';


export default function Component() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="lg:w-3/4 bg-gray-200 p-4 lg:p-8 h-full">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 border-b-2 border-gray-400 pb-4 lg:pb-2 flex items-center lg:gap-2">
          <div className="text-gray-800" />
          AYALA STATION{"\n              "}
        </h1>
        <div className="mt-4">
          <div id="map" className={`border rounded`} style={{ width: '100%', height: '400px' }}>
            <MapContainer >
              <TileLayer
                url={`https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=nPH7qRKnbY2zWEdTCjFRqXjz613lqVhL2znKd62LYJ4QkHdss41QY5FT4M75nCPv`}
              />
            </MapContainer>
          </div>
        </div>
      </div>
      <div className="lg:w-1/4 bg-gray-800 p-4 lg:p-8 text-white flex flex-col items-start h-full">
        <h2 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-6 text-white flex items-center lg:gap-2">
          <div className="text-white" />
          TAP-IN{"\n              "}
        </h2>
        <div className="flex items-center gap-2 w-full mb-2 lg:mb-6">
          <div className="text-white" />
          <input
            className="bg-gray-600 h-10 lg:h-12 w-full text-sm lg:text-base text-white px-2"
            placeholder="Enter text here"
            type="text"
          />
        </div>
        <p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
          <div className="text-white" /> CURRENT BALANCE: <span className="font-bold">400.00</span>
        </p>
        <p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
          <div className="text-white" /> TRANSACTION DATE:
          <br />
          <span className="font-bold">2024-02-04T12:30:00</span>
        </p>
        <p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
          <div className="text-white" /> CURRENT LOCATION:
          <br />
          <span className="font-bold">AYALA STATION</span>
        </p>
        <p className="text-base lg:text-lg mb-2 lg:mb-4 flex items-center gap-2">
          <div className="text-white" /> LONGITUDE:
          <br />
          <span className="font-bold">121.02786549652283</span>
        </p>
        <p className="text-base lg:text-lg mb-4 lg:mb-6 flex items-center gap-2">
          <div className="text-white" /> LATITUDE:
          <br />
          <span className="font-bold">14.550516141646541</span>
        </p>
        <Button className="w-full mt-2 lg:mt-auto bg-white text-gray-800 text-sm lg:text-base">TAP-IN NOW</Button>
      </div>
    </div>
  );
}
