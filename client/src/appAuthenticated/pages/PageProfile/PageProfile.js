import React, { Fragment, useState, useEffect, useContext } from "react";
import axios from 'axios';
import styled from 'styled-components';

import { ProfileProvider } from '../../../contexts/ProfileContext';
import { faEye, faHeart } from '@fortawesome/free-solid-svg-icons';

import AppContext from '../../../contexts/AppContext';
import Container from "../../../components/Container";
import ProfileCard from './ProfileCard/ProfileCard';
import UserList from './UserList/UserList';
import { Redirect } from 'react-router-dom';


const GridContainer = styled.div `
    display:grid;
    margin-top:2rem;
    min-width:360px;

    grid-template-columns:1fr;
    grid-template-rows:auto;
    grid-row-gap:2rem;
    @media (max-width: 1000px) {
        grid-row-gap:0rem;
        margin-top:0;
    }
`

export default function PageProfile(props) {
    const authToken = localStorage.getItem('token');

    const { socket } = useContext(AppContext);
    const [profileState, setProfileState] = useState({
        uplopadPicture: uploadPicture,
    });
    const [redirect, setRedirect] = useState(false);
    const [isLoadingState, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    
    // FETCH PROFILE EFFECT
    useEffect(() => {
        let isSubscribed = true;
        async function fetchProfile() {
            setIsLoading(true);
            const username = props.match.params.username ? `/${props.match.params.username}` : "";
            const profile = await axios.get(`/users${username}?authToken=${authToken}`)
            if ((profile.data === "unknown user" || profile.data.profile.inSearch === false ||
                profile.data.profile.blockedBy ||
                profile.data.profile.blocked) && isSubscribed) {
                setRedirect(true)
            } 
            if (isSubscribed) {
                setProfileState(prev => ({...prev, ...profile.data.profile}))
                setIsLoading(false);
            }
        }
        if (authToken) fetchProfile();
        return () => isSubscribed = false;
    }, [authToken, props.match.params.username, refresh])
    
    // VISITED RELATIONSHIP EFFECT
    useEffect(() => {
        async function createRelNotif() {
            if (profileState.userId  && !profileState.account && !profileState.visited) {
                const data = {
                    type: 'visited',
                    targetUserId: profileState.userId,
                };
                await axios.post(`/notifications?authToken=${authToken}`, data);
                await axios.post(`/users/createRelationship?authToken=${authToken}`, {
                    type: "visited",
                    targetUserId: profileState.userId,
                })
                socket.emit('createNotification', data);
            }
        }
        if (authToken) createRelNotif();
    }, [authToken, socket, profileState.userId, profileState.account, profileState.visited])

    const blockUser = async () => {
        const confirm = window.confirm(`Do you really want to block ${profileState.username} ?\n\nThis will delete all your relationship(s) with ${profileState.username}.`);
        if (confirm && !profileState.blocked) {
            await axios.post(`/users/blockUser?authToken=${authToken}`, {targetUserId: profileState.userId});
            window.alert(`${profileState.username} has been blocked.`);
            setRedirect(true);
        }
    }

    const reportUser = async () => {
        const confirm = window.confirm(`Do you really want to report ${profileState.username} ?`);
        if (confirm) {
            await axios.post(`/users/reportUser?authToken=${authToken}`, {targetUserId: profileState.userId});
            window.alert(`${profileState.username} has been reported.`)
        }
    }

    async function uploadPicture(event) {
        event.preventDefault();
        const file = event.target.files[0];
        if (file.size && file.size < 1000000) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const image  = reader.result;
                await axios.post(`/users/uploadPic?authToken=${authToken}`, { image })
                setRefresh(p => (!p));
            }
        }
    }

    return (
        <ProfileProvider value={{
            ...profileState,
            uploadPicture,
            setRefresh,
            setRedirect,
            blockUser,
            reportUser,
        }}>

            <Container>
                <GridContainer>
                    <ProfileCard isLoading={isLoadingState}/>
                    {profileState.account &&
                        <Fragment>
                            {profileState.likedHistoric &&
                                <UserList
                                title={"Users who likes you"} 
                                list={profileState.likedHistoric}
                                icon={faHeart} 
                                color={"#FF5B6C"} 
                                />
                            }
                            {profileState.visitedHistoric &&
                                <UserList 
                                title={"Users who visited your profile"}
                                list={profileState.visitedHistoric}
                                icon={faEye} 
                                color={"#6f48bd"}
                                />
                            }
                        </Fragment>
                    }
                </GridContainer>
            </Container>
            {redirect && <Redirect to='/search'/>}

        </ProfileProvider>
    )
}