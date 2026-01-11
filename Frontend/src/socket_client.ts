import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

export const socketConnection = io(SERVER_URL, {
    transports: ['websocket'], 
    autoConnect: true,
    reconnectionAttempts: 5,
});