import { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { LatLngLiteral } from 'leaflet';
import { Stations as StationsModel } from '../../model/stationsModel';

interface MapEventHandlerProps {
  onClick?: (station: StationsModel) => void; // Adjust the type here
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        // Convert the LatLngLiteral to StationsModel or obtain the relevant station information
        const station: StationsModel = {
          _id: '', // You can fill this with relevant information
          stationName: 'Station Name', // You can fill this with relevant information
          coords: [e.latlng.lat, e.latlng.lng], // Convert LatLngLiteral to coords
          connectedTo: [], // You can fill this with relevant information
        };

        onClick(station);
      }
    },
  });

  return null;
};

export default MapEventHandler;
