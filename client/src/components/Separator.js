import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StyledDiv = styled.div `
    display:flex;
    width:100%;
    margin-bottom:0.75rem;
    
    justify-content:center;
    align-items:center;
`

const Line = styled.div `
    flex:1;
    height:1px;

    border-top:1px solid white;
`


const StyledIcon = styled(FontAwesomeIcon) `
    padding:0 0.5rem;

    color:white;
`

export default function Separator(props) {
    return (
        <StyledDiv>
            <Line color={props.color}/>
                <StyledIcon icon={props.icon} size={props.size} color={props.color}/>
            <Line color={props.color}/>
        </StyledDiv>
    )
}