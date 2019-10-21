import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Logo from './Logo';
import Burger from './Burger';
import NavList from './NavList';
import Notifications from './Notifications';
import LogoutButton from './LogoutButton';

const HeaderNarrow = styled.section`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    background-color: ${props => props.theme.color.purple};
    color: ${props => props.theme.color.white};
    @media (min-width: 1080px) {
        display: none;
    }
`;

const Dropdown = styled.section`
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 56px;
    right: 0;
    border-radius: 0px 0px 30px 30px;
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.theme.color.purple};
    z-index: 99;
    padding: 20px 10vw;
    li {
        margin-bottom: 30px;
        text-align: right;
    }
    ul {
        margin: 0;
    }
    @media (min-width: 1080px) {
        display: none;
    }
`;

const NotificationsSection = styled.section`
    position: relative;
`;

export default function HeaderWide() {
    const node = useRef();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (menuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        } else {
        document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleClickOutside = e => {
        if (node.current.contains(e.target)) return;
        setMenuOpen(false);
    };

    return (
        <React.Fragment>
            <HeaderNarrow>
                <Logo />
                <Burger toggleMenu={toggleMenu}/>
            </HeaderNarrow>
            { menuOpen && 
                <Dropdown ref={node}>
                    <ul>
                        <li style={{listStyle: 'none'}}>
                            <NotificationsSection>
                                <Notifications />
                            </NotificationsSection>
                        </li>
                    </ul>
                    <NavList />
                    <LogoutButton />
                </Dropdown> 
            }
        </React.Fragment>
    );
}