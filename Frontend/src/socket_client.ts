import { io } from 'socket.io-client';

const SERVER_URL = 'http://10.93.173.225:8000';

export const socketConnection = io(SERVER_URL, {
    transports: ['websocket'], 
    autoConnect: true,
    reconnectionAttempts: 5,
});