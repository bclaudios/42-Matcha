import React from 'react';
import styled from 'styled-components';

const Dot = styled.div`
    position: absolute;
    top: -10px;
    right: -10px;
    width: 25px;
    height: 25px;
    background-color: ${props => props.theme.color.red};
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default function NotificationDot(props) {
    return (
        <Dot>
            <p style={{fontWeight: 900, fontSize: '10px', color: 'white'}}>{props.nb}</p>
        </Dot>
    );
}