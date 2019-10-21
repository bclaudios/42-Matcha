import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const IncompleteProfile = styled.section`
    display: flex;
    justify-content: center;
`;
const Container = styled.section`
  flex-basis: 400px;
  padding: 50px;
  padding-top: 10px;
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
  a {
    text-decoration: none;
    color: black;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    text-decoration: underline;
}
`;

export default function IncompleteProfileComponent({ missingProfileFields }) {
    return (
        <IncompleteProfile>
            <Container>
                <h1>Hold on...</h1>
                <p>You need to fill those fields before seeing the results :</p>
                <ul>
                {missingProfileFields.map((missingField, index) => 
                    <li
                        key={index}
                    >{missingField}</li>
                )}
                </ul>
                <p><span aria-label="Check-this" role="img" >👉</span> Go to your <Link to="/profile">profile</Link></p>
            </Container>
        </IncompleteProfile>
    );
};