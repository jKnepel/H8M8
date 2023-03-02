import CONSTANTS from "./constants";

const isFloat = (n) => Number(n) === n && n % 1 !== 0;

const capString = (s, at = 20) => {
  if (s.length < at) return s;
  return s.slice(0, at) + "...";
};

const getMinuteFormattedString = (secondsAgo) => {
  if (secondsAgo === null || secondsAgo === undefined) {
    return CONSTANTS.DEFAULT_NULL_FALLBACK_VALUE;
  } else {
    if (secondsAgo < 120) {
      return "now";
    }
    return `${Math.floor(secondsAgo / 60)} minutes ago`;
  }
};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

function getFormattedDateTime(t) {
  let date = new Date(t);
  return date.getDate() + "/"
    + (date.getMonth()+1)  + "/"
    + date.getFullYear();
  /* TODO: uncomment this once more interval types than date are available
    + " "
    + date.getHours() + ":"
    + date.getMinutes() + ":"
    + date.getSeconds();
  */
}

function getFormattedHoursStringFromSeconds(t) {
  const secondsToHours = t / 3600;
  const hoursComponent = Math.trunc(secondsToHours);
  const minutesComponent = Math.trunc((secondsToHours - hoursComponent) * 60);
  return `${hoursComponent}h ${minutesComponent}min`;
}

function getFormattedElapsedTime(t) {
  const elapsedTime = Math.abs(new Date().getTime() - new Date(t).getTime());

  const time = {
    year: Math.floor(elapsedTime / 31536000000),
    day: Math.floor(elapsedTime / 86400000) % 365,
    hour: Math.floor(elapsedTime / 3600000) % 24,
    minute: Math.floor(elapsedTime / 60000) % 60,
    second: Math.floor(elapsedTime / 1000) % 60
  };

  let notZero = false;
  Object.entries(time).forEach(val => {
    if (val[1] != 0 && !notZero) notZero = true;
    else if (val[1] == 0 && !notZero) delete time[val[0]];
  });

  return Object.entries(time)
    .slice(0, 2)
    .map(val => val[1] + " " + (val[1] !== 1 ? val[0] + "s" : val[0]))
    .join(", ");
}


export {
  isFloat,
  capString,
  getMinuteFormattedString,
  hexToRgb,
  getFormattedDateTime,
  getFormattedHoursStringFromSeconds,
  getFormattedElapsedTime
};
