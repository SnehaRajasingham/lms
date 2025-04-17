// utils/fineCalculator.js
const MAX_DAYS = 7;
const FINE_PER_DAY = 10;

exports.calculateFine = (borrowedDate, returnedDate) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((returnedDate - borrowedDate) / msPerDay);
  return days > MAX_DAYS ? (days - MAX_DAYS) * FINE_PER_DAY : 0;
};
