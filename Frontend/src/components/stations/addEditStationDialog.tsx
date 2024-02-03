import L from 'leaflet';
import { ReactElement, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Polyline } from 'react-leaflet';
import { Stations, Stations as StationsModel } from '../../model/stationsModel';
import * as StationsApi from '../../network/stationsAPI';
import { StationInput } from '../../network/stationsAPI';
import TextInputField from '../form/textInputFields';
import styles from './station.module.css';
import StationConnectedToModal from './stationConnectedToModal';
import { toast } from 'react-toastify';

interface AddEditStationDialogProps {
  stationToEdit?: Stations;
  onDismiss: () => void;
  onStationSaved: (station: Stations) => void;
  coordinates?: [number, number] | null;
  newStation: StationsModel | null;
  stations: StationsModel[];
  isDragged: boolean;
}

const AddEditStationDialog = ({
  stationToEdit,
  onDismiss,
  onStationSaved,
  coordinates,
  newStation,
  stations,
  isDragged
}: AddEditStationDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<StationInput>({
    defaultValues: {
      stationName: stationToEdit?.stationName || '',
      coords: stationToEdit?.coords || coordinates || [0, 0],
      connectedTo: stationToEdit?.connectedTo || [],
    },
  });

  const [showConnectedToModal, setShowConnectedToModal] = useState(false);
  const [selectedStations, setSelectedStations] = useState<StationsModel[]>([]);
  const [runOnce, setRunOnce] = useState(true)

  const [polylines, setPolylines] = useState<ReactElement[]>([]);
  const [showToast, setShowToast] = useState(false);
  
  const setDefaultValues = () => {
    setValue('stationName', stationToEdit?.stationName || '');

    // Set default values for coordinates
    const defaultLatitude = coordinates?.[0] || 0;
    const defaultLongitude = coordinates?.[1] || 0;

    if (isDragged && coordinates) {
      setValue('coords.0', defaultLatitude);
      setValue('coords.1', defaultLongitude);
    }
    // Handle the connectedTo field
    const connectedToStations = stationToEdit?.connectedTo || [];

    // Explicitly define the type of selectedStations
    const newSelectedStations: Stations[] = [];
    let i: number = 0;
    for (const connectedStation of connectedToStations) {
      try {
        const stationDetails = stations.find(station => station._id === connectedStation);

        if (stationDetails) {
          const connectedStationDetails: Stations = {
            _id: stationDetails._id || '',
            stationName: stationDetails.stationName || '',
            coords: stationDetails.coords,
            connectedTo: [connectedToStations[i] || ''],
          };
          i++;
          newSelectedStations.push(connectedStationDetails);
          setSelectedStations(newSelectedStations);
        } else {
          console.error(`Station details not found for station ${connectedStation}`);
        }
      } catch (error) {
        console.error(`Error fetching details for station ${connectedStation}:`, error);
      }
    }
  };

  useEffect(() => {
    setDefaultValues();
    setRunOnce(false)
  }, [runOnce]);

  useEffect(() => {
    // When the selected stations change, update the connectedTo field
    setValue('connectedTo', selectedStations.map(station => station._id));
  }, [selectedStations, setValue]);

  const onSubmit = async (input: StationInput) => {
    try {
      // Check if it's a new station or an existing station
      let stationResponse: Stations;

      if (stationToEdit) {
        // Editing an existing station
        stationResponse = await StationsApi.updateStation(stationToEdit._id, {
          ...input,
          connectedTo: selectedStations.map(station => station._id),
        });
      } else {
        // Adding a new station
        const newStationResponse = await StationsApi.createStation(input);

        // Update the new station with a valid ID
        const newStationWithID: StationsModel = {
          ...newStationResponse,
          _id: newStationResponse._id || '',
        };

        stationResponse = newStationWithID;

        // Add the new station to the selected stations list
        setSelectedStations([...selectedStations, newStationWithID]);
      }

      // Check if connectedTo input is not empty before performing bulk update
      if (input.connectedTo.length > 0) {
        // Send a bulk update to update connectedTo for all relevant stations
        const bulkUpdateStations = selectedStations.map((selectedStation) => {
          // Check if the current station is the same as the one being updated
          const isSameStation = stationToEdit && selectedStation._id === stationToEdit._id;

          // If it's not the same station, update the connectedTo field
          if (!isSameStation) {
            const updatedConnectedTo = [...selectedStation.connectedTo, stationResponse._id];
            return { ...selectedStation, connectedTo: updatedConnectedTo };
          }

          return selectedStation;
        });

        await StationsApi.updateStations(bulkUpdateStations);
      }
      onStationSaved(stationResponse);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  const handlePolylines = (polylines: any) => {
    setPolylines(polylines)
  }

  const handleStationSelection = async (station: StationsModel) => {
    const isCurrentStationToEdit = stationToEdit && stationToEdit.stationName === station.stationName;
    if (!isCurrentStationToEdit) {
      if (!selectedStations.some((selectedStation) => selectedStation._id === station._id)) {
        // If stationToEdit is present, update its connectedTo
        if (stationToEdit) {
          stationToEdit.connectedTo.push(station._id);
        }

        if (stationToEdit && station._id !== stationToEdit._id) {
          const distance = L.latLng(stationToEdit.coords[0], stationToEdit.coords[1]).distanceTo(
            L.latLng(station.coords[0], station.coords[1])
          );

          if (distance > 500) {
            const polyline = (
              <Polyline
                key={`polyline-${station._id}`}
                positions={[
                  [stationToEdit.coords[0], stationToEdit.coords[1],],
                  [station.coords[0], station.coords[1]],
                ]}
              />
            );

            setPolylines((prevPolylines) => [
              ...prevPolylines,
              polyline,
            ]);
            setSelectedStations([...selectedStations, station]);
          } else {
            setShowToast(true);
          }
        } else if (newStation && station._id !== newStation._id) {
          const distance = L.latLng(newStation.coords[0], newStation.coords[1]).distanceTo(
            L.latLng(station.coords[0], station.coords[1])
          );

          if (distance > 500) {
            const polyline = (
              <Polyline
                key={`polyline-${station._id}`}
                positions={[
                  [newStation.coords[0], newStation.coords[1]],
                  [station.coords[0], station.coords[1]],
                ]}
              />
            );

            setPolylines((prevPolylines) => [
              ...prevPolylines,
              polyline,
            ]);
            setSelectedStations([...selectedStations, station]);
          } else {
            setShowToast(true);
          }
        }
      }
    }
  }; // FIX STRUCTURE //SIMPLIFY

  const handleRemoveStation = (station: StationsModel) => {
    setSelectedStations(selectedStations.filter((s) => s._id !== station._id));
  };

  const openConnectedToModal = () => {
    setShowConnectedToModal(true);
  };

  const closeConnectedToModal = () => {
    setShowConnectedToModal(false);
  };

  return (
    <Modal show onHide={onDismiss} style={{}}>
      <Modal.Header closeButton>
        <Modal.Title>{stationToEdit ? 'Edit Station' : 'Add Station'}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ zIndex: "999" }}>
        <Form id="addEditStationForm" onSubmit={handleSubmit(onSubmit)}>
          <TextInputField
            name="stationName"
            label="Station Name"
            type="text"
            placeholder="Title"
            register={register}
            registerOptions={{ required: 'Required' }}
            error={errors.stationName}
          />

          {/* Latitude form input */}
          <Form.Group className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="number"
              placeholder="Latitude"
              isInvalid={!!errors.coords}
              defaultValue={(coordinates?.[0] || stationToEdit?.coords[0] || 0).toString()}
              onChange={(e) => setValue('coords.0', parseFloat(e.target.value))}
            />
            <Form.Control.Feedback type="invalid">
              {errors.coords?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Longitude form input */}
          <Form.Group className="mb-3">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="number"
              placeholder="Longitude"
              isInvalid={!!errors.coords}
              defaultValue={(coordinates?.[1] || stationToEdit?.coords[1] || 0).toString()}
              onChange={(e) => setValue('coords.1', parseFloat(e.target.value))}
            />
            <Form.Control.Feedback type="invalid">
              {errors.coords?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              {selectedStations.length > 0 ? <>Connected Stations</> : <>No Connecting Stations</>}
            </Form.Label>

            <div>
              {selectedStations.map((station) => (
                <span
                  key={`${Math.random()}${station._id}`}
                  className={`${styles.badge} badge badge-pill badge-primary mr-2`}
                  style={{
                    background: '#0275d8',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {station.stationName}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="primary" onClick={openConnectedToModal} className='ms-auto'>
                {selectedStations.length > 0 ? <>Edit Connecting Stations</> : <>Add Connecting Station/s</>}
              </Button>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" form="addEditStationForm" disabled={isSubmitting}>
          Save
        </Button>
      </Modal.Footer>
      {showConnectedToModal && (
        <StationConnectedToModal
          show={showConnectedToModal}
          onHide={closeConnectedToModal}
          onStationSelection={handleStationSelection}
          selectedStations={selectedStations}
          onRemoveStation={handleRemoveStation}
          onClearSelectedStations={() => setSelectedStations([])}
          stations={stations}
          newStation={stationToEdit ? null : newStation}
          stationToEdit={stationToEdit ? stationToEdit : null}
          polylines={polylines}
          setPolylines={handlePolylines}
          showToast={showToast}
        />
      )}
    </Modal >
  );
};

export default AddEditStationDialog;
