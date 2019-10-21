import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UserCard from '../../../components/UserCard';
import Sorting from '../../../components/Sorting';
import Filtering from '../../../components/Filtering';
import MoreButton from '../../../components/MoreButton';
import IncompleteProfile from '../../../components/IncompleteProfile';
import Spinner from '../../../components/Spinner';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SearchSection = styled.section`
  margin: 3vw 10vw;
  display: grid;
  grid-template-columns: 330px 1fr;
  grid-gap: 10px;
  grid-template-areas:
    "filtering sorting"
    "filtering results";
  @media (max-width: 750px) {
    grid-gap: 50px;
    grid-template-columns: 1fr;
    grid-template-areas:
      "filtering"
      "sorting"
      "results";
  }
`;
const FilteringSection = styled.aside`
  grid-area: filtering;
  justify-self: center;
`;
const SortingSection = styled.aside`
  grid-area: sorting;
  justify-self: end;
  @media (max-width: 750px) {
    justify-self: center;
}
`;
const ResultsSection = styled.section`
  grid-area: results;
  display: flex;
  flex-direction: column;
`;
const UserCards = styled.section`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;
const NoMore = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function PageSearch() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoMore, setHasNoMore] = useState(false);
  const [sortingChoice, setSortingChoice] = useState('Most famous');
  const [filterCity, setFilterCity] = useState(null);
  const [filterLatLng, setFilterLatLng] = useState(null);
  const [isOwnCity, setIsOwnCity] = useState(true);
  const [filterDistance, setFilterDistance] = useState(1000);
  const [filterTags, setFilterTags] = useState([]);
  const [filterAge, setFilterAge] = useState([18, 60]);
  const [rangeAge, setRangeAge] = useState([0, 100]);
  const [filterScore, setFilterScore] = useState([0, 100000]);
  const [rangeScore, setRangeScore] = useState([0, 100000]);
  const [allTags, setAllTags] = useState(null);
  const [users, setUsers] = useState([]);
  const [offset, setOffset] = useState(0);
  const authToken = localStorage.getItem('token');
  const [hasFullProfile, setHasFullProfile] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);
    async function fetchData() {
      const res = await axios.get(`/users/hasFullProfile?authToken=${authToken}`);
      const missingFields = [];
      if (res.data.fields.birthDate === null) missingFields.push('your birthdate');
      if (res.data.fields.gender === null) missingFields.push('your gender');
      if (res.data.fields.orientation === null) missingFields.push('your sexual orientation');
      if (res.data.fields.lookingFor === null) missingFields.push('who you are looking for');
      if (missingFields.length !== 0) {
        if (isSubscribed) {
          setMissingProfileFields(missingFields);
          setHasFullProfile(false);
          setIsLoading(false);
        }
      } else {
        if (isSubscribed) setHasFullProfile(true);
      }
    }
    if (authToken) fetchData();
    return () => isSubscribed = false;
  }, [authToken]);

  useEffect(() => {
    let isSubscribed = true;
    if (hasFullProfile) {
      async function fetchData() {
        const res = await axios.get(`/search/ownCityLatLng?authToken=${authToken}`);
        if (isSubscribed) {
          setFilterCity(res.data.cityLatLng.city);
          setFilterLatLng(res.data.cityLatLng.latLng);
        }
      }
      if (authToken) fetchData();
    }
    return () => isSubscribed = false;
  }, [authToken, hasFullProfile]);

  useEffect(() => {
    let isSubscribed = true;
    async function fetchData() {
      const res = await axios.get(`/search/filtersMinMax?authToken=${authToken}`);
      if (res.data && isSubscribed) {
        setFilterAge(res.data.age);
        setRangeAge(res.data.age);
        setFilterScore(res.data.score);
        setRangeScore(res.data.score);
      }
    }
    if (authToken) fetchData();
    return () => isSubscribed = false;
  }, [authToken, hasFullProfile]);

  useEffect(() => {
    let isSubscribed = true;
    async function fetchData() {
      const res = await axios.get(`/tags?authToken=${authToken}`);
      if (res.data && isSubscribed) setAllTags(res.data.tags);
    }
    if (authToken) fetchData();
    return () => isSubscribed = false;
  }, [authToken, hasFullProfile]);

  useEffect(() => {
    let isSubscribed = true;
    if (hasFullProfile) {
      setIsLoading(true);
      setHasNoMore(false);
      async function fetchData() {
        const filters = { sortingChoice, filterAge, filterScore, filterLatLng, filterDistance, filterTags, offset }
        const res = await axios.post(`/search?authToken=${authToken}`, filters);
        if (res.data && res.data.usersArr && isSubscribed) {
          if (res.data.usersArr.length !== 20) setHasNoMore(true);
          offset !== 0 ? setUsers( prev => [...prev, ...res.data.usersArr]) : setUsers(res.data.usersArr);
          setIsLoading(false);
        }
      }
      if (authToken) fetchData();
    }
    return () => isSubscribed = false;
  }, [authToken, hasFullProfile, sortingChoice, filterAge, filterScore, filterLatLng, filterDistance, filterTags, offset]);

  const handleSelectSorting = e => { setSortingChoice(e.target.innerText); setOffset(0); };
  const handleAgeChange = values => { setFilterAge(values); setOffset(0); };
  const handleScoreChange = values => { setFilterScore(values); setOffset(0); };
  const handleLatlngChange = ({ suggestion }) => { 
    setIsOwnCity(false);
    setFilterLatLng([suggestion.latlng.lat, suggestion.latlng.lng]);
    setFilterCity(suggestion.name); 
    setOffset(0); 
  };
  const handleClickDeleteCity = async () => { 
    if (authToken) {
      setFilterLatLng(null);
      setFilterCity(null);
      const res = await axios.get(`/search/ownCityLatLng?authToken=${authToken}`);
      if (res.data && res.data.cityLatLng) {
        setFilterCity(res.data.cityLatLng.city);
        setFilterLatLng(res.data.cityLatLng.latLng);
        setIsOwnCity(true);
      }
    }
  };
  const handleDistanceChange = value => { setFilterDistance(value); setOffset(0); };
  const handleTagsChange = values => { 
    values !== null ? setFilterTags(values) : setFilterTags([]);
    setOffset(0);
  };
  const handleClickMoreButton = () => { setOffset(offset + 20); };

  return (
    <SearchSection>
      <FilteringSection>
        <Filtering 
          filterAge={filterAge}
          handleAgeChange={handleAgeChange}
          rangeAge={rangeAge}
          filterScore={filterScore}
          rangeScore={rangeScore}
          handleScoreChange={handleScoreChange}
          handleLatlngChange={handleLatlngChange}
          filterCity={filterCity}
          isOwnCity={isOwnCity}
          handleClickDeleteCity={handleClickDeleteCity}
          filterDistance={filterDistance}
          handleDistanceChange={handleDistanceChange}
          allTags={allTags}
          filterTags={filterTags}
          handleTagsChange={handleTagsChange}
        />
      </FilteringSection>
      <SortingSection>
        <Sorting 
          sortingChoice={sortingChoice}
          handleSelectSorting={handleSelectSorting}
        />
      </SortingSection>
      {isLoading && <Spinner />}
      {!isLoading && 
        <ResultsSection>
        {!hasFullProfile &&
            <IncompleteProfile 
              missingProfileFields={missingProfileFields}
            />
        }
        {hasFullProfile && users.length !== 0 &&
          <UserCards>
            {users.map( (user, index) => 
              <Link 
                key={index}
                to={`/profile/${user.username}`}
                style={{textDecoration: 'none'}}
              >
                <UserCard 
                  user={user}
                  width={250}
                  height={375}
                />
              </Link>
            )}
          </UserCards>
        }
        {hasFullProfile && !hasNoMore && 
          <MoreButton
            handleClickMoreButton={handleClickMoreButton}
          />
        }
        {hasFullProfile && users.length === 0 && 
          <NoMore>
            <p>No more suggestion...</p>
          </NoMore>
        }
        </ResultsSection>
      }
    </SearchSection>
  );
}