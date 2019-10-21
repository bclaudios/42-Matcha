import React from 'react';
import styled from 'styled-components';

const Logo = styled.section`
    margin-left: 10vw;
`;

export default function HeaderWide() {

    return (
        <Logo>
            <img src={'./logo_color.svg'} width="35px" height="35px" alt=""/>
        </Logo>
    );
}