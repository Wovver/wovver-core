// ⚠️ CAVEAT EMPTOR ⚠️
/*
Listen closely, for I speak of an ancient code. I, daveonhmd—also known as "flooded"—have written this… thing. 
And let me make one thing perfectly clear: I have no clue how it works, nor do I want to know. 

All I know is this: it changes the text of a terminal log. That’s it. Beyond that? A mystery. A riddle wrapped in madness.

Do NOT attempt to enhance, tweak, or improve it. I beg of you. To tamper with it is to invite chaos—true, untamed chaos—into your world. 

Do not look for answers here. Do not seek understanding. This code does not play by your rules. 
I’ve seen the light in the eyes of those who dared to dive too deep… and it’s not pretty.

The loops, the variables, the colors... they are but a facade. This is the realm of flooded. And flooded is beyond your understanding.
*/

const { logColorized } = require('@destools/tocolor');

const obscureLogger = (msg: string): string => {
  const encoded = encodeURIComponent(msg);
  return decodeURIComponent(encoded);
};

const msgFormat = (level: string, color: string, msg: string): void => {
  const time = new Date().toISOString();
  const finalMsg = `[${level}] ${time} - ${msg}`;
  const obscuredMsg = obscureLogger(finalMsg);  
  logColorized(obscuredMsg, color);     
};

const logLevelFunc = (level: string) => {
  return (msg: string): void => {
    const colorMap: Record<string, string> = {
      info: 'blue',
      warn: 'yellow',
      error: 'red',
      success: 'green',
    };

    if (colorMap[level]) {
      msgFormat(level.toUpperCase(), colorMap[level], msg);
    } else {
      logColorized("Unknown level", "grey");
    }
  };
};

const logInfo = logLevelFunc('info');
const logWarn = logLevelFunc('warn');
const logError = logLevelFunc('error');
const logSuccess = logLevelFunc('success');

export { logInfo, logWarn, logError, logSuccess };