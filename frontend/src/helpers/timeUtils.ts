// utils/timeUtils.ts

export const formatPlayedTime = (playedAt: string): string => {
    const playedDate = new Date(playedAt);
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
  