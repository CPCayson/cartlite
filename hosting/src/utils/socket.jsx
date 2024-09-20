import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function initializeSocket() {
  console.log('socket.js: Initializing Socket.IO');

  const socket = io('http://localhost:4000', {
    cors: {
      origin: "http://localhost:3000", // Adjust this to match your frontend URL
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    },
  });

  socket.on('connect', () => {
    console.log('socket.js: User connected with socket ID:', socket.id);

    // Example of emitting an event to the server
    socket.emit('join-room', { roomId: '12345' });

    // Listen for ride requests
    socket.on('ride-requests', (rideRequests) => {
      console.log('socket.js: Ride requests received:', rideRequests);
      // handle ride requests data
    });

    // Handle chat messages
    socket.on('chat-message', (message) => {
      console.log('socket.js: Chat message received:', message);
      // Update UI with the chat message
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('socket.js: User disconnected with socket ID:', socket.id);
    });

    // Payment and charge event handlers
    socket.on('payment_intent.succeeded', (data) => {
      toast.success(`Payment of ${data.amount / 100} ${data.currency.toUpperCase()} succeeded!`);
    });

    socket.on('payment_intent.payment_failed', (data) => {
      toast.error(`Payment failed: ${data.error}`);
    });

    socket.on('payment_intent.requires_action', (data) => {
      toast.info(`Payment requires additional action: ${data.id}`);
    });

    socket.on('payment_intent.canceled', (data) => {
      toast.warning(`Payment intent was canceled: ${data.id}`);
    });

    socket.on('charge.succeeded', (data) => {
      toast.success(`Charge succeeded: ${data.amount / 100}`);
    });

    socket.on('charge.failed', (data) => {
      toast.error(`Charge failed: ${data.amount / 100}`);
    });

    socket.on('charge.pending', (data) => {
      toast.info(`Charge is pending: ${data.amount / 100}`);
    });

    socket.on('charge.refunded', (data) => {
      toast.info(`Charge was refunded: ${data.amount / 100}`);
    });

    socket.on('charge.captured', (data) => {
      toast.success(`Charge was captured: ${data.amount / 100}`);
    });

    socket.on('transfer.created', (data) => {
      toast.success(`Transfer created: ${data.amount / 100}`);
    });

    socket.on('transfer.updated', (data) => {
      toast.info(`Transfer updated: ${data.amount / 100}`);
    });

    socket.on('transfer.reversed', (data) => {
      toast.error(`Transfer reversed: ${data.amount / 100}`);
    });

    socket.on('application_fee.created', (data) => {
      toast.info(`Application fee created: ${data.amount / 100}`);
    });

    socket.on('application_fee.refunded', (data) => {
      toast.info(`Application fee refunded: ${data.amount / 100}`);
    });

    socket.on('invoice.payment_succeeded', (data) => {
      toast.success(`Invoice payment succeeded: ${data.amount / 100}`);
    });

    socket.on('invoice.payment_failed', (data) => {
      toast.error(`Invoice payment failed: ${data.amount / 100}`);
    });

    socket.on('customer.created', (data) => {
      toast.info(`Customer created: ${data.id}`);
    });

    socket.on('customer.updated', (data) => {
      toast.info(`Customer updated: ${data.id}`);
    });

    socket.on('customer.deleted', (data) => {
      toast.info(`Customer deleted: ${data.id}`);
    });

    socket.on('unhandled_event', (data) => {
      toast.warning(`Unhandled event type: ${data.type}`);
    });
  });

  return socket;
}

function App() {
  useEffect(() => {
    const socket = initializeSocket();

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      {/* Your app content */}
      <ToastContainer />
    </div>
  );
}

export default App;
