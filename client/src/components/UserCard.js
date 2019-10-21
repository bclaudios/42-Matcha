import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFireAlt } from '@fortawesome/free-solid-svg-icons';
import cloudinary from 'cloudinary-core';
const cloudinaryCore = new cloudinary.Cloudinary({cloud_name: 'matchacn'});

const UserCard = styled.div`
  background-image: url(${props => props.avatar});
  background-size: cover;
  background-position: center center;
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  margin: 20px;
  display: flex;
  align-items: flex-end;
  border-radius: 20px;
  background-color: lightgrey;
  position: relative;
  z-index: 5;
  @media (max-width: 630px) {
    width: 200px;
    height: 300px;
  }
`;
const UserInfos = styled.div`
  background-color: ${props => props.theme.color.white};
  margin: 0 auto;
  height: 100px;
  width: 80%;
  border-radius: 15px;
  padding: 1em;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  top: 20px;
  overflow: hidden;
`;
const Tags = styled.div`
  display: flex;
  scrollbar-width: none;
  overflow-y: scroll;
`;
const Tag = styled.p`
  background-color: ${props => props.theme.color.lightPurple};
  color: ${props => props.theme.color.purple};
  border-radius: 10px;
  padding: 5px;
  margin: 3px 5px 0 0;
`;
const Username = styled.p`
  font-size: 1.5em;
  margin: 0;
  color: ${props => props.theme.color.textBlack};
  font-family: Roboto;
  font-weight: 500px;
`;
const Score = styled.p`
  color: ${props => props.theme.color.textBlack};
  font-family: Roboto;
  font-weight: 500px;
  text-transform: capitalize;
  font-size: 0.8em;
`;

export default function UserCardComp({ user, width, height }) {

  return (
    <UserCard
      avatar={cloudinaryCore.url(user.photo)}
      width={width} 
      height={height} 
    >
      <UserInfos>
        <Username>{user.username}</Username>
        <Score><FontAwesomeIcon 
          style={{marginRight: '8px'}} 
          icon={faMapMarkerAlt}/>
            {user.city} 
          <FontAwesomeIcon 
            style={{margin: '0 8px 0 15px'}} 
            icon={faFireAlt}
          />{user.score}</Score>
        <Tags>
          {user.tags.map( (tag, index) =>
            <Tag
              key={index}
            >
              #{tag}
            </Tag>
          )}
        </Tags>
      </UserInfos> 
    </UserCard>
  );
}