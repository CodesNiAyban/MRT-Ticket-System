import { useMapEvents } from 'react-leaflet';
import { LatLngLiteral } from 'leaflet';

interface MapEventHandlerProps {
  onClick?: (latlng: LatLngLiteral) => void;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng);
      }
    },
  });

  return null;
};

export default MapEventHandler;
