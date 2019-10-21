import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Image } from 'cloudinary-react';
import { Link } from 'react-router-dom';
import LikeButton from '../../../../components/LikeButton';
import { ProfileProvider } from '../../../../contexts/ProfileContext';
import Axios from 'axios';


const StyledDiv = styled.div `
    display:flex;
    height:80px;
    padding-right:0.75rem;

    overflow:hidden;
    align-items:center;
    border-radius:${props => props.theme.borderRadius};
    
    background-color:#FBF9FF;
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
`

const ProfilePhoto = styled(Image) `
    height:100%;
    width:80px;

    object-fit:cover;
`

const InfosContainer = styled(Link) `
    display:flex;
    flex-direction:column;
    justify-content:center;
    text-decoration:none;
    flex:1;
    padding:0.5rem;
`

const Username = styled.span `
    font-size:1.25rem;
    color:${props => props.color};
    font-weight:600;
`

const Age = styled.span `
    font-size:1.15rem;
    color: #8c92a6;
    font-weight:400;
`

export default function UserListItem(props) {
    const authToken = localStorage.getItem(`token`);
    
    const [profileState, setProfileState] = useState({});
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        let isSubscribed = true;
        async function fetchProfile(edit) {
            const username = `/${props.username}`;
            const profile = await Axios.get(`/users${username}?authToken=${authToken}`)
            if (isSubscribed) setProfileState({
                ...profile.data.profile,
            })
        }
        if (authToken) fetchProfile();
        return () => isSubscribed = false;
    }, [authToken, props.username, refresh])

    return (
        <ProfileProvider value={{...profileState, setRefresh}}>
            <StyledDiv>
                <ProfilePhoto cloudName='matchacn' publicId={props.photos.length > 0 ? props.photos[props.avatarIndex] : "profilePlaceholder"}/>
                <InfosContainer to={`/profile/${props.username}`}>
                    <Username color={props.color}>{props.username}</Username>
                    <Age>{props.age}, {props.city}</Age>
                </InfosContainer>
                <LikeButton size={"2rem"} small listItem/>
            </StyledDiv>
        </ProfileProvider>
    )
}