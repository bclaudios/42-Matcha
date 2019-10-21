import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../../contexts/AppContext';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTimes } from '@fortawesome/free-solid-svg-icons';
import ChatNotificationDot from './ChatNotificationDot';
import { Image } from 'cloudinary-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import TextField from '@material-ui/core/TextField';

const Chat = styled.section`
    background-color: ${props => props.theme.color.purple};
    height: 700px;
    width: 350px;
    position: fixed;
    bottom: 120px;
    right: 30px;
    border-radius: 20px;
    z-index: 999999;
    overflow: hidden;
    box-shadow: 0 15px 25px -10px rgba(0,0,0,.25);
`;
const ChatButton = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.theme.color.purple};
    height: 80px;
    width: 80px;
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 999999;
    border-radius: 100%;
    cursor: pointer;
    box-shadow: 0 15px 25px -10px rgba(0,0,0,.25);
`;
const ChatInfo = styled.section`
  background-color: ${props => props.theme.color.purple};
  height: 100px;
  display: flex; 
  align-items: center;
  padding: 0 10px;
  position: relative;
`;
const DiscussionsInfo = styled.p`
  color: ${props => props.theme.color.white};
  font-family: Roboto;
  font-weight: 900;
  font-size: 1.5em;
  margin-left: 20px;
`;
const DiscussionsContainer = styled.aside`
  background-color: ${props => props.theme.color.lightPurple};
  overflow: hidden;
`;
const DiscussionsSection = styled.section`
  padding: 20px;
  height: 600px;
  overflow-y: scroll;
`;
const Discussion = styled.div`
  display: grid;
  grid-template-columns: 2fr 4fr 2fr;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  height: 100px;
  width: 100%;
  margin-bottom: 20px;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
`;
const Avatar = styled(Image)`
  background-color: lightgrey;
  height: 50px;
  width: 50px;
  border-radius: 100%;
  justify-self: center;
  object-fit: cover;
`;
const Username = styled.p`
  color: ${props => props.theme.color.textBlack};
  font-family: Roboto;
  font-weight: 500;
  font-size: 0.8em;
`;
const Date = styled.p`
  position: absolute;
  top: 0;
  right: 20px;
  color: ${props => props.theme.color.textGrey};
  font-family: Roboto;
  font-weight: 500;
  font-size: 0.8em;
`;
const ChatWindow = styled.section`
  height: 600px;
  display: grid;
  grid-template-rows: 8fr 2fr;
  background-color: ${props => props.theme.color.white};
`;
const MessagesSection = styled.div`
  overflow: hidden;
  overflow-y: scroll;
`;
const Form = styled.form`
  background-color: ${props => props.theme.color.white};
  padding: 30px;
  display: grid;
  grid-template-columns: 9fr 1fr;
  align-items: center;
  margin: 0;
`;
const ReceivedMessageBlock = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;
const ReceivedMessage = styled.p`
  font-family: Roboto;
  color: ${props => props.theme.color.textBlack};
  font-size: 0.9em; 
  background-color: ${props => props.theme.color.lightGrey};
  padding: 15px 25px;
  border-radius: 40px;
  margin-left: 20px;
  max-width: 50%;
  overflow-wrap: break-word;
`;
const SentMessageBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 10px;
`;
const SentMessage = styled.p`
  font-family: Roboto;
  color: ${props => props.theme.color.white};
  font-size: 0.9em; 
  background-color: ${props => props.theme.color.red};
  padding: 15px 25px;
  border-radius: 40px;
  margin-left: 20px;
  max-width: 50%;
  overflow-wrap: break-word;
`;
const SendButton = styled.button`
  height: 50px;
  width: 50px;
  border-radius: 100%;
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: ${props => props.theme.color.purple};
  color: ${props => props.theme.color.white};
  font-size: 1.5rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 250ms ease-in-out, 
              transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  &:hover,
  &:focus {
    background: ${props => props.theme.color.white};
    color: ${props => props.theme.color.purple};
    border: solid 0.5px ${props => props.theme.color.purple};
  }
  &:active {
      transform: scale(0.99);
  }
`;
const UnreadDot = styled.div`
    width: 25px;
    height: 25px;
    background-color: ${props => props.theme.color.red};
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const OnlineDot = styled.div`
    width: 10px;
    height: 10px;
    background-color: ${props => props.theme.color.green};
    border-radius: 100%;
    margin: 0 10px 0 20px;
`;
const OfflineDot = styled.div`
    width: 10px;
    height: 10px;
    background-color: ${props => props.theme.color.red};
    border-radius: 100%;
    margin: 0 10px 0 20px;
`;
const LastConnection = styled.p`
  font-family: Roboto;
  font-size: 0.7em;
  font-weight: 500;
  color: ${props => props.theme.color.lightPurple};
`;
const ChatInfoUsername = styled.p`
  font-family: Roboto;
  font-weight: 500;
  color: ${props => props.theme.color.white};
  margin-left: 30px;
  &:hover {
    color: ${props => props.theme.color.lightPurple};
  }
`;
const CloseDiscussion = styled.div`
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
`;
const NoDiscussionYet = styled.aside`
  background-color: ${props => props.theme.color.purple};
  height: 200px;
  width: 350px;
  position: fixed;
  bottom: 120px;
  right: 30px;
  border-radius: 20px;
  z-index: 999999;
  overflow: hidden;
  box-shadow: 0 15px 25px -10px rgba(0,0,0,.25);
  display: flex;
  justify-content: center;
  align-items: center;
`;
const NoDiscussionYetMsg = styled.section`
  color: ${props => props.theme.color.white};
  font-family: Roboto;
  font-weight: 500;
  margin-top: 0;
  text-align: center;
  h1 {
    font-family: Roboto;
    font-weight: 900;
    font-size: 1.5em;
  }
`;

export default function ChatComp() {
  const {
    discussions,
    setDiscussions,
    currentDiscussionInfo,
    setCurrentDiscussionInfo,
    currentDiscussionMessages,
    setCurrentDiscussionMessages,
    setUnreadMessagesNb,
    socket,
    connectedUsers,
    unreadMessagesNb,
  } = useContext(AppContext);
  const [inputValue, setInputValue] = useState('');
  const [chatIsOpen, setChatIsOpen] = useState(false);
  const authToken = localStorage.getItem('token');
  const refDiv = useRef(null);
  const refElem = useRef(null);
  const executeScroll = () => refDiv.current.scrollTo(0, refElem.current.offsetTop);

  useEffect(() => {
    async function fetchData() {
      const res = await axios.get(`/chat/discussions?authToken=${authToken}`);
      setDiscussions(res.data.discussions);
    };
    if (authToken) fetchData();
  }, [authToken, setDiscussions]);

  useEffect(() => {
    return () => {
      setCurrentDiscussionInfo(null);
      setCurrentDiscussionMessages(null);  
      if (socket !== null) socket.emit('setCurrentDiscussionMatchId', null);  
    }
  }, [setCurrentDiscussionInfo, setCurrentDiscussionMessages, socket]);

  useEffect(() => {
    if (socket !== null && authToken) {
      socket.on('reloadDiscussions', async () => {
        const resAll = await axios.get(`/chat/discussions?authToken=${authToken}`);
        setDiscussions(resAll.data.discussions);
      });
      return () => socket.off('reloadDiscussions');
    }
  }, [socket, authToken, setDiscussions, setCurrentDiscussionInfo, setCurrentDiscussionMessages]);

   useEffect(() => {
    if (socket !== null && authToken) {
      socket.on('unliked', async () => {
        setCurrentDiscussionInfo(null);
        setCurrentDiscussionMessages(null); 
        const resAll = await axios.get(`/chat/discussions?authToken=${authToken}`);
        setDiscussions(resAll.data.discussions);
        const resMsg = await axios.get(`/chat/unreadMessagesNb?authToken=${authToken}`);
        setUnreadMessagesNb(resMsg.data.nb);
      });
      return () => socket.off('unliked');
    }
  }, [socket, authToken, setDiscussions, setUnreadMessagesNb, setCurrentDiscussionInfo, setCurrentDiscussionMessages]);

  useEffect(() => {
    if (socket !== null && authToken) {
      socket.on('newMessageReceived', async matchId => {
        if (currentDiscussionInfo !== null && matchId === currentDiscussionInfo.matchId) {
          const resCurrent = await axios.post(`/chat/currentDiscussionMessages?authToken=${authToken}`, { matchId });
          setCurrentDiscussionMessages(resCurrent.data.currentDiscussionMessages);
          executeScroll();
        } else {
          const resAll = await axios.get(`/chat/discussions?authToken=${authToken}`);
          setDiscussions(resAll.data.discussions);
        }
      });
      return () => socket.off('newMessageReceived');
    }
  }, [authToken, setCurrentDiscussionMessages, socket, currentDiscussionInfo, setDiscussions]);

  useEffect(() => {
    if (socket !== null) {
        socket.on('setUnreadMessagesNb', async nb => {
            setUnreadMessagesNb(nb);
        });
        return () => socket.off('setUnreadMessagesNb');
    }
  }, [socket, setUnreadMessagesNb]);

  const loadCurrentDiscussion = async (matchId, youLastConnection, youUserId, youUsername, youAvatar) => {
    if (authToken) {
      if (socket !== null) socket.emit('setCurrentDiscussionMatchId', matchId);
      const youIsOnline = false;
      setCurrentDiscussionInfo({ matchId, youLastConnection, youUserId, youUsername, youAvatar, youIsOnline });
      const resCurrent = await axios.post(`/chat/currentDiscussionMessages?authToken=${authToken}`, { matchId });
      setCurrentDiscussionMessages(resCurrent.data.currentDiscussionMessages);
      const resAll = await axios.get(`/chat/discussions?authToken=${authToken}`);
      setDiscussions(resAll.data.discussions);
      const resUnreadMsg = await axios.get(`/chat/unreadMessagesNb?authToken=${authToken}`);
      setUnreadMessagesNb(resUnreadMsg.data.nb);
      executeScroll();
    }
  };

  const handleChange = event => setInputValue(event.target.value);
  
  const handleSubmit = async event => {
    event.preventDefault();
    if (inputValue !== '' && authToken) {
      try {
        const matchId = currentDiscussionInfo.matchId;
        const youUserId = currentDiscussionInfo.youUserId;
        const message = inputValue;
        await axios.post(`/chat?authToken=${authToken}`, { matchId, youUserId, message });
        setInputValue('');
        if (socket !== null) socket.emit('newMessageSent', {message, youUserId, matchId});
      } catch(error) { console.log(error) }
    }
  };

  const resetCurrentDiscussion = () => {
    setCurrentDiscussionInfo(null);
    setCurrentDiscussionMessages(null);
    if (socket !== null) socket.emit('setCurrentDiscussionMatchId', null);
  }

  const toggleChat = () => {
    setChatIsOpen(prev => !prev);
    resetCurrentDiscussion();
  }

  return (
    <Fragment>
      {discussions !== null && chatIsOpen &&
        <Chat>
          <ChatInfo>
          {currentDiscussionInfo === null ?
            <DiscussionsInfo>Discussions</DiscussionsInfo>
            :
            <Fragment>
              <Avatar cloudName='matchacn' publicId={currentDiscussionInfo.youAvatar}></Avatar>
              <Link to={`/profile/${currentDiscussionInfo.youUsername}`} style={{textDecoration: 'none'}}>
                <ChatInfoUsername>{currentDiscussionInfo.youUsername}</ChatInfoUsername>
              </Link>
              {connectedUsers.includes(currentDiscussionInfo.youUserId) ? 
                <OnlineDot></OnlineDot>
                : 
                <Fragment>
                <OfflineDot></OfflineDot>
                <LastConnection>{currentDiscussionInfo.youLastConnection === null ? 
                  'never connected' : currentDiscussionInfo.youLastConnection}
                </LastConnection>
                </Fragment>
              }
              <CloseDiscussion onClick={() => resetCurrentDiscussion()}>
                <FontAwesomeIcon  style={{fontSize: '20px', color: 'white'}} icon={faTimes}/>
              </CloseDiscussion>
            </Fragment>
          }
          </ChatInfo>
          {currentDiscussionMessages === null &&
            <DiscussionsContainer>
              <DiscussionsSection>
              {discussions.map((discussion, index) => 
                <Discussion
                  key={index}
                  onClick={() => loadCurrentDiscussion(discussion.matchId, discussion.youLastConnection, discussion.youUserId, discussion.youUsername, discussion.youAvatar)}
                >
                  <Avatar cloudName='matchacn' publicId={discussion.youAvatar}></Avatar>
                  <Username>{discussion.youUsername}</Username>
                  { discussion.unreadNb > 0 &&
                    <UnreadDot>
                      <p style={{fontWeight: 900, fontSize: '10px', color: 'white'}}>{discussion.unreadNb}</p>
                    </UnreadDot>
                  }
                  <Date>{discussion.duration}</Date>
                </Discussion>
              )}
              </DiscussionsSection>
            </DiscussionsContainer>
          }
          <ChatWindow>
            <MessagesSection ref={refDiv}>
            {currentDiscussionInfo && currentDiscussionMessages && currentDiscussionMessages !== 'no msg yet' && currentDiscussionMessages.map((msg, index) => {
              return msg.type === 'received' ?
              <ReceivedMessageBlock key={index}>
                <Avatar cloudName='matchacn' publicId={currentDiscussionInfo.youAvatar}></Avatar>
                <ReceivedMessage>{msg.message}</ReceivedMessage>
              </ReceivedMessageBlock>
              :
              <SentMessageBlock key={index}>
              <SentMessage>{msg.message}</SentMessage>
              </SentMessageBlock>
            })}
              <div style={{ float:"left", clear: "both" }} ref={refElem}></div>
            </MessagesSection>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              placeholder="Type a message..."
              value={inputValue}
              onChange={handleChange}
            />
            <SendButton type='submit'>
              <FontAwesomeIcon icon={faPaperPlane}/>
            </SendButton>
            </Form>
          </ChatWindow> 
        </Chat>
      }
      {discussions === null && chatIsOpen &&
        <NoDiscussionYet>
          <NoDiscussionYetMsg>
            <h1>Wanna talk ?</h1> 
            <p><span aria-label="Check-this" role="img" >👉</span> First... get a match !</p>
          </NoDiscussionYetMsg>
        </NoDiscussionYet>
      }
      <ChatButton onClick={() => toggleChat()}>
      {unreadMessagesNb !== 0 &&
        <ChatNotificationDot nb={unreadMessagesNb}/>
      }
      {chatIsOpen ?
        <FontAwesomeIcon  style={{fontSize: '30px', color: 'white'}} icon={faTimes}/>
        :
        <FontAwesomeIcon  style={{fontSize: '30px', color: 'white'}} icon={faComment}/>
      }
      </ChatButton>
    </Fragment>
  );
}
