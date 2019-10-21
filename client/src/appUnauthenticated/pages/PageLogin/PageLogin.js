import React, { useState, useContext, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import { actionLogin } from '../../../actions/authActions';
import AppContext from '../../../contexts/AppContext';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Modal from '@material-ui/core/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Hero = styled.section`
  background-color: ${props => props.theme.color.purple};
  height: 100vh;
`;
const LoginSection = styled.section`
  display: flex;
  justify-content: center;
  padding-top: 10%;
`;
const FormContainer = styled.section`
  flex-basis: 400px;
  padding: 50px;
  background-color: ${props => props.theme.color.white};
  border-radius: 20px;
  box-shadow: 0px 42px 60px rgba(0, 0, 0, 0.25);
  h1 {
    font-size: 2rem;
    text-align: center;
    font-family: Roboto;
    color: ${props => props.theme.color.textBlack};
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;
const ErrorBox = styled.section`
  background-color: ${props => props.theme.color.ultraLightRed};
  color: red;
  padding: 5px;
  width: 60%;
  border: solid 0.5px red;
  border-radius: 8px;
  margin: 0 auto;
  margin-top: 40px;
  text-align: center;
  p {
    font-size: 0.8rem;
  }
`;
const SubmitButton = styled.button`
  text-decoration: none;
  border: none;
  display: block;
  margin: 0 auto;
  margin-top: 40px;
  background-color: ${props => props.theme.color.red};
  width: 50%;
  text-align: center;
  border-radius: 100px;
  color: ${props => props.theme.color.white};
  font-family: Roboto;
  font-size: 1em;
`;
const Redirect = styled.section`
  margin-top: 100px;
  color: ${props => props.theme.color.textGrey};
  font-weight: 500;
  text-align: center;
  a {
    text-decoration: none;
    color: ${props => props.theme.color.textGrey};
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    text-decoration: underline;
  }
`;
const ResetButton = styled.span`
  color: ${props => props.theme.color.textGrey};
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
`;
const ModalSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  outline: none;
`;
const ModalContainer = styled.section`
  flex-basis: 550px;
  padding: 50px;
  background-color: ${props => props.theme.color.white};
  border-radius: 20px;
  box-shadow: 0px 42px 60px rgba(0, 0, 0, 0.25);
  outline: none;
  h1 {
    font-size: 1.5rem;
    text-align: center;
    font-family: Roboto;
    color: ${props => props.theme.color.textBlack};
  }
`;

export default function PageLogin(props) {

  const appState = useContext(AppContext);
  const [values, setValues] = useState({
    username: '',
    password: '',
    email: '',
    resetPasswordError: false,
    resetPasswordHelper: null,
    showPassword: false,
    error: false,
    errorMsg: '',
    resetPasswordSubmited: false,
  });

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  const handleFocus = () => {
    setValues({ ...values, resetPasswordError: false, resetPasswordHelper: '', error: false });
  };
  const toggleShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };
  const handleSubmit = async event => {
    try {
      event.preventDefault();
      const credentials = {username: values.username, password: values.password};
      const res = await axios.post(`/auth`, credentials);
      if (res.data.token) await actionLogin(res.data.token);
      const resNotif = await axios.get(`/notifications/unseenNotificationsNb?authToken=${res.data.token}`);
      if (resNotif.data) appState.setUnseenNotificationsNb(resNotif.data.nb);
      const resMsg = await axios.get(`/chat/unreadMessagesNb?authToken=${res.data.token}`);
      if (resMsg.data) {
        appState.setUnreadMessagesNb(resMsg.data.nb);
        appState.toggleConnected();
        props.history.push('/search');
      }
    } catch(err) {
      if (err.response && err.response.data) {
        setValues({ ...values, error: true, errorMsg: err.response.data.errorMsg});
      }
    }
  };

  const emailIsOk = email => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email));
  }

  const handleResetPasswordSubmit = event => {
    event.preventDefault();
    if (!emailIsOk(values.email)) {
      setValues({ ...values, resetPasswordError: true, resetPasswordHelper: 'Enter a proper email' });
    } else {
      axios.post(`/users/resetPasswordEmail`, {email: values.email})
        .then(res => { setValues({ ...values, resetPasswordSubmited: true }); })
        .catch(err => {});
    }
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };
  const handleEmailBlur = event => {
    if (!emailIsOk(event.target.value)) {
      setValues({ ...values, resetPasswordError: true, resetPasswordHelper: 'Enter a proper email' });
    }
  };

  return (
    <Hero>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
      >
      <ModalSection>
        <ModalContainer>
          <p style={{textAlign: 'right'}}>
            <FontAwesomeIcon 
              style={{color: 'lightgray', cursor: 'pointer'}}
              icon={faTimes}
              onClick={handleClose}
            />
          </p>
          {values.resetPasswordSubmited && 
            <Fragment>
              <h1>Check your inbox <span aria-label="Inbox" role="img" >📥</span></h1>
              <p style={{textAlign: 'center', justify: 'center'}}>
                If the address "{values.email}" is related to a Matcha account, an email has been sent to reset your password.
              </p>
            </Fragment>
          }
          {!values.resetPasswordSubmited && 
          <Fragment>
            <h1>Forgot Password</h1>
            <p>We will send you an email with instructions on how to reset your password.</p>
            <Form noValidate autoComplete="off" onSubmit={handleResetPasswordSubmit}>
              <TextField
                id="standard-email"
                label="Email"
                required={true}
                onChange={handleChange('email')}
                onFocus={handleFocus}
                onBlur={handleEmailBlur}
                error={values.resetPasswordError}
                helperText={values.resetPasswordHelper}
                margin="normal"
              />
              <SubmitButton type="submit">
                <p>Email me</p>
              </SubmitButton>
            </Form>
          </Fragment>
          }
        </ModalContainer>
      </ModalSection>
      </Modal>
      <LoginSection>
        <FormContainer>
          <h1>Login</h1>
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              id="standard-username"
              label="Username"
              value={values.username}
              onChange={handleChange('username')}
              onFocus={handleFocus}
              margin="normal"
            />
            <FormControl>
              <InputLabel htmlFor="adornment-password">Password</InputLabel>
              <Input
                id="standard-password"
                type={values.showPassword ? 'text' : 'password'}
                onChange={handleChange('password')}
                onFocus={handleFocus}
                error={values.passwordError}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="Toggle password visibility" onClick={toggleShowPassword}>
                      {values.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText style={{color: 'red'}} id="password-helper-text">{values.passwordHelper}</FormHelperText>
            </FormControl>
            { values.error && 
              <ErrorBox>
                <p> <span aria-label="Attention" role="img" >⚠️</span> {values.errorMsg}</p>
              </ErrorBox>
            }
            <SubmitButton type="submit">
              <p>Login</p>
            </SubmitButton>
          </Form>
          <Redirect>
            <p>Forgot your password ? <ResetButton onClick={handleOpen}>Reset via your email</ResetButton></p>
            <p>Not a member yet ? <Link to="/signup">Signup now</Link></p>
          </Redirect>
        </FormContainer>
      </LoginSection>
    </Hero>
  );
}
