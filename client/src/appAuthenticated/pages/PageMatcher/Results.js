import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import UserCard from '../../../components/UserCard';
import CircleButton from '../../../components/CircleButton';
import styled from 'styled-components'
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Results = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;
`;
const NextButtonSection = styled.section`
    z-index: 9;
    @media (max-width: 1080px) {
        transform: translate(60px);
    }
`;
const CardSection = styled.section`
    z-index: 0;
`;
const LikeButtonSection = styled.section`
    z-index: 9;
    @media (max-width: 1080px) {
        transform: translate(-60px);
    }
`;

export default function ResultsComp({ usersIndex, handleLikeDislike, user, hasNoMore }) {
    
    return (
        <Results>
        {!hasNoMore &&
            <Fragment>
                <NextButtonSection>
                    <CircleButton
                        choice={'disliked'}
                        handleLikeDislike={handleLikeDislike}
                        circle_color={'gray'}
                        icon_color={'white'}
                        fa_icon={faTimes}
                    />
                </NextButtonSection>
                    <CardSection>
                        <Link 
                            to={`/profile/${user.username}`}
                            style={{textDecoration: 'none'}}
                        >
                            <UserCard 
                                user={user}
                                width={350}
                                height={525}
                            />
                        </Link>
                    </CardSection>
                <LikeButtonSection>
                    <CircleButton
                        choice={'liked'}
                        handleLikeDislike={handleLikeDislike}
                        circle_color={'#FF0041'}
                        icon_color={'white'}
                        fa_icon={faHeart}
                    />
                </LikeButtonSection>
            </Fragment>
        }
        {hasNoMore && 
            <p>No more suggestion...</p>
        }
        </Results>
    );
}
