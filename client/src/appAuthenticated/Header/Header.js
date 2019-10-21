import React from 'react';
import HeaderWide from './HeaderWide';
import HeaderNarrow from './HeaderNarrow';

export default function Header() {

    return (
        <header>
            <HeaderWide />
            <HeaderNarrow />
        </header>
    );
}