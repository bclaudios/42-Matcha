import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.section `
    margin: auto;
    max-width: ${props => props.width || '1000px'};
`

const Container = (props) => {
    return (
        <StyledContainer width={props.width}>
            {props.children}
        </StyledContainer>
    )
}

export default Container;