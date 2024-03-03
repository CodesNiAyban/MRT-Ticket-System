import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import QRCode from 'react-qr-code'; // Import QRCode component
import uuid from 'react-native-uuid';

const WebSocketTester = () => {
    const [receivedMessage, setReceivedMessage] = useState<string | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [room, setRoom] = useState<any>(uuid.v4()); // Generate initial room value using UUID
    const [message, setMessage] = useState('');
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const [roomJoiner, setRoomJoiner] = useState(false); // State to track whether room is joined

    useEffect(() => {
        const initializeSocket = async () => {
            try {
                console.log(room)
                // Connect to the WebSocket server
                const newSocket = io('http://192.168.64.240:5000'); // Replace with your WebSocket server URL
                setSocket(newSocket);

                // Listen for messages from the server
                newSocket.on('message', (msg: string) => {
                    setReceivedMessage(msg);
                });

                // Set connection status
                newSocket.on('connect', () => {
                    setRoomJoiner(true)
                    setIsConnected(true);
                });

                newSocket.on('disconnect', () => {
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
            console.log("natawag")
            joinRoom(socket);
        }
        setRoomJoiner(false)
    }, [roomJoiner]);

    const sendMessage = () => {
        // Send a message to the server
        if (socket && room && message) {
            socket.emit('messageToRoom', { room, message });
        }
    };

    const joinRoom = async (newSocket: any) => { // Accept newSocket as a parameter
        if (newSocket && room) { // Use newSocket instead of socket
            newSocket.emit('joinRoom', room); // Use newSocket instead of socket
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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">WebSocket Tester</h1>
            <div className="mb-4">
                <label className="block mb-1">Room:</label>
                <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
                {/* Conditionally render the QR code only when the room is joined */}
                {room && socket && isRoomJoined && (
                    <div className="flex justify-center items-center mt-2">
                        <QRCode value={room} fgColor="#4A90E2" />
                    </div>
                )}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Message:</label>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <button onClick={joinRoom} disabled={!isConnected || !room} className="btn">
                Join Room
            </button>
            <button onClick={leaveRoom} disabled={!isConnected || !room || !isRoomJoined} className="btn">
                Leave Room
            </button>
            <button onClick={sendMessage} disabled={!isConnected || !room || !message || !isRoomJoined} className="btn">
                Send Message to Room
            </button>
            <div className="mt-4">
                {isConnected ? (
                    <p className="text-green-600">Connected to WebSocket server</p>
                ) : (
                    <p className="text-red-600">Not connected to WebSocket server</p>
                )}
                {receivedMessage && <p>Received message: {receivedMessage}</p>}
            </div>
        </div>
    );
};

export default WebSocketTester;
