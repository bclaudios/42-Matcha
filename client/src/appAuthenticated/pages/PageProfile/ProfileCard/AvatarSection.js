import React, { Fragment, useState, useContext } from 'react';
import styled from 'styled-components';
import cloudinary from 'cloudinary-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '@material-ui/core';
import ProfileContext from '../../../../contexts/ProfileContext';
import PhotosModal from '../../../../components/PhotosModal';

const cloudinaryCore = new cloudinary.Cloudinary({cloud_name: 'matchacn'});

const StyledSection = styled.section `
    display:flex;
    min-width:300px;
    min-height:375px;

    align-items:flex-end;
    
    border-radius:${props => props.theme.borderRadius} 0 0 ${props => props.theme.borderRadius};
    background-image: url(${props => props.avatar});
    background-position: center center;
    background-size: cover;
    @media (max-width: 1000px) { 
        border-radius:0;
    }
    @media (max-width: 740px) {
        height:300px;
    }
`;

const ScoreContainer = styled.div `
    display:flex;
    height:150px;
    width:100%;
    
    align-items:flex-end;
    justify-content:center;
    
    border-radius:0 0 0 ${props => props.theme.borderRadius};
    background: linear-gradient(179.76deg, rgba(0, 0, 0, 0) 0.51%, #000000 83.4%);
    @media (max-width: 1000px) { 
        border-radius:0;
    }
`;

const Score = styled.div `
    margin-bottom:1.5rem;
    
    color:white;
    font-size:2rem;
`;

const ScoreIcon = styled(FontAwesomeIcon) `
    margin-right:0.75rem;
    
    color:${props => props.theme.color.red};
`;

export default function AvatarSection(props) {
    const [open, setOpen] = useState(false);
    const profile = useContext(ProfileContext);
    
    const OpenModal = () => {
        if (profile.photos.length > 0)  {
            setOpen(true);
        }
    }

    const CloseModal = (event) => {
        if (!event || event.target.tagName === "DIV") {
            setOpen(false);
        }
    }

    return (
        <Fragment>
            <StyledSection avatar={profile.photos.length > 0 ? cloudinaryCore.url(profile.photos[profile.avatarIndex]) : "https://res.cloudinary.com/matchacn/image/upload/v1566436361/profilePlaceholder.png"} onClick={OpenModal}>
                <ScoreContainer>
                    <Score>
                        <ScoreIcon icon={faFireAlt}/>
                        <span>{profile.score}</span>
                    </Score>
                </ScoreContainer>
            </StyledSection>
            <Modal open={open} onClose={CloseModal}>
                <div style={{ height: '100%'}}>
                <PhotosModal handleClose={CloseModal}/>
                </div>
            </Modal>
        </Fragment>
    )
}