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
  
  const error = (error, funcName, fileName) => {
    const path = fileName.split(`/server/`);
    log(`${error.name} from ${funcName}() in ${path[1]} :`, `red`);
    log(`- ${error.message}`, `white`);
  }

  module.exports = {
      error,
      log,
  }