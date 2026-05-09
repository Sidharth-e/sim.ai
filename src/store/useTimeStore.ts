import { create } from 'zustand';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const SECONDS_PER_TICK = 30;

interface TimeState {
  hour: number;
  minute: number;
  second: number;
  day: number;
  month: number;
  year: number;
  tickTime: () => void;
  getMonthName: () => string;
  getDayOfYear: () => number;
  getSunrise: () => number;
  getSunset: () => number;
  getSunProgress: () => number;
  getTimeString: () => string;
  getDateString: () => string;
  isDaytime: () => boolean;
}

function computeSunrise(dayOfYear: number): number {
  const t = (dayOfYear / (DAYS_PER_MONTH * MONTHS_PER_YEAR)) * Math.PI * 2;
  return 6.25 - Math.cos(t) * 1.25;
}

function computeSunset(dayOfYear: number): number {
  const t = (dayOfYear / (DAYS_PER_MONTH * MONTHS_PER_YEAR)) * Math.PI * 2;
  return 18.75 + Math.cos(t) * 2.25;
}

export const useTimeStore = create<TimeState>((set, get) => ({
  hour: 8,
  minute: 0,
  second: 0,
  day: 1,
  month: 3,
  year: 1,

  tickTime: () => set((state) => {
    let { hour, minute, second, day, month, year } = state;
    second += SECONDS_PER_TICK;
    if (second >= 60) {
      minute += Math.floor(second / 60);
      second = second % 60;
    }
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute = minute % 60;
    }
    if (hour >= 24) {
      day += Math.floor(hour / 24);
      hour = hour % 24;
    }
    if (day > DAYS_PER_MONTH) {
      month += Math.floor((day - 1) / DAYS_PER_MONTH);
      day = ((day - 1) % DAYS_PER_MONTH) + 1;
    }
    if (month > MONTHS_PER_YEAR) {
      year += Math.floor((month - 1) / MONTHS_PER_YEAR);
      month = ((month - 1) % MONTHS_PER_YEAR) + 1;
    }
    return { hour, minute, second, day, month, year };
  }),

  getMonthName: () => MONTH_NAMES[(get().month - 1) % 12],

  getDayOfYear: () => (get().month - 1) * DAYS_PER_MONTH + get().day,

  getSunrise: () => computeSunrise(get().getDayOfYear()),

  getSunset: () => computeSunset(get().getDayOfYear()),

  getSunProgress: () => {
    const { hour, minute, second } = get();
    const timeDecimal = hour + minute / 60 + second / 3600;
    const sunrise = get().getSunrise();
    const sunset = get().getSunset();
    if (timeDecimal < sunrise) return -1;
    if (timeDecimal > sunset) return 2;
    return (timeDecimal - sunrise) / (sunset - sunrise);
  },

  getTimeString: () => {
    const { hour, minute, second } = get();
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm}`;
  },

  getDateString: () => {
    const { day, year } = get();
    return `${get().getMonthName()} ${day}, Y${year}`;
  },

  isDaytime: () => {
    const progress = get().getSunProgress();
    return progress >= 0 && progress <= 1;
  },
}));
