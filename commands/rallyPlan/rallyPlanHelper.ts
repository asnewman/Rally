export const getMinutesUntilRally = (scheduledEpoch: number) => {
  return Math.floor(Math.round((scheduledEpoch - Date.now()) / 1000) / 60);
}