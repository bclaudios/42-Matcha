import React from 'react';
import styled from 'styled-components';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
import AlgoliaPlaces from 'algolia-places-react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Filtering = styled.aside`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 500px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    font-family: Roboto;
    border-radius: 30px;
    padding: 3em;
    background-color: ${props => props.theme.color.white};
    p {
        font-weight: 500;
        color: ${props => props.theme.color.textBlack};
    }
    @media (max-width: 630px) {
        width: 180px;
    }
`;
const TextBox = styled.section`
    display: flex;
    justify-content: space-between;
    align-items: end;
`;

export default function FilteringComponent({filterAge, handleAgeChange, rangeAge, filterScore, rangeScore, handleScoreChange, filterCity, isOwnCity, handleClickDeleteCity, filterDistance, handleDistanceChange, handleLatlngChange, allTags, filterTags, handleTagsChange}) {
    
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);
        
    return (
        <Filtering>
            <section>
                <TextBox>
                    <p>Age</p>
                    <p style={{fontSize: '0.9em'}}>{filterAge[0]} - {filterAge[1]} years</p>
                </TextBox>
                <Range 
                    onAfterChange={handleAgeChange}
                    min={rangeAge[0]}
                    max={rangeAge[1]}
                    allowCross={false}
                    defaultValue={filterAge}
                    tipFormatter={value => `${value}`} 
                />
            </section>
            <section>
                <TextBox>
                    <p>Score</p>
                    <p style={{fontSize: '0.9em'}}>{filterScore[0]} - {filterScore[1]}</p>
                </TextBox>
                <Range 
                    onAfterChange={handleScoreChange}
                    min={rangeScore[0]}
                    max={rangeScore[1]}
                    allowCross={false}
                    defaultValue={filterScore}
                    tipFormatter={value => `${value}`} 
                />
            </section>
            <section>
                <TextBox>
                    <p>City</p>
                    {filterCity &&
                        <p style={{fontSize: '0.9em'}}>
                        {filterCity} 
                        {!isOwnCity && <FontAwesomeIcon 
                            style={{marginLeft: '8px', color: 'lightgray', cursor: 'pointer'}}
                            icon={faTimes}
                            onClick={handleClickDeleteCity}
                        /> }
                        </p>
                    }
                </TextBox>
                <AlgoliaPlaces
                    placeholder='Search a city here'
                    options={{
                        appId: 'plGGWNJECAIH',
                        apiKey: 'ecb0baaa5b936ebb8dcc52e94b0b3b75',
                        language: 'fr',
                        countries: ['fr'],
                        type: 'city',
                    }}
                    onChange={handleLatlngChange}
                />
                <TextBox>
                    <p>Distance</p>
                    <p style={{fontSize: '0.9em'}}>{filterDistance}km</p>
                </TextBox>
                <Slider 
                    // dots
                    // step={200} 
                    min={20}
                    max={1000}
                    defaultValue={filterDistance}
                    onAfterChange={handleDistanceChange}
                />
            </section>            
            <section>
                <p>Interests</p>
                <Select
                    onChange={handleTagsChange}
                    defaultValue={[]}
                    value={filterTags}
                    options={allTags}
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                />
            </section>
        </Filtering>
    );
};