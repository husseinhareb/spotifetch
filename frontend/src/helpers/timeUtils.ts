// utils/timeUtils.ts

export const formatPlayedTime = (playedAt: string): string => {
    // Defensive parsing: if the string looks like an ISO datetime but lacks
    // timezone information (no 'Z' or +HH:MM/-HH:MM), assume UTC by appending 'Z'.
    let iso = playedAt;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(playedAt)) {
      iso = playedAt + 'Z';
    }
    const playedDate = new Date(iso);
    const now = new Date();
    const timeDifference = now.getTime() - playedDate.getTime();
    const minutesDiff = Math.floor(timeDifference / (1000 * 60));
    const hoursDiff = Math.floor(timeDifference / (1000 * 60 * 60));
  
    if (minutesDiff < 60) {
      return `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'} ago`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
    } else {
      return playedDate.toLocaleString();
    }
  };
  