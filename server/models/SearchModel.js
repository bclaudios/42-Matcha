const driver = require('../db/database.js');
const session = driver.session();
const Log = require(`../tools/Log`);

const searchUsers = async (uuid, { sortingChoice, filterAge, filterScore, filterLatLng, filterDistance, filterTags, offset }) => { 
  const sorting = { 
    'Closest': 'ORDER BY dist_city',
    'Farthest': 'ORDER BY dist_city DESC',
    'Youngest': 'ORDER BY age',
    'Oldest': 'ORDER BY age DESC',
    'Most famous': 'ORDER BY score DESC',
    'Least famous': 'ORDER BY score',
  };

  const selectedTags = filterTags.length !== 0 ? filterTags.map( tag => tag.label ) : null;

  try {
    const res = await session.run(`
    MATCH (me:User {uuid: $uuid}), (u:User)
    MATCH (u)-[:TAGGED]->(t:Tag)
    MATCH (u)-[:TAGGED]->(t2:Tag)
    WHERE NOT (me = u) 
    AND NOT (me)-[:BLOCKED]->(u)
    AND NOT (me)<-[:BLOCKED]-(u)
    AND u.gender IN me.lookingFor
    AND me.gender IN u.lookingFor
    AND ( $scoreMin <= u.score <= $scoreMax)
    ${selectedTags ? 'AND t2.tag in $selectedTags' : ''}
    WITH me, u, t,
      point({latitude: me.latLng[0], longitude: me.latLng[1]}) AS p1, 
      point({latitude: u.latLng[0], longitude: u.latLng[1]}) AS p2,
      ${filterLatLng ? ' point({latitude: $lat, longitude: $lng}) AS p3, ' : ''}
      duration.between(date(u.birthDate),date()).years AS age
    WITH me, u, t, age, p1, p2
    ${filterLatLng ? ' , distance(p2,p3) AS city_range' : ''}
    WHERE ( $ageMin <= age <= $ageMax)
    ${filterLatLng ? ' AND city_range <= $cityDistance' : ''}
    RETURN u.username AS username, 
      age,
      u.gender AS gender,
      u.city AS city,
      u.score AS score,
      u.orientation AS orientation,
      u.photos AS photos,
      u.avatarIndex AS avatarIndex,
      collect(DISTINCT t.tag) AS tags, 
      distance(p1,p2) AS dist_city
      ${sorting[sortingChoice]}
    SKIP $offset
    LIMIT 20
    `, { 
      uuid: uuid,
      scoreMin: filterScore[0],
      scoreMax: filterScore[1],
      ageMin: filterAge[0],
      ageMax: filterAge[1],
      lat: filterLatLng ? filterLatLng[0] : 0,
      lng: filterLatLng ? filterLatLng[1] : 0,
      cityDistance: filterDistance * 1000,
      selectedTags: selectedTags,
      offset: offset,
    });
    session.close();
    const users = res.records.map(record => {
      const username = record.get('username');
      const gender = record.get('gender');
      const age = record.get('age');
      const city = record.get('city');
      const score = record.get('score');
      const orientation = record.get('orientation');
      const avatarIndex = record.get('avatarIndex');
      const photos = record.get('photos');
      const photo = photos[avatarIndex];
      const tags = record.get('tags');
      return { username, gender, age, city, score, orientation, photo, tags }
    });
    return users;
  } catch (error) { Log.error(error, `searchUsers`, __filename) }
}

const filtersMinMax = async () => { 
  try {
    const res = await session.run(`
      MATCH (u:User)
      WITH u, duration.between(date(u.birthDate),date()).years AS age
      RETURN min(age) AS ageMin, max(age) AS ageMax, min(u.score) AS scoreMin, max(u.score) AS scoreMax
    `);
    session.close();
    const ageMin = res.records[0].get('ageMin').low;
    const ageMax = res.records[0].get('ageMax').low;
    const scoreMin = res.records[0].get('scoreMin');
    const scoreMax = res.records[0].get('scoreMax');
    return { age: [ageMin, ageMax], score: [scoreMin, scoreMax] };
  } catch (error) { Log.error(error, `filtersMinMax`, __filename) }
}

const suggestedUsers = async (uuid, { sortingChoice, filterAge, filterScore, filterLatLng, filterDistance, filterTags }) => { 
  const sorting = { 
    'Closest': 'ORDER BY dist_city',
    'Farthest': 'ORDER BY dist_city DESC',
    'Youngest': 'ORDER BY age',
    'Oldest': 'ORDER BY age',
    'Most famous': 'ORDER BY score DESC',
    'Least famous': 'ORDER BY score',
  };

  const selectedTags = filterTags.length !== 0 ? filterTags.map( tag => tag.label ) : null;

  try {
    const res = await session.run(`
    MATCH (me:User {uuid: $uuid}), (u:User)
    MATCH (u)-[:TAGGED]->(t:Tag)
    MATCH (u)-[:TAGGED]->(t2:Tag)
    WHERE NOT (me = u) 
    AND NOT (me)-[:DISLIKED]->(u)
    AND NOT (me)-[:LIKED]->(u)
    AND NOT (me)-[:BLOCKED]->(u)
    AND NOT (me)<-[:BLOCKED]-(u)
    AND u.gender IN me.lookingFor
    AND me.gender IN u.lookingFor
    AND ( $scoreMin <= u.score <= $scoreMax)
    ${selectedTags ? 'AND t2.tag in $selectedTags' : ''}
    WITH me, u, t,
      point({latitude: me.latLng[0], longitude: me.latLng[1]}) AS p1, 
      point({latitude: u.latLng[0], longitude: u.latLng[1]}) AS p2,
      ${filterLatLng ? ' point({latitude: $lat, longitude: $lng}) AS p3, ' : ''}
      duration.between(date(u.birthDate),date()).years AS age
    WITH me, u, t, age, p1, p2
    ${filterLatLng ? ' , distance(p2,p3) AS city_range' : ''}
    WHERE ($ageMin <= age <= $ageMax)
    ${filterLatLng ? ' AND city_range <= $cityDistance' : ''}
    RETURN u.username AS username, 
      age,
      u.gender AS gender,
      u.userId AS userId,
      u.city AS city,
      u.score AS score,
      u.orientation AS orientation,
      u.photos AS photos,
      u.avatarIndex AS avatarIndex,
      collect(DISTINCT t.tag) AS tags, 
      distance(p1,p2) AS dist_city
      ${sorting[sortingChoice]}
    LIMIT 1
    `, { 
      uuid: uuid,
      scoreMin: filterScore[0],
      scoreMax: filterScore[1],
      ageMin: filterAge[0],
      ageMax: filterAge[1],
      lat: filterLatLng ? filterLatLng[0] : 0,
      lng: filterLatLng ? filterLatLng[1] : 0,
      cityDistance: filterDistance * 1000,
      selectedTags: selectedTags,
    });
    session.close();
    const users = res.records.map(record => {
      const username = record.get('username');
      const gender = record.get('gender');
      const userId = record.get('userId');
      const age = record.get('age');
      const city = record.get('city');
      const score = record.get('score');
      const orientation = record.get('orientation');
      const avatarIndex = record.get('avatarIndex');
      const photos = record.get('photos');
      const photo = photos[avatarIndex];
      const tags = record.get('tags');
      return { username, gender, userId, age, city, score, orientation, photo, tags }
    });
    return users;
  } catch (error) { Log.error(error, `suggestedUsers`, __filename) }
}

const ownCityLatLng = async uuid => { 
  try {
    const res = await session.run(`
      MATCH (n:User {uuid: $uuid})
      RETURN n.city AS city, n.latLng AS latLng
    `, { uuid });
    session.close();
    if (res.records[0] === undefined) return null;
    const city = res.records[0].get('city');
    const latLng = res.records[0].get('latLng');
    return { city, latLng };
  } catch (error) { Log.error(error, `ownCityLatLng`, __filename) }
}

module.exports = {
  searchUsers,
  suggestedUsers,
  filtersMinMax,
  ownCityLatLng,
}
