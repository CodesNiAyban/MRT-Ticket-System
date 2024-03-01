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

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = io('https://mrtonlineapi.onrender.com'); // Replace with your WebSocket server URL
    setSocket(newSocket);

    // Listen for messages from the server
    newSocket.on('message', (msg: string) => {
      setReceivedMessage(msg);
      leaveRoom();
      setRoom(uuid.v4())
      joinRoom()
    });

    // Set connection status
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      // Disconnect WebSocket connection when component unmounts
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    // Send a message to the server
    if (socket && room && message) {
      socket.emit('messageToRoom', { room, message });
    }
  };

  const joinRoom = () => {
    // Join a room
    if (socket && room) {
      socket.emit('joinRoom', room);
    }
  };

  const leaveRoom = () => {
    // Leave a room
    if (socket && room) {
      socket.emit('leaveRoom', room);
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
        {/* Generate QR code for the room value */}
        <QRCode value={room} />
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
      <button onClick={leaveRoom} disabled={!isConnected || !room} className="btn">
        Leave Room
      </button>
      <button onClick={sendMessage} disabled={!isConnected || !room || !message} className="btn">
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
