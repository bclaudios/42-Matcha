const driver = require('./database.js');
const session = driver.session();
const uuidv1 = require('uuid/v1');

const Color = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
  
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
}
const log = (text, color = "yellow") => console.log(`${Color[color]}${text}${Color.Reset}`);
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const getUserCount = async () => {
    const result = await session.run(`
        MATCH (u:User)
        RETURN count(u)
    `)
    return result.records[0].get(0).low;
}

const deleteAllRel = async (relationship) => {
    log(`Deleting all "${relationship}" relationships and notifications...`);
    await session.run(`
        MATCH (n:Notification)
        DELETE n
    `)
    const relResult = await session.run(`
        MATCH ()-[r:${relationship}]->()
        DELETE r
        RETURN count(r)
        `)
    log(`${relResult.records[0].get(0)} "${relationship}" relationships deleted.`);
    if (relationship !== "TAGGED" && relationship !== "BLOCKED") {
        const notifResult = await session.run(`
        MATCH (n:Notification {type: "${relationship.toLowerCase()}"})
        DELETE n
        RETURN count(n)
        `)
        log(`${notifResult.records[0].get(0)} "${capitalize(relationship.toLowerCase())}" notifications deleted.`);
    }
}

const hasMatched = async(userId, targetUserId) => {
    const res = await session.run(`
        MATCH (u:User { userId: $userId })-[r:LIKED]-(t:User { userId: $targetUserId })
        RETURN count(r)
    `, {
        userId: userId,
        targetUserId: targetUserId
    })
    const matched = res.records[0].get(0).low;
    return matched === 2;
}

const isBlocked = async(seedId, targetseedId) => {
    const res = await session.run(`
        MATCH (u:User { seedId: $seedId })-[r:BLOCKED]->(t:User { seedId: $targetseedId })
        RETURN count(r)
    `, {
        seedId: seedId,
        targetseedId: targetseedId
    })
    const blocked = res.records[0].get(0);
    return blocked === 1;
}

const hasVisited = async(seedId, targetseedId) => {
    const res = await session.run(`
        MATCH (u:User { seedId: $seedId })-[r:VISITED]->(t:User { seedId: $targetseedId })
        RETURN count(r)
    `, {
        seedId: seedId,
        targetseedId: targetseedId
    })
    const visited = res.records[0].get(0);
    return visited === 1;
}

const isLiked = async(seedId, targetseedId) => {
    const res = await session.run(`
        MATCH (u:User { seedId: $seedId })-[r:LIKED]->(t:User { seedId: $targetseedId })
        RETURN count(r)
    `, {
        seedId: seedId,
        targetseedId: targetseedId
    })
    const liked = res.records[0].get(0);
    return liked === 1;
}

const hasAnyRelationship = async (firstseedId, secondseedId) => {
    const res = await session.run(`
        MATCH (u1:User {seedId: $firstseedId})-[r]-(u2:User {seedId: $secondseedId})
        RETURN count(r)
    `, {
        firstseedId: firstseedId,
        secondseedId: secondseedId,
    })
    const relCount = res.records[0].get(0);
    return relCount > 0;
};

const createNotification = async (type, fromId, toUuid) => {
    const notification = {
        type: type,
        from: fromId,
        to: toUuid,
        status: "unseen"
    }
    await session.run(`CREATE (n:Notification $notification) SET n.dateTime = DateTime({timezone: 'Europe/Paris'})`, {notification: notification});
}

const seedVisitedRel = async () => {
    log(`\n***** VISITED relationships seeding *****`, `blue`)
    const relByUser = 5;
    const maxId = await getUserCount();
    await deleteAllRel("VISITED");
    log(`Creating ${relByUser * maxId} "VISITED" relationships...`);
    for (seedId = 0; seedId < maxId; seedId++) {
        for (relCount = 0; relCount < relByUser; relCount++) {
            let randomId = Math.floor(Math.random() * maxId);
            while (seedId === randomId ||
                await isBlocked(seedId, randomId) ||
                await isBlocked(randomId, seedId) ||
                await hasVisited(randomId, seedId)) {
                randomId = Math.floor(Math.random() * maxId);
            }
            const res = await session.run(`
                MATCH (randomUser:User {seedId: $randomSeedId}), (user:User {seedId: $seedId})
                CREATE (randomUser)-[r:VISITED]->(user)
                SET r.timestamp = timestamp()
                RETURN 
                user.userId AS userId,
                randomUser.userId AS targetUserId
            `, {
                seedId: seedId,
                randomSeedId: randomId,
            })
            await createNotification("visited", res.records[0].get(`targetUserId`), res.records[0].get(`userId`));
        }
    }
    const result = await session.run(`
        MATCH ()-[r:VISITED]->()
        RETURN count(r)
    `)
    log(`${result.records[0].get(0).low} "VISITED" relationships created.`, `green`);
}

const seedBlockedRel = async () => {
    log(`\n***** BLOCKED relationships seeding *****`, `blue`)
    const relByUser = 1;
    const maxId = await getUserCount();
    await deleteAllRel("BLOCKED");
    log(`Creating ${relByUser * maxId} "BLOCKED" relationships...`);
    for (seedId = 0; seedId < maxId; seedId++) {
        for (relCount = 0; relCount < relByUser; relCount++) {
            let randomId = Math.floor(Math.random() * maxId);
            while (seedId === randomId || await hasAnyRelationship(seedId, randomId)) {
                randomId = Math.floor(Math.random() * maxId);
            }
            await session.run(`
                MATCH (randomUser:User {seedId: $randomSeedId}), (user:User {seedId: $seedId})
                CREATE (user)-[r:BLOCKED]->(randomUser)
                SET r.timestamp = timestamp()
            `, {
                seedId: seedId,
                randomSeedId: randomId,
            })
        }
    }
    const result = await session.run(`
        MATCH ()-[r:BLOCKED]->()
        RETURN count(r)
    `)
    log(`${result.records[0].get(0).low} "BLOCKED" relationships created.`, `green`);
}

const seedTaggedRel = async () => {
    log(`\n***** TAGGED relationships seeding *****`, `blue`)
    const relByUser = 3;
    const userCount = await getUserCount();
    const tagCount = await session.run(`MATCH (t:Tag) RETURN count(t)`);
    await deleteAllRel("TAGGED");
    log(`Creating ${relByUser * userCount} "TAGGED" relationships...`);
    for (seedId = 0; seedId < userCount; seedId++) {
        const selectedTagId = [];
        for (relCount = 0; relCount < relByUser; relCount++) {
            let randomId = Math.floor(Math.random() * tagCount.records[0].get(0).low);
            while (selectedTagId.includes(randomId)) {
                randomId = Math.floor(Math.random() * tagCount.records[0].get(0).low);
            }
            selectedTagId.push(randomId);
        };
        for (tagId of selectedTagId) {
            await session.run(`
                MATCH (u:User {seedId: $seedId}), (t:Tag {seedId: $tagId})
                CREATE (u)-[r:TAGGED]->(t)
                SET r.timestamp = timestamp()
            `, {
                seedId: seedId,
                tagId: tagId
            })
        }
    }
    const result = await session.run(`
        MATCH ()-[r:TAGGED]->()
        RETURN count(r)
    `)
    log(`${result.records[0].get(0).low} "TAGGED" relationships created.`, `green`);
}

const seedLikedRel = async () => {
    log(`\n***** LIKED relationships seeding *****`, `blue`)
    const relByUser = 2;
    const maxId = await getUserCount();
    await deleteAllRel("LIKED");
    log(`Creating ${relByUser * maxId} "LIKED" relationships...`);
    for (seedId = 0; seedId < maxId; seedId++) {
        for (relCount = 0; relCount < relByUser; relCount++) {
            let randomId = Math.floor(Math.random() * maxId);
            while (seedId === randomId ||
                await !hasVisited(randomId, seedId) ||
                await isLiked(randomId, seedId)) {
                randomId = Math.floor(Math.random() * maxId);
            }
            const res = await session.run(`
                MATCH (randomUser:User {seedId: $randomSeedId}), (user:User {seedId: $seedId})
                CREATE (randomUser)-[r:LIKED]->(user)
                SET r.timestamp = timestamp()
                RETURN
                user.userId AS userId,
                randomUser.userId AS targetUserId
            `, {
                seedId: seedId,
                randomSeedId: randomId,
            })
            const targetUserId = res.records[0].get(`targetUserId`);
            const userId = res.records[0].get(`userId`);
            await createNotification("liked", targetUserId, userId);
            if (await hasMatched(userId, targetUserId)) {
                await session.run(`CREATE CONSTRAINT ON (m:Match) ASSERT m.machId IS UNIQUE`);
                await session.run(`
                    CREATE (m:Match {
                        userIds: $userIds,
                        matchId: $matchId,
                        dateTime: DateTime({timezone: 'Europe/Paris'})
                    })
                    `, {
                        userIds: [userId, targetUserId],
                        matchId: uuidv1(),
                    }
                );
                await createNotification("matched", targetUserId, userId);
            }
        }
    }
    const result = await session.run(`
        MATCH ()-[r:LIKED]->()
        RETURN count(r)
    `)
    log(`${result.records[0].get(0).low} "LIKED" relationships created.`, `green`);
}

const seedRelationships = async () => {
    try {
        await seedTaggedRel();
        await seedBlockedRel();
        await seedVisitedRel();
        await seedLikedRel();
        log(`\nRelationships seeding complete !`, `cyan`)
        process.exit(0);
    } catch(error) {
        log(error, `red`);
        log(`\nTerminating seeding process.`, `red`);
        process.exit(1);
    }
}

seedRelationships();