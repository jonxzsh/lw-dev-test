export const difMins = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / 60000);

export const minsToMs = (mins: number) => mins * 60000;
