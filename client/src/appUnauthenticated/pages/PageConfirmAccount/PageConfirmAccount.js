import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const Hero = styled.section`
  background-color: ${props => props.theme.color.purple};
  height: 100vh;
`;
const Section = styled.section`
  display: flex;
  justify-content: center;
  padding-top: 10%;
`;
const Container = styled.section`
  flex-basis: 400px;
  padding: 50px;
  background-color: ${props => props.theme.color.white};
  border-radius: 20px;
  box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
  color: ${props => props.theme.color.textBlack};
  h1 {
    font-size: 2rem;
    text-align: center;
    font-family: Roboto;
    color: ${props => props.theme.color.textBlack};
  }
`;
const Redirect = styled.section`
  color: black;
  font-weight: 500;
  text-align: center;
  a {
    text-decoration: none;
    color: black;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    text-decoration: underline;
}
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


export default function PageConfirmAccount(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(true);

    useEffect(() => {
      let isSubscribed = true;
        async function fetchData() {
            try {
                await axios.post('/users/confirmation', {hash: props.match.params.hash});
                if (isSubscribed) setIsError(false);
            } catch(error) {}
            if (isSubscribed) setIsLoading(false);
        }
        fetchData();
        return () =>isSubscribed = false;
    }, [props.match.params.hash]);

    return (
        <Hero>
            <Section>
                <Container>
                {!isLoading && isError && 
                  <Fragment>
                    <h1>Sorry but...</h1>
                    <ErrorBox>
                      <p> <span aria-label="Attention" role="img" >⚠️</span> the link you provided is not working, please try again.</p>
                    </ErrorBox>
                  </Fragment>
                }
                {!isLoading && !isError &&
                  <Fragment>
                    <h1>Welcome to Matcha ! <span aria-label="Congratulations" role="img" >🎉</span></h1>
                    <Redirect>
                        <p>Your account is now confirmed.</p>
                        <p><span aria-label="Check-this" role="img" >👉</span> wanna <Link to="/login">login</Link> ?</p>
                    </Redirect>
                  </Fragment>
                }
                </Container>
            </Section>
        </Hero>
    );
}