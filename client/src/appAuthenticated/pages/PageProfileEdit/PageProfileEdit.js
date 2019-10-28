import React, { useState, useEffect } from "react";
import axios from 'axios';
import Container from '../../../components/Container';
import { ProfileProvider } from '../../../contexts/ProfileContext';
import styled from 'styled-components'
import EditMenu from './EditMenu';
import EditProfileSection from './EditProfileSection'
import EditAccountSection from './EditAccountSection'
import BlockedList from "./BlockedList";


const EditCard = styled.div`
        margin-top:2rem;
        display:flex;
        max-width:1000px;
        width:100%;
        min-width:360px;
        border-radius: ${props => props.theme.borderRadius};
        background-color: ${props => props.theme.color.background};
        box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
        @media (max-width: 1000px) { border-radius: 0px; }
        @media (max-width: 700px) { flex-direction:column; }
`

export default function PageProfileEdit() {
    const authToken = localStorage.getItem('token');

    const [profileState, setProfileState] = useState({});
    const [editState, setEditState] = useState({ tab: "profile" });
    const sectionsList = {
        "profile": <EditProfileSection/>,
        "account": <EditAccountSection/>,
        "blockedList": <BlockedList/>
    }

    useEffect(() => {
        let isSubscribed = true;
        async function fetchProfile() {
            const profile = await axios.get(`/users?authToken=${authToken}`)
            if (isSubscribed) setProfileState({ 
                ...profile.data.profile,
            });
        }
        if (authToken) fetchProfile();
        return () => isSubscribed = false;
    }, [authToken])

    const switchTab = event => {
        const selectedTab = event.currentTarget.id;
        setEditState({ tab: selectedTab })
    }

    return (
        <ProfileProvider value={{...profileState}}>
            <Container>
                {profileState.username && 
                    <EditCard>
                        <EditMenu selectedTab={editState.tab} handleClick={switchTab}/>
                        {sectionsList[editState.tab]}
                    </EditCard>
                }
            </Container>
        </ProfileProvider>
    )
}