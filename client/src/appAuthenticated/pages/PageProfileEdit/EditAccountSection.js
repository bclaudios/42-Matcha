import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import Separator from '../../../components/Separator';
import { faTimes, faCheck, faUser } from '@fortawesome/free-solid-svg-icons';
import { TextField } from '@material-ui/core';
import ProfileContext from '../../../contexts/ProfileContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

const StyledSection = styled.section `
    padding:1rem;
    height:700px;
    border-radius:0 ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} 0;
    background-color:#2b2c2e;
    width:100%;
    @media (max-width: 1000px) { 
        border-radius:0;
    }
`

const StyledTextField = styled(TextField) `
    label {
        color:${props => props.theme.color.lightRed};
        font-size:1.25rem;
        font-weight:bold;
    }
    div {
        color:white;
        height:100%;
        option {
            color:#2b2c2e;
            background-color:black;
        }
    }
    svg { color: ${props => props.theme.color.lightRed}; }
    p { color: ${props => props.theme.color.lightRed};}
`

const GridForm = styled.form `
    width:100%;
    display:grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 3.5rem 3.5rem 3.5rem 3.5rem 3.5rem auto;
    grid-template-areas:
    "usernameSeparator usernameSeparator"
    "username username"
    "email emailConf"
    "prevPassword prevPassword"
    "newPassword newPassword"
    "newPasswordConf newPasswordConf"
    "cancelButton submitButton";
    grid-column-gap: 1rem;
    grid-row-gap: 2rem;
`

const UsernameTextField = styled(StyledTextField) `grid-area:username;`
const EmailTextField = styled(StyledTextField) `grid-area:email;`
const EmailConfTextField = styled(StyledTextField) `grid-area:emailConf;`
const PrevPasswordTextField = styled(StyledTextField) `grid-area:prevPassword;`
const NewPasswordTextField = styled(StyledTextField) `grid-area:newPassword;`
const NewPasswordConfTextField = styled(StyledTextField) `grid-area:newPasswordConf;`
const UsernameSeparator = styled.div `grid-area: usernameSeparator;`

const StyledButton = styled.div `
    box-sizing:border-box;
    display:flex;
    justify-content:center;
    align-items:center;
    border-radius:5px;
    font-weight:bold;
    height:100%;
    width:100%;
    :hover {
        cursor:pointer;
    }
`

const SubmitButton = styled(StyledButton) `
    grid-area:submitButton;
    background-color:${props => props.theme.color.purple};
    color:#2b2c2e;
    height:2rem;
    :hover {
        border:2px solid ${props => props.theme.color.purple};
        color:${props => props.theme.color.purple};
        background-color:#2b2c2e;
    }
`

const CancelButton = styled(StyledButton) `
    grid-area:cancelButton;
    border:2px solid ${props => props.theme.color.purple};
    color:${props => props.theme.color.purple};
    height:2rem;
`

export default function InfosSection() {
    
    const authToken = localStorage.getItem('token');
    const profile = useContext(ProfileContext);
    const [valueState, setValueState] = useState({ 
        ...profile,
    })
    const [redirect, setRedirect] = useState(false);
    
    const [errorState, setErrorState] = useState({});
    
    const [editState, setEditState] = useState({});
    
    function handleValueChange(event) {
        const {name, value} = event.target;
        if (!valueIsValid(name, value)) {
            displayErrorText(name);
        } else {
            const newErrorState = {...errorState};
            delete newErrorState[`${name}Error`];
            delete newErrorState[`${name}Helper`];
            setErrorState({ ...newErrorState });
        }
        setValueState({ ...valueState, [name]: value });
        if (name !== "newPasswordConf" || name !== "emailConf"){
            setEditState({ ...editState, [name]: value });
        }
    };

    
    const valueIsValid = (name, value) => {
        if (name === "emailConf" && valueState.email !== value)
            return false;
        if (name === "newPasswordConf" && valueState.newPassword !== value)
            return false;
        const regex = {
          email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          username: /^[A-Za-zÀ-ÖØ-öø-ÿ]{5,10}$/,
          newPassword: /^(?:(?=.*?[A-Z])(?:(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=])|(?=.*?[a-z])(?:(?=.*?[0-9])|(?=.*?[-!@#$%^&*()_[\]{},.<>+=])))|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=]))[A-Za-z0-9!@#$%^&*()_[\]{},.<>+=-]{6,50}$/,
        };
        return (!regex[name] || regex[name].test(String(value)));
    };
    
    const displayErrorText = name => {
        const errorMessage = {
            email: 'Enter a proper email',
            username: 'Between 6 and 10 characters, only letters',
            emailConf: 'E-mail adresses not matching.',
            newPassword: 'Minimum 6 characters, at least three of those four categories: uppercase, lowercase, number and special character',
            newPasswordConf: 'Passwords not matching.',
        };
        setErrorState({
            ...errorState,
            [`${name}Error`]: true,
            [`${name}Helper`]: errorMessage[name],
        })
    }
    
    const SubmitChanges = async () => {
        if (Object.keys(editState).length > 0 && Object.keys(errorState).length === 0) {
            console.log(editState);
            if (Object.keys(editState).includes('prevPassword') || Object.keys(editState).includes('newPassword') || Object.keys(editState).includes('newPasswordConf')) {
                if (!Object.keys(editState).includes('prevPassword') || !Object.keys(editState).includes('newPassword') || !Object.keys(editState).includes('newPasswordConf')) {
                    console.log("????")
                    return
                }
            }
            axios.post(`/users/updateProfile?authToken=${authToken}`, editState)
                .then(res => { setRedirect(true) })
                .catch(error => {
                    const errors = error.response.data.errors;
                    if (errors.includes('emailTaken')) {
                    setErrorState({
                        ...errorState,
                        [`emailError`]: true,
                        [`emailHelper`]: "This email is already taken.",
                    })
                }
                if (errors.includes('usernameTaken')) {
                    setErrorState({
                        ...errorState,
                        [`usernameError`]: true,
                        [`usernameHelper`]: "This username is already used.",
                    })
                }
                if (errors.includes('wrongCurrentPassword')) {
                    setErrorState({
                        ...errorState,
                        [`passwordError`]: true,
                        [`passwordHelper`]: "Wrong current password",
                    })
                }
            })
        } else {
            setRedirect(true)
        }
    }

    return (
        <StyledSection>
            <GridForm>
                    <UsernameSeparator>
                        <Separator icon={faUser} size={'lg'}/>
                    </UsernameSeparator>
                    <UsernameTextField
                        fullWidth
                        label="Username"
                        name='username'
                        value={valueState.username}
                        onChange={handleValueChange}
                        error={errorState.usernameError}
                        helperText={errorState.usernameHelper}
                        variant="outlined"
                    />
                    <EmailTextField
                        label="Email"
                        name='email'
                        value={valueState.email}
                        onChange={handleValueChange}
                        error={errorState.emailError}
                        helperText={errorState.emailHelper}
                        variant="outlined"
                    />
                    <EmailConfTextField
                        fullWidth
                        label="Email Confirmation"
                        name='emailConf'
                        value={valueState.emailConf}
                        onChange={handleValueChange}
                        error={errorState.emailConfError}
                        helperText={errorState.emailConfHelper}
                        variant="outlined"
                    />
                    <PrevPasswordTextField
                        fullWidth
                        label="Actual Password"
                        name='prevPassword'
                        type='password'
                        value={valueState.password}
                        onChange={handleValueChange}
                        error={errorState.passwordError}
                        helperText={errorState.passwordHelper}
                        variant="outlined"
                    />
                    <NewPasswordTextField
                        fullWidth
                        label="New Password"
                        name='newPassword'
                        type='password'
                        value={valueState.password}
                        onChange={handleValueChange}
                        error={errorState.newPasswordError}
                        helperText={errorState.newPasswordHelper}
                        variant="outlined"
                    />
                    <NewPasswordConfTextField
                        fullWidth
                        label="New Password Confirmation"
                        name='newPasswordConf'
                        type='password'
                        value={valueState.passwordConf}
                        onChange={handleValueChange}
                        error={errorState.newPasswordConfError}
                        helperText={errorState.newPasswordConfHelper}
                        variant="outlined"
                    />
                    <CancelButton onClick={SubmitChanges}><FontAwesomeIcon icon={faTimes} size={'lg'}/></CancelButton>
                    <SubmitButton onClick={SubmitChanges}><FontAwesomeIcon icon={faCheck} size={'lg'}/></SubmitButton>
            </GridForm>
            {redirect && <Redirect to='/profile'/>}
        </StyledSection>
    )
}