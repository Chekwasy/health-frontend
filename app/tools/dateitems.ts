export const isDateInPast = (dateString: string) => {
  const dateParts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (!dateParts) return false;

  const day = parseInt(dateParts[1]);
  const month = parseInt(dateParts[2]) - 1; // Months are 0-based
  const year = parseInt(dateParts[3]);

  const inputDate = new Date(year, month, day);
  const currentDate = new Date();

  return inputDate.getTime() < currentDate.getTime();
};

export const getDateTimeString = () => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}${month}${year}`;
};

export const getSeventhDay = (dateString: string) => {
  const dateParts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (!dateParts) return null;

  const day = parseInt(dateParts[1]);
  const month = parseInt(dateParts[2]);
  const year = parseInt(dateParts[3]);

  const date = new Date(parseInt(`${year}`), month - 1, day + 7);

  const seventhDay = date.getDate().toString().padStart(2, '0');
  const seventhMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const seventhYear = date.getFullYear().toString()

  return `${seventhDay}${seventhMonth}${seventhYear}`;
};

export const getThirtiethDay = (dateString: string) => {
  const dateParts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (!dateParts) return null;

  const day = parseInt(dateParts[1]);
  const month = parseInt(dateParts[2]);
  const year = parseInt(dateParts[3]);

  const date = new Date(parseInt(`${year}`), month - 1, day + 30);

  const thDay = date.getDate().toString().padStart(2, '0');
  const thMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const thYear = date.getFullYear().toString()

  return `${thDay}${thMonth}${thYear}`;
};

export const getCurrentDateString = () => {
  const now = new Date();

  // Get the day of the month (DD)
  const day = String(now.getDate()).padStart(2, '0');

  // Get the month abbreviation (Mon)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthAbbr = monthNames[now.getMonth()];

  // Get the month number (MM), padded with a leading zero if needed
  const monthNum = String(now.getMonth() + 1).padStart(2, '0'); // +1 because getMonth() is 0-indexed

  // Get the full year (YYYY)
  const year = now.getFullYear();

  return `${day}${monthAbbr}${monthNum}${year}`;
};

export const getYesterdayDateString = () => {
  const now = new Date();

  // Subtract 1 day
  now.setDate(now.getDate() - 1);

  // Get the day of the month (DD)
  const day = String(now.getDate()).padStart(2, "0");

  // Get the month abbreviation (Mon)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthAbbr = monthNames[now.getMonth()];

  // Get the month number (MM), padded with a leading zero if needed
  const monthNum = String(now.getMonth() + 1).padStart(2, "0");

  // Get the full year (YYYY)
  const year = now.getFullYear();

  return `${day}${monthAbbr}${monthNum}${year}`;
};


export const getCurrentTimeString = () => {
  const now = new Date();

  // Get the hours (HH) in 24-hour format
  const hours = String(now.getHours()).padStart(2, '0');

  // Get the minutes (MM)
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}${minutes}`;
};
