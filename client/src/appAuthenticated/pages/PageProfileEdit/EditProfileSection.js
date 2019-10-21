import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import Separator from '../../../components/Separator';
import { faPencilAlt, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { TextField } from '@material-ui/core';
import ProfileContext from '../../../contexts/ProfileContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TagChip from '../../../components/TagChip';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import AlgoliaPlaces from 'algolia-places-react';
import { Redirect } from 'react-router-dom';

const StyledSection = styled.section `
    display:flex;
    padding:1rem;
    height:700px;
    width:100%;

    align-items:center;
    flex-direction:column;
    border-radius:0 ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} 0;

    @media (max-width: 1000px) { 
        border-radius:0;
        height:800px;
    }
    background-color:#2b2c2e;
`

const StyledTextField = styled(TextField) `
    label {
        color:${props => props.theme.color.lightRed};
        font-size:1.25rem;
        font-weight:bold;
    }
    div {
        color:white;
        height:100%;
        option {
            color:#2b2c2e;
            background-color:black;
        }
    }
    svg { color: ${props => props.theme.color.lightRed}; }
    p { color: ${props => props.theme.color.lightRed};}
`

const GridForm = styled.form `
    width:100%;
    display:grid;
    grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows:3.5rem 3.5rem 3.5rem auto 8rem 10rem auto;
    grid-template-areas:
    "firstName firstName firstName lastName lastName lastName"
    "birthDate birthDate location location location location"
    "gender gender orientation orientation . ."
    "biography biography biography biography biography biography"
    "tagSelect tagSelect tagSelect tagSelect tagSelect tagSelect"
    ". cancelButton cancelButton submitButton submitButton .";
    grid-column-gap: 1rem;
    grid-row-gap: 2rem;
    /* @media (max-width: 1000px) {
        grid-template-areas:
        "firstName"
        "lastName"
        "birthDate"
        "location"
        "gender"
        "orientation"
        "biography"
        "tagSelect"
        "submitButton"
        "cancelButton";
    } */
`

const FirstNameTextField = styled(StyledTextField) `grid-area:firstName;`
const LastNameTextField = styled(StyledTextField) `grid-area:lastName;`
const GenderTextField = styled(StyledTextField) `grid-area:gender;`
const OrientationTextField = styled(StyledTextField) `grid-area:orientation;`
const BirthDateTextField = styled(StyledTextField) `grid-area:birthDate;`
const BiographyTextField = styled(StyledTextField) `
    grid-area:biography;
    margin:0;
`

const TagsContainer = styled.div `
    display:flex;
    flex-direction:row;
    flex-wrap:wrap;
    margin-top:1rem;
`

const StyledButton = styled.div `
    box-sizing:border-box;
    display:flex;
    justify-content:center;
    align-items:center;
    border-radius:5px;
    font-weight:bold;
    height:100%;
    width:100%;
    :hover {
        cursor:pointer;
    }
`

const SubmitButton = styled(StyledButton) `
    grid-area:submitButton;
    background-color:${props => props.theme.color.purple};
    color:#2b2c2e;
    height:2rem;
    :hover {
        border:2px solid ${props => props.theme.color.purple};
        color:${props => props.theme.color.purple};
        background-color:#2b2c2e;
    }
    @media (max-width: 1000px) { 
        margin-top:4rem;
    }
`

const CancelButton = styled(StyledButton) `
    grid-area:cancelButton;
    border:2px solid ${props => props.theme.color.purple};
    color:${props => props.theme.color.purple};
    height:2rem;
    @media (max-width: 1000px) { 
        margin-top:4rem;
    }
`

const StyledAlgoliaPlaces = styled(AlgoliaPlaces) `
    background-color:#2b2c2e;
    color:#ffffff;
    border-color:#212223;
    width:100%;
`

const AlgoliaContainer = styled.div `
    grid-area:location;
`

const TagSelectContainer = styled.div `
    grid-area:tagSelect;
`

const StyledTagLabel = styled.label `
    font-size:0.9rem;
    margin-left:0.75rem;
    color:${props => props.theme.color.lightRed};
    font-weight:bold;
`

const StyledCreatableSelect = styled(CreatableSelect) `
    margin-top:0.25rem;
    div {
        color:white;
        border-color:#212223;
        background-color:#2b2c2e;
        div {
            background-color:#2b2c2e;
        }
    }
`

export default function InfosSection(props) {
const authToken = localStorage.getItem('token');

    
    const profile = useContext(ProfileContext);
    const [valueState, setValueState] = useState({
        gender: "male",
        orientation: "straight",
        ...profile,
        newTag: "",
        redirect: false,
    })
    
    const [errorState, setErrorState] = useState({});

    const [editedValuesState, setEditedValueState] = useState({});
    const [redirect, setRedirect] = useState(false);
    
    const [tagsList, setTagsList] = useState([]);
    const Tags = valueState.tags && valueState.tags.map((tag, index) => <TagChip deletable={true} tag={tag} key={index} index={index} onDelete={deleteTag}/>)
    useEffect(() => {
        let isSubscribed = true;
        const fetchTagData = async () => {
            const tags = await axios.get(`/tags?authToken=${authToken}`);
            const filteredTags = valueState.tags && tags.data.tags.filter(tag => !valueState.tags.includes(tag.label));
            if (filteredTags && isSubscribed) setTagsList([...filteredTags]);
        }
        if (authToken) fetchTagData();
        return () => isSubscribed = false;
    }, [authToken, valueState.tags]);
    
    async function fetchTagsList() {
        const tags = await axios.get(`/tags?authToken=${authToken}`);
        const filteredTags = valueState.tags && tags.data.tags.filter(tag => !valueState.tags.includes(tag.label));
        if (filteredTags) setTagsList([...filteredTags]);
    }

    function handleValueChange(event) {
        const {name, value} = event.target;
        console.log(value);
        if (!valueIsValid(name, value)) {
            displayErrorText(name);
        } else {
            const newErrorState = {...errorState};
            delete newErrorState[`${name}Error`];
            delete newErrorState[`${name}Helper`];
            setErrorState({ ...newErrorState });
        }
        if (name === "bio") {
            if (valueState.bio.length < 300 && value.length < 300 && value.search('\n') === -1) {
                setValueState({ ...valueState, bio: value })
                setEditedValueState({ ...editedValuesState, bio: value })
            } else {
                setErrorState({ ...errorState, 
                    [`bioError`]: true})
            }
        } else {
            setValueState({ ...valueState, [name]: value });
            setEditedValueState({ ...editedValuesState, [name]: value });
        }
    };

    const handleLatlngChange = ({ suggestion }) => {
        setValueState({
            ...valueState,
            latLng: [suggestion.latlng.lat, suggestion.latlng.lng],
            city: suggestion.city,
        });
        setEditedValueState({
            ...editedValuesState,
            latLng: [suggestion.latlng.lat, suggestion.latlng.lng],
            city: suggestion.city,
        })
    };

    
    const valueIsValid = (name, value) => {
        if (name === "birthDate") {
            const newBirthDate = new Date(value);
            const maxBirthDate = new Date().setFullYear(new Date().getFullYear() - 18);
            const minBirthDate = new Date().setFullYear(new Date().getFullYear() - 50);
            if (newBirthDate > maxBirthDate || newBirthDate < minBirthDate || value === "")
                return false
        }
        const regex = {
          firstName: /^[A-Za-zÀ-ÖØ-öø-ÿ-]{3,15}$/,
          lastName: /^[A-Za-zÀ-ÖØ-öø-ÿ-]{3,15}$/,
        };
        return (!regex[name] || regex[name].test(String(value)));
    };
    
    const displayErrorText = name => {
        const errorMessage = {
            firstName: 'Between 3 and 15 characters, only letters and "-".',
            lastName: 'Between 3 and 15 characters, only letters and "-".',
            birthDate: 'Between 18 and 50 years old.',
        };
        setErrorState({
            ...errorState,
            [`${name}Error`]: true,
            [`${name}Helper`]: errorMessage[name],
        }) 
    }

    async function createTag(tag) {
        if (!valueState.tags.includes(tag)) {
            await axios.post(`/tags/create?authToken=${authToken}`, {tag})
            addTag({label: tag});
        }
    }
    
    async function addTag(newValue) {
        const tag = newValue.label;
        if (!valueState.tags.includes(tag) && valueState.tags.length < 8) {
            await axios.post(`/users/addTag?authToken=${authToken}`, {tag});
            const newTagsList = valueState.tags
            newTagsList.push(tag);
            setValueState({
                ...valueState,
                tags: newTagsList,
                newTag: ""
            })
            fetchTagsList();
        }
    }

    async function deleteTag(tagIndex) {
        const params = {data: {tag: valueState.tags[tagIndex]}};
        await axios.delete(`/users/removeTag?authToken=${authToken}`, params);
        const newTagsList = valueState.tags;
        newTagsList.splice(tagIndex, 1);
        setValueState({
            ...valueState,
            tags: newTagsList
        })
        fetchTagsList();
    }

    const SubmitChanges = async () => {
        console.log(Object.keys(errorState).length)
        if (Object.keys(editedValuesState).length > 0 && Object.keys(errorState).length === 0) {
            const gender = editedValuesState.gender || valueState.gender;
            if (Object.keys(editedValuesState).includes('gender')) {
                if (gender === "non-binary") { editedValuesState.lookingFor = ["non-binary"] }
            }
            if (Object.keys(editedValuesState).includes('orientation')) {
                if (editedValuesState.orientation === "homosexual") {
                    editedValuesState.lookingFor = [gender];
                }
                if (editedValuesState.orientation === "straight") {
                    if (gender === "female") editedValuesState.lookingFor = ["male"];
                    if (gender === "male") editedValuesState.lookingFor = ["female"];
                }
                if (editedValuesState.orientation === "bisexual") {
                    editedValuesState.lookingFor = ["female", "male"];
                }
            }
            if (Object.keys(editedValuesState).includes('gender') ||
                Object.keys(editedValuesState).includes('birthDate') ||
                Object.keys(editedValuesState).includes('orientation')) {
                const confirm = window.confirm('Changing your gender/birthdate/orientation will erase all your relationships.\n\nAre you sure?')
                if (confirm) {
                    const res = await axios.post(`/users/updateProfile?authToken=${authToken}`, editedValuesState);
                    if (res.status === 200) setRedirect(true)
                } else { setRedirect(true) }
            } else {
                const res = await axios.post(`/users/updateProfile?authToken=${authToken}`, editedValuesState);
                if (res.status === 200) setRedirect(true)
            }
        } else { 
            if (Object.keys(errorState).length === 0 ) setRedirect(true) 
        }
    }

    function handleInputChange(value) {
        if (value.length < 15) {
            setValueState({
                ...valueState,
                newTag: value,
            })
        }
    }
        
    return (
        <StyledSection>
            <Separator icon={faPencilAlt} size={"lg"}/>
            <GridForm>
                <GenderTextField
                    select
                    label="Gender"
                    name="gender"
                    SelectProps={{
                        native: true,
                    }}
                    value={valueState.gender}
                    onChange={handleValueChange}
                    variant="outlined"
                >
                    <option value="male">Man</option>
                    <option value="female">Woman</option>
                    <option value="non-binary">Non-binary</option>
                </GenderTextField>
                <FirstNameTextField
                    label="First Name"
                    name="firstName"
                    value={valueState.firstName}
                    onChange={handleValueChange}
                    error={errorState.firstNameError}
                    helperText={errorState.firstNameHelper}
                    variant="outlined"
                />
                <LastNameTextField
                    label="Last Name"
                    name="lastName"
                    value={valueState.lastName}
                    onChange={handleValueChange}
                    error={errorState.lastNameError}
                    helperText={errorState.lastNameHelper}
                    variant="outlined"
                />
                <AlgoliaContainer>
                    <StyledAlgoliaPlaces
                        placeholder='Search a city here'
                        options={{
                            appId: 'plGGWNJECAIH',
                            apiKey: 'ecb0baaa5b936ebb8dcc52e94b0b3b75',
                            language: 'fr',
                            countries: ['fr'],
                            type: 'address',
                        }}
                        onChange={handleLatlngChange}
                        defaultValue={profile.city}
                    />
                </AlgoliaContainer>
                <BirthDateTextField
                    label="Birth Date"
                    name="birthDate"
                    type="date"
                    defaultValue={profile.birthDate}
                    onChange={handleValueChange}
                    error={errorState.birthDateError}
                    helperText={errorState.birthDateHelper}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                />
                <OrientationTextField
                    select
                    label="Orientation"
                    name="orientation"
                    SelectProps={{
                        native: true,
                    }}
                    value={valueState.orientation}
                    onChange={handleValueChange}
                    variant="outlined"
                >
                    <option value="straight">Straight</option>
                    <option value="homosexual">Homosexuel</option>
                    <option value="bisexual">Bisexual</option>
                </OrientationTextField>
                <BiographyTextField
                    label="Biography"
                    name="bio"
                    multiline
                    value={valueState.bio}
                    onChange={handleValueChange}
                    helperText="250 charaters max."
                    fullWidth
                    variant="outlined"
                    error={errorState.bioError}
                />
                <TagSelectContainer>
                    <StyledTagLabel>Add a hashtag</StyledTagLabel>
                    <StyledCreatableSelect
                        label="Tags"
                        value={valueState.newTag}
                        inputValue={valueState.newTag}
                        options={tagsList}
                        onChange={addTag}
                        onInputChange={handleInputChange}
                        onCreateOption={createTag}
                        styles={{
                            placeholder: (provided, state) => ({
                                display: state.isFocused ? "none" : "inherit",
                            })
                        }}
                        placeholder="#myTag..."
                    />
                    <TagsContainer>{Tags}</TagsContainer>
                </TagSelectContainer>
                <CancelButton onClick={SubmitChanges}><FontAwesomeIcon icon={faTimes} size={'lg'}/></CancelButton>
                <SubmitButton onClick={SubmitChanges}><FontAwesomeIcon icon={faCheck} size={'lg'}/></SubmitButton>
            </GridForm>
            {redirect && <Redirect to='/profile'/>}
        </StyledSection>
    )
}