import React, { useState, useEffect, Fragment } from 'react';
import AuthenticatedMain from './appAuthenticated/AuthenticatedMain';
import UnauthenticatedMain from './appUnauthenticated/UnauthenticatedMain';
import Header from './appAuthenticated/Header/Header';
import Chat from './appAuthenticated/Chat/Chat';
import { AppProvider } from './contexts/AppContext';
import { actionIsAuthenticated } from './actions/authActions';
import setupSocket from './actions/socketActions';
import { ThemeProvider } from 'styled-components';
import Theme from './theme.json';
import axios from 'axios';

function App() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [unseenNotificationsNb, setUnseenNotificationsNb] = useState(0);
  const [unreadMessagesNb, setUnreadMessagesNb] = useState(0);
  const [discussions, setDiscussions] = useState(null);
  const [currentDiscussionInfo, setCurrentDiscussionInfo] = useState(null);
  const [currentDiscussionMessages, setCurrentDiscussionMessages] = useState(null);  
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    let isSubscribed = true;
    async function fetchData() {
      try {
        const userId = await actionIsAuthenticated(localStorage.getItem('token'));
        if (userId !== null) {
          const resNotif = await axios.get(`/notifications/unseenNotificationsNb?authToken=${authToken}`);
          if (isSubscribed) setUnseenNotificationsNb(resNotif.data.nb);
          const resMsg = await axios.get(`/chat/unreadMessagesNb?authToken=${authToken}`);
          if (isSubscribed) {
            setUnreadMessagesNb(resMsg.data.nb);
            setupSocket(authToken, setSocket, setConnectedUsers);
            setConnected(true);
          }
        } else {
          if (isSubscribed) setConnected(false)
        }
      } catch(e) {
        if (isSubscribed) setConnected(false)
      }
    };
    if (authToken) fetchData();
    return () => isSubscribed = false;
  }, [authToken]);

  const appState = {
    connected,
    setConnected,
    toggleConnected: () => {setConnected(!connected)},
    connectedUsers,
    setConnectedUsers,
    socket,
    setSocket,
    unseenNotificationsNb, 
    setUnseenNotificationsNb,
    unreadMessagesNb, 
    setUnreadMessagesNb,
    discussions,
    setDiscussions,
    currentDiscussionInfo,
    setCurrentDiscussionInfo,
    currentDiscussionMessages,
    setCurrentDiscussionMessages,
  };

  return (
    <Fragment>
      <AppProvider value={appState}>
        <ThemeProvider theme={Theme}>
      {!connected ? <UnauthenticatedMain /> : 
          <div>
            <Header />
            <AuthenticatedMain />
            <Chat />
          </div> }
        </ThemeProvider> 
      </AppProvider>
    </Fragment>
  );
}

export default App;
