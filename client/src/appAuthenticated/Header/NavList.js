import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavList = styled.ul`
    display: flex;
    justify-content: space-between;
    li {
        list-style: none;
        padding-bottom: 5px;
    }
    a {
        text-decoration: none;
        color: ${props => props.theme.color.white};
        font-family: Roboto;
        font-style: normal;
        font-weight: 500;
    }
    @media (max-width: 1080px) {
        flex-direction: column;
        align-items: flex-end;
        li {
            margin-bottom: 30px;
        }
    }
`;

export default function Navlist() {

    return (
        <NavList>
            <li>
                <Link to="/search">
                    Search
                </Link>
            </li>
            <li>
                <Link  to="/matcher">
                    Matcher
                </Link>
            </li>
            <li>
                <Link  to="/profile">
                    Profile
                </Link>
            </li>
        </NavList>
    );
}