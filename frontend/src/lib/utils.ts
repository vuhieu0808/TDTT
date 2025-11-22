export const formatChatTime = (timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): string => {
  if (!timestamp) return "";

  const date = new Date(
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
  );

  // return date.toString();

  // Sử dụng 'en-GB' để có định dạng dd/mm/yyyy
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // false = 24h (17:00), true = 12h (5:00 PM)
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
};