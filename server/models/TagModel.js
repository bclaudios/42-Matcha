const driver = require('../db/database.js');
const session = driver.session();

async function allTags() { 
  try {
    const res = await session.run(`
      MATCH (t:Tag) 
      WITH t ORDER BY t.tag
      RETURN collect(DISTINCT t.tag) AS tags
    `);
    session.close();
    return res.records[0].get('tags');
  } catch(err) { console.log(err) }
}

async function createTag(req) {
  try {
    await session.run(`
      CREATE (t:Tag {tag: $tag})
    `, {tag: req.tag});
    session.close();
  } catch(err) { console.log(err) }
}

module.exports = {
  createTag,
  allTags,
}