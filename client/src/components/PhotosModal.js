import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Image } from 'cloudinary-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import ProfileContext from '../contexts/ProfileContext';

const ModalContainer = styled.div `
    display:flex;
    height:100%;
    width:100%;
    flex-direction:column;
    align-items:center;
    background-color:rgb(66, 66, 66, 0.7);
`

const MainImgContainer = styled.div `
    display:flex;
    max-height:50vh;
    margin: 5rem 0 2rem 0;
    flex-direction:column-reverse;
    align-items:center;       
`

const ImgButtonContainer = styled.div `
    display:flex;
    align-items:space-between;
    justify-content:space-between;
    height:2rem;
    width:20rem;
`

const StyledImgButton = styled(FontAwesomeIcon) `
    color:white;
`

const MainImg = styled(Image) `
    margin-bottom:0.5rem;
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.2);
`

const ArrowButtonsContainer = styled.div `
    display:flex;
    margin-bottom:2rem;
    justify-content:center;
    align-items:center;
`

const StyledArrowIcon = styled(FontAwesomeIcon) `
    margin: 0 1rem;
    color:white;
`

const ThumbnailContainer = styled.div `
    display: flex;
    max-height:6rem;
    max-width:1000px;
    justify-content:center;
    @media (max-width: 740px) {
        display:none;
    }
`


export default function PhotosModal(props) {
const authToken = localStorage.getItem('token');
    
    const profile = useContext(ProfileContext);
    const [currentIndexState, setCurrentIndexState] = useState(profile.avatarIndex);
    const [photosState] = useState([...profile.photos]);
    let maxIndex = photosState.length - 1;


    const Thumbnail = styled(Image) `
        object-fit:cover;
        min-width:10.6rem;
        box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.2);
        ${props => props.index === currentIndexState && 
            `border:2px solid ${props.theme.color.lightRed};`
        }
        :not(:last-child) { margin-right:1rem; }
        :hover {
            cursor:pointer;
        }
    `

    const handleDelete = async () => {
        const confirm = window.confirm(`Are you sure you want to delete this picture ?`);
        if (confirm) {
            const filteredPhotos = [...profile.photos];
            filteredPhotos.splice(currentIndexState, 1);
            const editedValues = {
                avatarIndex: profile.avatarIndex === currentIndexState ?
                0 :
                (profile.avatarIndex > currentIndexState ? profile.avatarIndex -1 : profile.avatarIndex),
                photos: filteredPhotos,
            }
            await axios.post(`/users/updateProfile?authToken=${authToken}`, editedValues)
            profile.setRefresh(p => (!p));
        }
    }

    const handleSetAsProfile = async () => {
        const confirm = window.confirm(`Do you wish to set this picture to your profile pic ?`);
        if (confirm) {
            const editedValues = { avatarIndex: currentIndexState }
            await axios.post(`/users/updateProfile?authToken=${authToken}`, editedValues)
            profile.setRefresh(p => (!p))
        }
    }
    const handlePrevious = () => {
        setCurrentIndexState(currentIndexState - 1 < 0 ? maxIndex : currentIndexState - 1);
    }

    const handleNext = () => {
        setCurrentIndexState(currentIndexState + 1 > maxIndex ? 0 : currentIndexState + 1);
    }

    return (
        <ModalContainer onClick={props.handleClose}>
            <MainImgContainer>
                {profile.account &&
                    <ImgButtonContainer>
                        <StyledImgButton icon={faTrashAlt} onClick={handleDelete} size={'lg'} style={{color:'#FF5B6C'}}/>
                        <p onClick={handleSetAsProfile} style={{margin:'0', color:'#FF5B6C', fontWeight:"bold"}}>Set as profile pic</p>
                    </ImgButtonContainer>
                }
                <MainImg cloudName="matchacn" publicId={photosState[currentIndexState]}/>
            </MainImgContainer>
                <ArrowButtonsContainer>
                    <StyledArrowIcon icon={faArrowLeft} size={"lg"} onClick={handlePrevious}/>
                    <StyledArrowIcon icon={faArrowRight} size={"lg"} onClick={handleNext}/>
                </ArrowButtonsContainer>
                <ThumbnailContainer>
                    {photosState.map((photo, index) => 
                        <Thumbnail cloudName="matchacn" publicId={photo} key={index} index={index} onClick={() => setCurrentIndexState(index)}/>
                    )}
                </ThumbnailContainer>
        </ModalContainer>
    )
}