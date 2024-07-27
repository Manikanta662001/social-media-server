export function formatTime(date) {
  const dateObj = new Date(date);
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;

  const strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

export const getFullName = (user) => {
  if (user) {
    return `${user?.firstName} ${user?.lastName}`;
  }
  return "";
};
