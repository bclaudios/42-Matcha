import React, { useContext } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faSearch, faMapMarkedAlt, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import ProfileContext from '../../../../../contexts/ProfileContext';
import UsernameRow from './UsernameRow';
import TagChip from '../../../../../components/TagChip';
import { Menu, MenuItem, Button } from '@material-ui/core';


const StyledSection = styled.section `
    display:flex;
    flex:1;
    padding:1rem;

    align-items:center;
    justify-content:center;
    flex-direction:column;
`;

const Tags = styled.div `
    display:flex;
    margin-top:auto;
    flex-wrap:wrap;
    width:100%;
`;

const Biography = styled.div `
    margin-bottom:0.75rem;
    max-width:650px;
    font-style:italic;
    font-size:1.1rem;
    font-weight:300;
    overflow-wrap: break-word;
    hyphens:auto;
`;

const Infos = styled.div `
    display:flex;
    width:100%;
    margin-bottom:1rem;
    justify-content:center;
    align-items:center;
    color: ${props => props.theme.color.lightRed};
    @media (max-width: 600px) { 
        flex-direction:column;
        margin-top:1rem;
        margin-bottom:0;
    }
`;

export default function InfosSection() {
    const [anchorEl, setAnchorEl] = React.useState(null);
  
    function openMenu(event) { setAnchorEl(event.currentTarget); }
    function closeMenu() { setAnchorEl(null); }

    const profile = useContext(ProfileContext);
    const infosList = [
        { info: profile.age !== null ? `${profile.age} years old` : "", icon: faCalendarAlt },
        { info: profile.city, icon: faMapMarkedAlt },
        { info: profile.lookingFor, icon: faSearch }
    ]

    const InfoCase = (props) => {
        let info;
        if (props.info && props.icon === faSearch) {
            info = props.info.map(info => info.charAt(0).toUpperCase() + info.slice(1));
            info = info.join(' - ')
        }
        const StyledCase = styled.div `
            display:flex;
            flex:1;
            height:4rem;
            justify-content:center;
            align-items:center;
            @media (max-width: 600px) {
                margin-bottom:1rem;
            }
        `;
    
        const StyledIcon = styled(FontAwesomeIcon) `
            margin-right:1rem;
        `;
    
        const StyledSpan = styled.span `
            font-size:1.25rem;
            font-weight:bold;
        `;
    
        return (
            <StyledCase>
                <StyledIcon icon={props.icon} size={"2x"}/>
                <StyledSpan><strong>{props.icon === faSearch ? info : props.info}</strong></StyledSpan>
            </StyledCase>
        )      
    }
    
    return (
        <StyledSection>
            <UsernameRow/>
            <Infos>
                {infosList.map((info, index) => 
                    <InfoCase 
                        key={index} 
                        info={info.info}
                        icon={info.icon}
                    />
                )}
            </Infos>
            <Biography>
                {profile.bio && <span>"{profile.bio}"</span>}
            </Biography>
            <Tags>
                {profile.tags.map((tag, index)=> <TagChip tag={tag} key={index}/>)}
            </Tags>
            {!profile.account && 
                <div style={{width:'100%', display:'flex', flexDirection:'row-reverse'}}>
                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={openMenu} >
                        <FontAwesomeIcon icon={faEllipsisH} size={"lg"}/>
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={closeMenu}
                    >
                        <MenuItem onClick={profile.reportUser}>Report</MenuItem>
                        <MenuItem onClick={profile.blockUser}>Block</MenuItem>
                    </Menu>
                </div>
            }
        </StyledSection>
    )
}