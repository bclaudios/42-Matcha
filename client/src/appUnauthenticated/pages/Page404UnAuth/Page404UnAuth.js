import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Hero = styled.div`
  background-color: ${props => props.theme.color.purple};;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  background-color: ${props => props.theme.color.white};;
  height: 400px;
  width: 600px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const Message = styled.section`
  color: ${props => props.theme.color.textBlack};
  font-family: Roboto;
  text-align: center;
  h1 {
    font-weight: 500;
    font-size: 2em;
  }
`;

export default function Page404UnAuth() {

  return (
    <Hero>
      <Container>
        <Message>
          <h1>Sorry, this page isn't available</h1>
          <p>The link you followed may be broken, or are trying to acces a restricted area.</p>
          <Link to="/login">Login</Link> or <Link to="/signup">Signup</Link> to find your love.
        </Message>
      </Container>
    </Hero>
  );
}
