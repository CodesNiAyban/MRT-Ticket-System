import React, { Component } from 'react'
import {renderToString} from 'react-dom/server'
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet'
import L, { Popup } from 'leaflet';
import "leaflet/dist/leaflet.css"
import ReceiptIcon from '@mui/icons-material/Receipt';
import { IoLocation } from "react-icons/io5";

type Props = {}

type State = {}

const iconTest = <IoLocation color='red' 
style={{ fontSize: '30px'}}
/>
var LeafIcon = L.Icon.extend({
  options: {
      shadowUrl: "https://cdn2.iconfinder.com/data/icons/locations-10/64/Train-Station-Map-Pin-Location-512.png",
      iconSize:     [38, 95],
      shadowSize:   [50, 64],
      iconAnchor:   [22, 94],
      shadowAnchor: [4, 62],
      popupAnchor:  [-3, -76]
  }
});

L.icon = function (options) {
  return new L.Icon(options);
};

// var greenIcon = new LeafIcon({iconUrl: "https://cdn2.iconfinder.com/data/icons/locations-10/64/Train-Station-Map-Pin-Location-512.png"});

// L.marker([51.5, -0.09], {icon: greenIcon}).addTo(map).bindPopup("I am a green leaf.");

export default class Map extends Component<Props, State> {

  
  state = {}

  render() {
    return (
      <div>
        <div id="map" style={{width:'100vw', height:'100vh', overflow: 'Hidden'}}>
            <MapContainer center={[14.5416443, 121.0173241]} zoomControl={false} zoom={13} style={{width:'100%', height:'100%', zIndex: 1}}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker 
                position={[14.5416443, 121.0173241]}
                icon={L.divIcon({
                  // iconAnchor: [32,32],
                  // iconSize: [200, 200],
                  className: 'sdfasd',
                  html: renderToString(iconTest),
                  shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
                  shadowSize:   [50, 64], // size of the shadow
                  popupAnchor:  [-3, -76] 
                })}>
                  <ReceiptIcon />
                </Marker>
            </MapContainer>
        </div>
      </div>
    )
  }
}