import React, { Fragment } from 'react';
import styled from 'styled-components';
import AvatarSection from './AvatarSection';
import InfosSection from './InfosSection/InfosSection';
import SpinnerComp from '../../../../components/Spinner';

const StyledCard = styled.section `
    display:flex;

    min-height:375px;
    max-width:1000px;
    width:100%;
    justify-content:${props => props.isLoading ? "center" : ""};
    align-items:${props => props.isLoading ? "center" : ""};

    border-radius: ${props => props.theme.borderRadius};
    background-color: ${props => props.theme.color.background};
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
    @media (max-width: 1000px) { border-radius: 0px; }
    @media (max-width: 700px) { flex-direction:column; }
`

export default function ProfileCard(props) {
    return (
        <StyledCard isLoading={props.isLoading}>
            {props.isLoading ? 
            <SpinnerComp/> :
            <Fragment>
                <AvatarSection/>
                <InfosSection/>
            </Fragment>
            }
        </StyledCard>
    )
}