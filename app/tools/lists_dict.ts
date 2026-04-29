const monthL = ['Jan01', 'Feb02', 'Mar03', 'Apr04', 'May05', 'Jun06', 'Jul07', 'Aug08', 'Sep09', 'Oct10', 'Nov11', 'Dec12'];
const weekL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
const getCalender = (year: number, month: number) => {
  // Get the first day of the month
  const firstDay = new Date(year, month - 1, 1);

  // Get the last day of the month
  const lastDay = new Date(year, month, 0);

  // Get the day of the week for the first day of the month
  const firstDayOfWeek = firstDay.getDay();

  // Get the number of days in the month
  const numDays = lastDay.getDate();

  // Initialize the calendar
  const calendar = [];

  // Initialize the week
  let week = [];

  // Add empty days for the first week
  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push('');
  }

  // Add days to the calendar
  for (let i = 1; i <= numDays; i++) {
    week.push(i);

    // If the week is full, add it to the calendar
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  // Add empty days for the last week
  while (week.length < 7) {
    week.push('');
  }

  // Add the last week to the calendar
  calendar.push(week);

  return calendar;
}
export { monthL, weekL, getCalender };
