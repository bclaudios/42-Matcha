import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faHeart, faBan, faFireAlt, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AppContext from '../../../contexts/AppContext';

const Hero = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.color.purple};
  height: 100vh;
`;
const NoNotificationContainer = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.color.white};
  height: 200px;
  border-radius: 30px;
  padding: 50px;
  font-family: Roboto;
  font-weight: 500;
  color: ${props => props.theme.color.textBlack};
`;
const NotificationsSection = styled.section`
  display: flex;
  justify-content: center;
`;
const Container = styled.section`
  flex-basis: 700px;
  background-color: ${props => props.theme.color.white};
  border-radius: 20px;
  box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
  height: 90vh;
  overflow: hidden;
  h1 {
    font-size: 2rem;
    text-align: center;
    font-family: Roboto;
    color: ${props => props.theme.color.textBlack};
  }
`;
const Notifications = styled.div`
  height: 90vh;
  overflow-y: scroll;
  padding: 10px 50px;
`;
const Notification = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr 1fr;
  align-items: center;
  background-color: ${props => props.theme.color.lightPurple};
  padding: 15px;
  border-radius: 20px;
  margin: 10px;
`;
const Dot = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${props => props.theme.color.lightRed};
  border-radius: 100%;
  justify-self: end;
`;
const Duration = styled.p`
  font-size: 0.8em;
  font-weight: 700;
  color: ${props => props.theme.color.purple};
  justify-self: end;
  margin-left: 10px;
`;
const NotificationMessage = styled.p`
  a {
    text-decoration: none;
    color: ${props => props.theme.color.purple};
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    text-decoration: none;
  }
`;

export default function PageNotifications() {

  const [notifications, setNotifications] = useState([]);
  const { setUnseenNotificationsNb } = useContext(AppContext);
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    let isSubscribed = true;
    async function fetchData() {
      const res = await axios.get(`/notifications?authToken=${authToken}`);
      if (res.data && res.data.notifications && isSubscribed) {
        const resNotif = res.data.notifications.map(elem => {
          let icon = faEye;
          if (elem.type === 'liked') icon = faHeart;
          if (elem.type === 'blocked') icon = faBan;
          if (elem.type === 'unliked') icon = faHeartBroken;
          if (elem.type === 'disliked') icon = faHeartBroken;
          if (elem.type === 'matched') icon = faFireAlt;
          return {...elem, icon}
        })
        setNotifications(resNotif);
        setUnseenNotificationsNb(0);
      }
    };
    if (authToken) fetchData();
    return () => isSubscribed = false;
  }, [authToken, setUnseenNotificationsNb]);

  return (
    <Hero>
      {notifications.length > 0 &&
        <NotificationsSection>
          <Container>
            <Notifications>
              {notifications.map((notification, index) => 
                <Notification key={index}>
                  <FontAwesomeIcon 
                    style={{marginLeft: '10px', fontSize: '25px', color: 'white'}} 
                    icon={notification.icon}
                  />
                  <NotificationMessage> <Link to={`/profile/${notification.username}`}>{notification.username}</Link> {notification.type} your profile</NotificationMessage>
                  <Duration>{notification.duration}</Duration>
                  {notification.status === 'unseen' && 
                    <Dot></Dot>
                  }
                </Notification>
              )}
            </Notifications>
          </Container>
        </NotificationsSection>
      }
      {notifications.length === 0 &&
        <NoNotificationContainer>
          <p>Sorry but you have no notification yet</p>
        </NoNotificationContainer> 
      }
    </Hero>
  );
}
