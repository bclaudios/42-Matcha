import React from 'react';
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Spinner = styled.p`
  font-size: 50px;
  text-align: center;
  color: ${props => props.theme.color.purple};
  @keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
  }
`;

export default function SpinnerComp() {
  return (
    <Spinner>
      <FontAwesomeIcon style={{animation: `spin 1s linear infinite`}} icon={faSpinner}/>
    </Spinner>
  );
}
