import React, { Component } from 'react'
import {ConnectProvider, Connect} from 'react-connect-lines'
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet'
import { Popup } from 'leaflet';
import "leaflet/dist/leaflet.css"


type Props = {}

type State = {}



export default class Map extends Component<Props, State> {
  state = {}
  

  render() {
    return (
      <>
      <div>
        <div id="map" style={{width:'30vw', height:'85vh'}}>
            <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{width:'100%', height:'100%'}}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                    <Marker position={[51.505, -0.09]}>
                    {/* <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup> */}
                </Marker>
            </MapContainer>
        </div>
      </div>
      </>
    )
  }
}