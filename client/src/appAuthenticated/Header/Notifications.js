import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppContext from '../../contexts/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import NotificationDot from '../../components/NotificationDot';
import axios from 'axios';

export default function Notifications() {
    const { socket, unseenNotificationsNb, setUnseenNotificationsNb } = useContext(AppContext);
    const authToken = localStorage.getItem('token');


    useEffect(() => {
        if (socket !== null && authToken) {
            socket.on('receiveNotification', async () => {
                // console.log('check your notif !');
                const resNotif = await axios.get(`/notifications/unseenNotificationsNb?authToken=${authToken}`);
                setUnseenNotificationsNb(resNotif.data.nb);
            });
            return () => {
                socket.off('visited');
            }
        }
    }, [authToken, socket, setUnseenNotificationsNb]);

    return (
        <Link to="/notifications" style={{textDecoration: 'none'}}>
        {unseenNotificationsNb !== 0 &&
            <NotificationDot 
                nb={unseenNotificationsNb}
            />
        }
            <FontAwesomeIcon  style={{fontSize: '25px', cursor: 'pointer', color: 'white'}} icon={faBell}/>
        </Link>
    );
}