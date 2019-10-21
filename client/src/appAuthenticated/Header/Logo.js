import React from 'react';
import styled from 'styled-components';
import { Image } from 'cloudinary-react';

const Logo = styled.section`
    margin-left: 10vw;
`;

export default function HeaderWide() {

    return (
        <Logo>
            <Image cloudName='matchacn' publicId="MainLogo" width="35px" height="35px" alt=""/>
        </Logo>
    );
}