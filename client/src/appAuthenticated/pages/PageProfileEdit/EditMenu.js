import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const StyledSection = styled.section `
    display:flex;
    min-width:300px;
    padding:20px 0;

    border-radius:${props => props.theme.borderRadius} 0 0 ${props => props.theme.borderRadius};
    background-color:#2b2c2e;

    box-shadow: inset -50px 0px 56px -51px rgba(0,0,0,0.65);
    @media (max-width: 1000px) { 
        border-radius:0;
        padding:0px;
    }
`

const ButtonContainer = styled.div `
    width:100%;
    display:flex;
    flex-direction:column;
    margin:auto;
    @media (max-width: 700px) { 
        flex-direction:row;
    }
`

const StyledButton = styled.button `
    width:100%;
    display:flex;
    flex-direction:column;
    align-items:center;
    background:none;
    border:none;
    font-size:1rem;
    padding:1rem 0;
    color:${props => props.theme.color.purple};
    font-weight:bold;
    :hover {
        cursor: pointer;
    }
`

const StyledSelectedButton = styled(StyledButton) `
    background-color:${props => props.theme.color.purple};
    color:#2b2c2e;
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
`

export default function EditMenu(props) {
    return (
        <StyledSection>
            <ButtonContainer>
                {props.selectedTab === "profile" ?
                    <StyledSelectedButton><FontAwesomeIcon icon={faUser} size={"3x"}/>PROFILE</StyledSelectedButton> :
                    <StyledButton id="profile" onClick={props.handleClick}><FontAwesomeIcon id="profile" icon={faUser} size={"3x"}/> PROFILE</StyledButton>
                }
                {props.selectedTab === "account" ? 
                    <StyledSelectedButton><FontAwesomeIcon icon={faCog} size={"3x"}/>ACCOUNT</StyledSelectedButton> :                    
                    <StyledButton id="account" onClick={props.handleClick}><FontAwesomeIcon id="account" icon={faCog} size={"3x"} /> ACCOUNT</StyledButton>
                }
                {props.selectedTab === "blockedList" ? 
                    <StyledSelectedButton><FontAwesomeIcon icon={faEyeSlash} size={"3x"}/>BLOCKED USERS</StyledSelectedButton> :                    
                    <StyledButton id="blockedList" onClick={props.handleClick}><FontAwesomeIcon id="blockedList" icon={faEyeSlash} size={"3x"} />BLOCKED USERS</StyledButton>
                }
            </ButtonContainer>
        </StyledSection>
    )
}