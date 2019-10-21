import React from "react";
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faHashtag } from "@fortawesome/free-solid-svg-icons";

const StyledDiv = styled.div `
    display:flex;
    height:1.5rem;
    margin-right:1rem;
    margin-bottom:0.5rem;

    align-items:center;
    
    font-size:0.8125rem;
    color:${props => props.theme.color.lightRed};
    border:1px solid ${props => props.theme.color.lightRed};
    border-radius:1000px;
    background-color:${props => props.deletable ? "transparent" : "#ffc1cb"};
`

const HashtagContainer = styled.div `
    display:flex;
    margin-left:0.5rem;
    height:1.5rem;

    justify-content:center;
    align-items:center;

    border-radius:1000px;
`

const TagContainer = styled.div `
    padding:0 0.5rem 0 0.25rem;
    
    font-weight:bold;
`


const DeleteContainer = styled.div `
    display:flex;
    width:1.5rem;
    height:1.5rem;

    justify-content:center;
    align-items:center;
    
    border-radius:1000px;
    background-color:${props => props.theme.color.lightRed};
    :hover { cursor:pointer; }
`

const StyledDeleteIcon = styled(FontAwesomeIcon) `
    color:#2b2c2e;
`

export default function TagChip(props) {
    return (
        <StyledDiv deletable={props.deletable}>
            <HashtagContainer>
                <FontAwesomeIcon icon={faHashtag} size={"1x"}/>
            </HashtagContainer>
            <TagContainer>
            {props.tag}
            </TagContainer>
            {props.deletable &&
            <DeleteContainer onClick={() => props.onDelete(props.index)}>
                <StyledDeleteIcon icon={faTimes} size={"sm"}/>
            </DeleteContainer>
            }
        </StyledDiv>
    )
}