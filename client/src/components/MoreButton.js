import React from 'react';
import styled from 'styled-components';

export default function MoreButton({ handleClickMoreButton }) {

    const MoreButton = styled.button`
        display: inline-block;
        max-width: 200px;
        margin: 50px auto;
        padding: 8px 10px;
        border: solid 0.5px #AE86FF;
        border-radius: 10px;
        background-color: ${props => props.theme.color.purple};
        color: ${props => props.theme.color.lightPurple};
        font-size: 1rem;
        cursor: pointer;
        text-decoration: none;
        transition: background 250ms ease-in-out, 
                    transform 150ms ease;
        -webkit-appearance: none;
        -moz-appearance: none;
        &:hover,
        &:focus {
            background: white;
            color: ${props => props.theme.color.purple};
        }
        &:focus {
            outline: 1px solid #fff;
            outline-offset: -4px;
        }
        &:active {
            transform: scale(0.99);
        }
        p {
            margin: 0;
        }
    `;

    return (
        <MoreButton
            onClick={handleClickMoreButton}
        >
            <p>Load More</p>
        </MoreButton>
    );
}