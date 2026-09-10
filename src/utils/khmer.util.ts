const KhmerCalendars = require("../lib/chankitek");

export const khmerDays = [
  "អាទិត្យ", // Sunday
  "ច័ន្ទ", // Monday
  "អង្គារ", // Tuesday
  "ពុធ", // Wednesday
  "ព្រហស្បតិ៍", // Thursday
  "សុក្រ", // Friday
  "សៅរ៍", // Saturday
];

export const khmerMonths = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export const toKhmerNumber = (val: string | number) => {
  return val
    .toString()
    .replace(/0/g, "០")
    .replace(/1/g, "១")
    .replace(/2/g, "២")
    .replace(/3/g, "៣")
    .replace(/4/g, "៤")
    .replace(/5/g, "៥")
    .replace(/6/g, "៦")
    .replace(/7/g, "៧")
    .replace(/8/g, "៨")
    .replace(/9/g, "៩");
};

export const getFullKhmerDate = (date: Date, customDate?: boolean) => {
  if (customDate) {
    return `ថ្ងៃទី${toKhmerNumber(date.getDate())} ខែ${khmerMonths[date.getMonth()]} គ.ស.${toKhmerNumber(date.getFullYear())}`;
  }
  return `ថ្ងៃទី${toKhmerNumber(date.getDate())} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${toKhmerNumber(date.getFullYear())}`;
};

export const getYear = (date: Date): string => {
  return toKhmerNumber(date.getFullYear().toString().slice(-2));
};

export const getFullKhmerDateD = (date: Date) => {
  const dayOfWeek = date.getDay(); // Get day of the week (0 - 6)
  const dayName = khmerDays[dayOfWeek]; // Get the corresponding Khmer day name

  return ` ថ្ងៃ${dayName} ទី${toKhmerNumber(date.getDate())} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${toKhmerNumber(date.getFullYear())}`;
};
export const getShortKhmerDate = (date: Date) => {
  const dayOfWeek = date.getDay(); // Get day of the week (0 - 6)
  const dayName = khmerDays[dayOfWeek]; // Get the corresponding Khmer day name

  return ` ${dayName}`;
};
/**
 * Get Chankitek Date
 * @param date
 * @returns
 */
export const getChhankitekDate = async (date: string) => {
  try {
    let new_date = new Date(date); // moment(date, 'YYYY-MM-DD').toDate();
    let lunar = new KhmerCalendars(new_date).calendars();
    let KhmerBuddhistCalendar = lunar.BuddhistCalendar;

    let lunar_date =
      "ថ្ងៃ" +
      KhmerBuddhistCalendar.dayName +
      " " +
      toKhmerNumber(KhmerBuddhistCalendar.day) +
      KhmerBuddhistCalendar.moonPhase +
      " ខែ" +
      KhmerBuddhistCalendar.month +
      " ឆ្នាំ" +
      KhmerBuddhistCalendar.zodiac +
      " " +
      KhmerBuddhistCalendar.sak +
      " ព.ស " +
      toKhmerNumber(KhmerBuddhistCalendar.year);

    return lunar_date;
  } catch (err) {
    console.error(err);
    return "";
  }
};
