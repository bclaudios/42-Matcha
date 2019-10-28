const driver = require('./database.js');
const session = driver.session();

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

const seedChatMessage = async () => {
    try {
        log(`***** Chat messages seeding *****`, `blue`);
        log(`Deleting all previous messages...`);
        await session.run(`
            MATCH (m:Message)
            DELETE m
            `)
        log(`All previous messages deleted.`);
        log(`Seeding messages...`);
        const messages = [
          "Hi",
          "This is a test message.",
          "This is a longer test message, to see if everything fit nicely.",
          "Alright, bye !"
        ]
        const matchRes = await session.run(`
            MATCH (m:Match)
            RETURN m AS match
        `)
        const matchs = []
        for (i = 0; i < matchRes.records.length; i++) {
            matchs.push(matchRes.records[i].get(0).properties);
        }
        for (i = 0; i < matchs.length; i++) {
            for (j = 0; j < messages.length; j++) {
                await session.run(`
                    CREATE (m:Message { 
                        matchId: $matchId,
                        from: $from,
                        to: $to,
                        message: $message,
                        status: $status,
                        dateTime: DateTime({timezone: 'Europe/Paris'})
                    })
                `, {
                    matchId: matchs[i].matchId,
                    from: matchs[i].userIds[0],
                    to: matchs[i].userIds[1],
                    status: "unread",
                    message: messages[j]
                })
                await session.run(`
                    CREATE (m:Message { 
                        matchId: $matchId,
                        from: $from,
                        to: $to,
                        message: $message,
                        status: $status,
                        dateTime: DateTime({timezone: 'Europe/Paris'})
                    })
                `, {
                    matchId: matchs[i].matchId,
                    from: matchs[i].userIds[1],
                    to: matchs[i].userIds[0],
                    status: "unread",
                    message: messages[j]
                })
            }
        }
        const res = await session.run(`
            MATCH (m:Message)
            RETURN count(m)
        `)
        log(`${res.records[0].get(0)} messages generated.`);
        log(`\nChat messages seeding complete !`, `cyan`)
        process.exit(0)
    } catch (error) {
      log(error, `red`);
      console.log(error)
      log(`\nTerminating seeding process.`, `red`);
      process.exit(1);
    }
  }
  
  seedChatMessage();