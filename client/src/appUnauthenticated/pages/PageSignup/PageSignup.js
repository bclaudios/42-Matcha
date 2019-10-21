import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';

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
  box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
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


export default function PageSignup(props) {

  const [values, setValues] = useState({
    showPassword: false,
    email: null,
    firstName: null,
    lastName: null,
    username: null,
    password: null,
    emailError: false,
    firstNameError: false,
    lastNameError: false,
    usernameError: false,
    passwordError: false,
    emailHelper: null,
    firstNameHelper: null,
    lastNameHelper: null,
    passwordHelper: null,
    usernameHelper: null,
  });

  const valueIsOk = (name, value) => {
    const regex = {
      email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      firstName: /^[A-Za-zÀ-ÖØ-öø-ÿ-]{3,15}$/,
      lastName: /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,15}$/,
      username: /^[A-Za-zÀ-ÖØ-öø-ÿ]{5,10}$/,
      password: /^(?:(?=.*?[A-Z])(?:(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=])|(?=.*?[a-z])(?:(?=.*?[0-9])|(?=.*?[-!@#$%^&*()_[\]{},.<>+=])))|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=]))[A-Za-z0-9!@#$%^&*()_[\]{},.<>+=-]{6,50}$/,
    };
    return regex[name].test(String(value));
  };

  const valueError = nameArr => {    
    const errorMsg = {
      email: 'Enter a proper email',
      firstName: 'Between 3 and 15 characters, only letters and "-"',
      lastName: 'Between 3 and 15 characters, only letters',
      username: 'Between 6 and 10 characters, only letters',
      password: 'Minimum 6 characters, at least three of those four categories: uppercase, lowercase, number and special character',
    };
    const stateArr = nameArr.map(name => {return { [name]: null, [`${name+'Error'}`]: true, [`${name+'Helper'}`]: errorMsg[name] }});
    const state = stateArr.reduce((acc, curr) => {
      acc = {...acc, ...curr};
      return acc;
    }, {});
    setValues({ ...values, ...state });
  };

  const valueIsTaken = nameArr => {
    const stateArr = nameArr.map(name => {return { [name]: null, [`${name+'Error'}`]: true, [`${name+'Helper'}`]: `This ${name} is already used` }});
    const state = stateArr.reduce((acc, curr) => {
      acc = {...acc, ...curr};
      return acc;
    }, {});
    setValues({ ...values, ...state });
  };

  const valueIsSet = (name, value) => {
    setValues({ ...values, [name]: value, [`${name+'Error'}`]: false, [`${name+'Helper'}`]: null });
  };

  const handleBlur = name => event => {
    if (valueIsOk(name, event.target.value)) {
      valueIsSet(name, event.target.value)
    } else {
      valueError([name]);
    }
  };

  const handleChange = name => event => {
    if (valueIsOk(name, event.target.value)) valueIsSet(name, event.target.value);
  };

  const toggleShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      const res = await axios.get(`http://ip-api.com/json`);
      const newUser = { 
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        password: values.password,
        city: res.data.city,
        latLng: [res.data.lat, res.data.lon],
      };
      const emptyFields = Object.keys(newUser).filter(key => !newUser[key]);
      if (emptyFields.length === 0) {
        axios.post(`/users/create`, newUser)
          .then(res => { if (res.status === 200) props.history.push('/login'); })
          .catch(error => {
            const res = error.response.data;
            if (res.errors.length !== 0) valueError(res.errors);
            if (res.taken.length !== 0) valueIsTaken(res.taken);
          });
      } else {
        valueError(emptyFields);
      }
    } catch(error) {console.log(error);}
  }

  return (
    <Hero>
      <LoginSection>
        <FormContainer>
          <h1>Signup</h1>
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              id="standard-email"
              label="Email"
              required={true}
              onBlur={handleBlur('email')}
              onChange={handleChange('email')}
              error={values.emailError}
              helperText={values.emailHelper}
              margin="normal"
            />
            <TextField
              id="standard-firstName"
              label="First Name"
              required={true}
              onBlur={handleBlur('firstName')}
              onChange={handleChange('firstName')}
              error={values.firstNameError}
              helperText={values.firstNameHelper}
              margin="normal"
            />
            <TextField
              id="standard-lastName"
              label="Last Name"
              required={true}
              onBlur={handleBlur('lastName')}
              onChange={handleChange('lastName')}
              error={values.lastNameError}
              helperText={values.lastNameHelper}
              margin="normal"
            />
            <TextField
              id="standard-username"
              label="Username"
              required={true}
              onBlur={handleBlur('username')}
              onChange={handleChange('username')}
              error={values.usernameError}
              helperText={values.usernameHelper}
              margin="normal"
            />
            <FormControl required={true}>
              <InputLabel htmlFor="adornment-password">Password</InputLabel>
              <Input
                id="standard-password"
                type={values.showPassword ? 'text' : 'password'}
                onBlur={handleBlur('password')}
                onChange={handleChange('password')}
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
            <SubmitButton type="submit">
              <p>Signup</p>
            </SubmitButton>
          </Form>
          <Redirect>
            <p>Already a member ? <Link to="/login">Login here</Link></p>
          </Redirect>
        </FormContainer>
      </LoginSection>
    </Hero>
  );
}
