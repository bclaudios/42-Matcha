import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Logo from '../../../components/Logo';

const Body = styled.section`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.section`
  padding: 0 10vw;
  display: flex;
  background-color: ${props => props.theme.color.purple};
  height: 100vh;
  color: ${props => props.theme.color.white};
  h1 {
    font-family: 'Arbutus Slab', serif;
    margin: 0;
    margin-bottom: 30px;
  };
  p {
    font-family: 'Open Sans', sans-serif;
    margin-bottom: 100px;
  };
  @media screen and (min-width: 320px) {
    h1 {
      font-size: calc(70px + 6 * ((100vw - 320px) / 680));
    }
  }
  @media screen and (min-width: 1000px) {
    h1 {
      font-size: 100px;
    }
  }
  flex: 1 0 auto;
`;
const TextWrapper = styled.section`
  margin: 0;
  padding: 10vw;
  padding-right: 0;
  background-color: ${props => props.theme.color.purple};
  flex: 1 1;
`;
const PhotoWrapper = styled.section`
  background-color: ${props => props.theme.color.purple};
  flex: 1 2;
  @media (max-width: 1500px) {
    display: none;
  }
  img {
    width: 100%;
    margin: 0 auto;
  }
`;
const CTA = styled(Link)`
  text-decoration: none;
  display: block;
  margin: 0;
  margin-left: 8vw;
  background-color: ${props => props.theme.color.red};
  padding: 20px 0;
  width: 250px;
  height: 20px;
  text-align: center;
  border-radius: 100px;
  color: ${props => props.theme.color.white};
  box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.23);
  font-family: 'Roboto', sans-serif;
  transition: box-shadow 0.5s ease-in-out;
  &:hover {
    transition: box-shadow 0.5s ease-in-out;
    box-shadow: none;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  background-color: ${props => props.theme.color.purple};
  color: ${props => props.theme.color.white};
`;
const LoginButton = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 10px;
  padding: 15px;
  margin-right: 10vw;
  border: solid 0.5px rgba(255, 255, 255, 0.56);
  border-radius: 10px;
  text-align: center;
  font-family: 'Roboto', sans-serif;
  color: rgba(255, 255, 255, 0.56);
  text-decoration: none;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  &:hover {
      transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
      background-color: ${props => props.theme.color.white};
      color: ${props => props.theme.color.purple};
  }
`;

const PageHome = () => (
  <Fragment>
    <Header>
      <Logo />
      <LoginButton to='/login'>Login</LoginButton>
    </Header>
    <Body>
      <Wrapper>
        <TextWrapper>
          <h1>Go get <br/>some love.</h1>
          <p>Matcha lets you find the perfect match for your life.<br/> 
          Unlike any other dating app we don’t use any fancy technology.<br/>
          Just some Node.js with Express and React.<br/>
          This is a school project made by students at @42born2code<br/>
          And yes we stole the Facebook Dating logo.</p>
          <CTA to='/signup'>Start Dating</CTA>
        </TextWrapper>
        <PhotoWrapper>
          <img src={'./home_photo.png'} alt="A couple having fun"/>
        </PhotoWrapper>
      </Wrapper>
    </Body>
  </Fragment>
);

export default PageHome;