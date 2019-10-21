import React from 'react';
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Results({ circle_color, icon_color, fa_icon, choice, handleLikeDislike }) {

  const Circle = styled.div`
    background-color: ${circle_color};
    height: 80px;
    width: 80px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    cursor: pointer;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    @media (max-width: 630px) {
      height: 50px;
      width: 50px;
      font-size: 20px;
    }
  `;

  return (
    <Circle
      onClick={() => handleLikeDislike(choice)}
    >
        <FontAwesomeIcon style={{marginTop: '5px', color: `${icon_color}`}} icon={fa_icon}/>
    </Circle>
  );
}





