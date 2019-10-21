import io from 'socket.io-client';

export default function setupSocket(token, setSocket, setConnectedUsers) {
    const socket = io('http://localhost:5000', {
        query: {
            token: token
        }
    });
    
    socket.on('isConnected', userIds => {
        // console.log(`The back sent new connectedUsers: ${userIds}`);
        setConnectedUsers(userIds);
    });

    socket.on('makeItJoinMatchId', matchId => {
        socket.emit('joinMatchId', matchId);
    });
    
    socket.on('disconnect', () => {
        // console.log('The server has disconnected!');
    });
    
    setSocket(socket);
}