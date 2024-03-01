import { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import io from 'socket.io-client';

const WebSocketTester = () => {
  const [receivedMessage, setReceivedMessage] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = io('http://localhost:5000'); // Replace with your WebSocket server URL
    setSocket(newSocket);

    // Listen for messages from the server
    newSocket.on('message', (msg: string) => {
      setReceivedMessage(msg);
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
    <Container>
      <h1>WebSocket Tester</h1>
      <Form.Group>
        <Form.Label>Room:</Form.Label>
        <Form.Control type="text" value={room} onChange={(e) => setRoom(e.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Message:</Form.Label>
        <Form.Control type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      </Form.Group>
      <Button onClick={joinRoom} disabled={!isConnected || !room}>
        Join Room
      </Button>
      <Button onClick={leaveRoom} disabled={!isConnected || !room}>
        Leave Room
      </Button>
      <Button onClick={sendMessage} disabled={!isConnected || !room || !message}>
        Send Message to Room
      </Button>
      <div>
        {isConnected ? (
          <p>Connected to WebSocket server</p>
        ) : (
          <p>Not connected to WebSocket server</p>
        )}
        {receivedMessage && <p>Received message: {receivedMessage}</p>}
      </div>
    </Container>
  );
};

export default WebSocketTester;
