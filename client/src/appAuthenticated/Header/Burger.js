import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';


export default function HeaderWide({toggleMenu}) {

    const Burger = styled.section`
        margin-right: 10vw;
    `;

    return (
        <Burger>
            <FontAwesomeIcon onClick={toggleMenu} style={{fontSize: '25px', cursor: 'pointer'}} icon={faBars}/>
        </Burger>
    );
}