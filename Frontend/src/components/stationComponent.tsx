import styles from "../styles/station.module.css"
import styleUtils from "../styles/utils.module.css"
import { Card } from "react-bootstrap";
import { Stations as StationsModel } from "../model/stationsModel"
import { MdDelete } from "react-icons/md"

interface StationProps {
    station: StationsModel,
    onStationClicked: (stations: StationsModel) => void,
    onDeleteNoteClicked: (stations: StationsModel) => void,
    className?: string,
}

const Stations = ({ station, onStationClicked, onDeleteNoteClicked, className }: StationProps) => {
    const {
        stationName,
        coords,
        connectedTo
    } = station;

    return (
        <Card 
        className={`${styles.stationCard} ${className}`}
        onClick={() => onStationClicked(station)}>
            <Card.Body className={styles.cardBody}>
                <Card.Title className={styleUtils.deleteIconFix}>
                    {stationName}
                    <MdDelete
                        className="text-muted ms-auto"
                        onClick={(e) => {
                            onDeleteNoteClicked(station);
                            e.stopPropagation();
                        }}
                    />
                </Card.Title>
                <Card.Text>
                    {connectedTo}
                </Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">
                {coords}
            </Card.Footer>
        </Card>
    )
}

export default Stations;