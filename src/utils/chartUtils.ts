import {
  addDays,
  addMonths,
  addYears,
  getTime,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";

export const getYearEpochs = (fromDate: Date, toDate: Date): number[] => {
  const yearEpochs: number[] = [];
  yearEpochs.push(getTime(fromDate));
  let startYear = startOfYear(addYears(fromDate, 1));
  const endYear = toDate;

  while (isBefore(startYear, endYear)) {
    yearEpochs.push(getTime(startYear));
    startYear = addYears(startYear, 1);
  }

  return yearEpochs;
};

export const getMonthEpochs = (fromDate: Date, toDate: Date): number[] => {
  const monthEpochs: number[] = [];
  monthEpochs.push(getTime(fromDate));
  let startMonth = startOfMonth(addMonths(fromDate, 1));
  const endMonth = toDate;

  while (isBefore(startMonth, endMonth)) {
    monthEpochs.push(getTime(startMonth));
    startMonth = addMonths(startMonth, 1);
  }

  return monthEpochs;
};

export const getDayEpochs = (fromDate: Date, toDate: Date): number[] => {
  const dayEpochs: number[] = [];
  dayEpochs.push(getTime(fromDate));
  let startDay = startOfDay(addDays(fromDate, 1));
  const endDay = toDate;

  while (isBefore(startDay, endDay)) {
    dayEpochs.push(getTime(startDay));
    startDay = addDays(startDay, 1);
  }

  return dayEpochs;
};

export const getEpochs = (fromDate?: Date, toDate?: Date): number[] => {
  if (!fromDate || !toDate) {
    return [];
  }

  const diff = toDate.getTime() - fromDate.getTime();
  // month
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return getDayEpochs(fromDate, toDate);
  }
  // year
  if (diff < 365 * 24 * 60 * 60 * 1000) {
    return getMonthEpochs(fromDate, toDate);
  }

  return getYearEpochs(fromDate, toDate);
};
