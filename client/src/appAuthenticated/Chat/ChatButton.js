import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import AppContext from '../../contexts/AppContext';
import ChatNotificationDot from './ChatNotificationDot';

export default function ChatButton() {
    const { unreadMessagesNb } = useContext(AppContext);

    return (
        <Link to="/chat" style={{textDecoration: 'none'}}>
            {unreadMessagesNb !== 0 &&
                <ChatNotificationDot 
                    nb={unreadMessagesNb}
                />
            }
            <FontAwesomeIcon  style={{fontSize: '25px', cursor: 'pointer', color: 'white'}} icon={faComment}/>
        </Link>
    );
}