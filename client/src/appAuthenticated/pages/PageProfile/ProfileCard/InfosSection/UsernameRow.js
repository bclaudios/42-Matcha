import React, { useContext, Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMars, faVenus, faTransgender, faCog, faPlus, faCircle, faDotCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '@material-ui/core/Tooltip';
import ProfileContext from '../../../../../contexts/ProfileContext';
import AppContext from '../../../../../contexts/AppContext';
import LikeButton from '../../../../../components/LikeButton';

const StyledRow = styled.div `
    display:flex;
    box-sizing:border-box;
    width:100%;
    min-height:4rem;
    padding:0 1rem;

    justify-content:space-between;
    align-items:center;
`

const NamesContainer = styled.div `
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    `

const UsernameContainer = styled.div `
    display:flex;
    
    align-items:center;
`

const Username = styled.h2 `
    margin:0;
    margin-right:1rem;
    
    color:${props => props.theme.color.lightRed};
    font-size:2.5rem;
`

const StyledNames = styled.p `
    margin:0 0 0 1.5rem;
    font-weight:300;
    font-style:italic;
`

const EditButton = styled(FontAwesomeIcon) `
        color:${props => props.theme.color.purple};
        :hover {
            cursor:pointer;
        }
        `

const SettingsButton = styled.div `
        border-radius:1000px;
        border:2px solid ${props => props.theme.color.purple};
        box-shadow: 0px 0px 20px -1px ${props => props.theme.color.purple};
        height:55px;
        width:55px;
        display:flex;
        align-items:center;
        justify-content:center;
        :not(:last-child) {
        margin-right:1.5rem;
        }
        :active {
            box-shadow:0 0 0 0;
            cursor:pointer;
        }
`

const GenderIcon = (props) => {
    const icons = {
        "male": faMars,
        "female": faVenus,
        "non-binary": faTransgender
    }

    const GenderIcon = styled(FontAwesomeIcon) `
        color: ${props => props.theme.color.lightRed};
    `
    return (
        <GenderIcon icon={icons[props.gender]} size={props.size}/>
    );
}


export default function UsernameRow(props) {
    const profile = useContext(ProfileContext);
    const { connectedUsers } = useContext(AppContext);
    const [connected, setConnected] = useState();

    useEffect(() => {
        let isSubscribed = true;
        if (isSubscribed) setConnected(connectedUsers.includes(profile.userId).toString());
        return () => isSubscribed = false;
    }, [connectedUsers, profile.userId])

    const ConnectedIcon = (props) => {
        const StyledIcon = styled(FontAwesomeIcon) `
            color: ${props => props.connected === 'true' ? "#1af033" : "#9c9c9c"};
            margin-right:0.75rem;
        `
        
        return (
            <Tooltip title={props.connected === 'true' ? "Online" : props.lastConnection}>
                <StyledIcon
                    connected={props.connected}
                    icon={props.connected === 'true' ? faCircle : faDotCircle}
                    size={props.size}
                />
            </Tooltip>
        )
    }

    const PhotoUploadButton = () => {
        return(
            <SettingsButton>
                <input
                   accept="image/*"
                   style={{ display: 'none' }}
                   id="uploadFileButton"
                   type="file"
                   onChange={profile.uploadPicture}
                   />
                <label htmlFor="uploadFileButton">
                    <EditButton icon={faPlus} size={"2x"}/>
                </label>
            </SettingsButton>
        )
    }

    return (
        <StyledRow>
            <NamesContainer>
                <UsernameContainer>
                    <ConnectedIcon 
                        connected={connected} 
                        lastConnection={profile.lastConnection}
                        size={"xs"}
                        />
                    <Username>{profile.username}</Username>
                    {profile.gender && <GenderIcon gender={profile.gender} size={"3x"}/>}
                </UsernameContainer>
                <StyledNames>{profile.firstName} {profile.lastName}</StyledNames>
            </NamesContainer>
            <UsernameContainer>
                {profile.account ?
                <Fragment>
                {profile.photos.length < 5 && <PhotoUploadButton/>}
                <Link to="/profile/edit">
                    <SettingsButton>
                    <EditButton icon={faCog} size={"2x"} onClick={profile.openEdit}/>
                    </SettingsButton>
                </Link>
                </Fragment> :
                <LikeButton/>
            }
            </UsernameContainer>
        </StyledRow>
    )
}