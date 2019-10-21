import React, { useContext, Fragment } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import ProfileContext from '../contexts/ProfileContext';
import AppContext from '../contexts/AppContext';
import axios from 'axios';

const StyledButton = styled.button `
        height:${props => props.small ? "3.25rem" : "4.5rem"};
        width:${props => props.small ? "3.25rem" : "4.5rem"};
        padding:0;
        border:none;
        border-radius:1000px;
        :hover {
            cursor:pointer;
        }
        :active {
            box-shadow:0 0 0 0;
        }
    `;

    const StyledLikeButton = styled(StyledButton) `
        color: ${props => props.theme.color.purple};
        box-shadow: 0px 0px 20px ${props => props.theme.color.purple};
        :hover {
            color:white;
            background-color:${props => props.theme.color.purple};
            border-color:${props => props.theme.color.purple};
        }
    `;

    const CancelLikeButton = styled(StyledButton) `
        color:white;
        background-color:${props => props.theme.color.purple};
        box-shadow: 0px 0px 20px -1px ${props => props.theme.color.purple};
        :hover {
            color: ${props => props.theme.color.purple};
            background-color:white;
            border-color:${props => props.theme.color.purple};
        }
    `;

    const MatchButton = styled(StyledButton) `
        color:${props => props.theme.color.red};
        background-color:white;
        box-shadow: 0px 0px 20px -1px ${props => props.theme.color.red};
        border: 1px solid ${props => props.theme.color.red};
        :hover {
            color: white;
            background-color:${props => props.theme.color.red};
            border-color:${props => props.theme.color.red};
        }
    `;

    const CancelMatchButton = styled(StyledButton) `
        color:white;
        background-color:${props => props.theme.color.red};
        box-shadow: 0px 0px 20px -1px ${props => props.theme.color.red};
        :hover {
            color: ${props => props.theme.color.red};
            background-color:${props => props.theme.color.red};
            border-color:${props => props.theme.color.purple};
        }
    `

    const StyledStatus = styled.span `
        color:${props => props.theme.color.textGrey};
        margin-right:1rem;
    `

const LikeButton = (props) => {
    const authToken = localStorage.getItem(`token`)

    const { socket } = useContext(AppContext);
    const profile = useContext(ProfileContext);

    const createNotif = async type => {
        if (profile.userId) {
            const data = {
                type,
                targetUserId: profile.userId,
            };
            await axios.post(`/notifications?authToken=${authToken}`, data);
            socket.emit('createNotification', data);
        }
    };
    
    const handleClick = async event => {
            if (profile.liked) {
                const params = {data: {
                    type: "liked",
                    targetUserId: profile.userId,
                }}
                axios.delete(`/users/deleteRelationship?authToken=${authToken}`, params)
                    .then(res => {
                        createNotif('unliked')
                        profile.setRefresh(p => (!p));
                    })
                    .catch(err => { window.alert("You need to have at least 1 picture to like a user.") })
            } else {
                const params = {
                    type: "liked",                
                    targetUserId: profile.userId,
                }
                axios.post(`/users/createRelationship?authToken=${authToken}`, params)
                    .then(res => {
                        createNotif(res.data.type)
                        profile.setRefresh(p => (!p));
                    })
                    .catch(err => { window.alert("You need to have at least 1 picture to like a user.") })
            }
            profile.setRefresh(p => (!p));
    }

    if (profile.liked && profile.likedBy)
        return (
            <Fragment>
                {!props.listItem && <StyledStatus>You matched with {profile.username}</StyledStatus>}
                <CancelMatchButton onClick={handleClick} small={props.small}>
                    <FontAwesomeIcon icon={faHeart} size={props.small ? "lg" : "2x"}/>
                </CancelMatchButton>
            </Fragment>
        )
    if (!profile.liked && !profile.likedBy)
        return (
            <Fragment>
                {!props.listItem && <StyledStatus>Do you like {profile.username} ? </StyledStatus>}
                <StyledLikeButton onClick={handleClick} small={props.small}>
                    <FontAwesomeIcon icon={faHeart} size={props.small ? "lg" : "2x"}/>
                </StyledLikeButton>
            </Fragment>
        )
    if (profile.liked && !profile.likedBy)
        return (
            <Fragment>
                {!props.listItem && <StyledStatus>You like {profile.username}</StyledStatus>}
                <CancelLikeButton onClick={handleClick} small={props.small}>
                    <FontAwesomeIcon icon={faHeart} size={props.small ? "lg" : "2x"}/>
                </CancelLikeButton>
            </Fragment>
        )
    if (!profile.liked && profile.likedBy)
        return (
            <Fragment>
                {!props.listItem && <StyledStatus>{profile.username} likes you !</StyledStatus>}
                <MatchButton onClick={handleClick} small={props.small}>
                    <FontAwesomeIcon icon={faHeart} size={props.small ? "lg" : "2x"}/>
                </MatchButton>
            </Fragment>
        )
}

export default LikeButton;