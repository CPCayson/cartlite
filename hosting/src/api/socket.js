import { Server } from 'socket.io';
import { listenToRideRequests } from './firebaseApi';

export default function initializeSocket(server) {
  console.log('socket.js: Initializing Socket.IO');

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Adjust this to match your frontend URL
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log('socket.js: User connected with socket ID:', socket.id);

    // Listen for ride requests from Firebase and broadcast to clients
    const unsubscribeRideRequests = listenToRideRequests((rideRequests) => {
      console.log('socket.js: Broadcasting ride requests to all clients:', rideRequests);
      io.emit('ride-requests', rideRequests);
    });

    // Handle incoming chat messages
    socket.on('chat-message', (message) => {
      console.log('socket.js: Chat message received:', message);
      // Emit the message to the relevant chat room
      io.to(message.chatRoom).emit('chat-message', message);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('socket.js: User disconnected with socket ID:', socket.id);
      unsubscribeRideRequests(); // Stop listening to ride requests on disconnect
    });

    // Additional event handlers can be added here...
  });

  return io;
}
