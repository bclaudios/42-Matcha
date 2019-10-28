const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver(
    'bolt://0.0.0.0:7687/',
    neo4j.auth.basic('neo4j', 'whiterabbit')
);

module.exports = driver;