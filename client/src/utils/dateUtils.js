import { format, isToday as isDateToday, isYesterday as isDateYesterday, formatDistanceToNow } from 'date-fns';

export const formatTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  const now = new Date();
  
  // If it's today, show just time
  if (isDateToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }
  
  // If it's yesterday, show "Yesterday"
  if (isDateYesterday(messageDate)) {
    return 'Yesterday';
  }
  
  // If it's within a week, show day name
  const daysDiff = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return format(messageDate, 'EEEE');
  }
  
  // If it's within the current year, show date without year
  if (messageDate.getFullYear() === now.getFullYear()) {
    return format(messageDate, 'MMM d');
  }
  
  // Otherwise, show full date
  return format(messageDate, 'MMM d, yyyy');
};

export const formatDate = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  return format(messageDate, 'MMMM d, yyyy');
};

export const formatLastSeen = (date) => {
  if (!date) return 'Never';
  
  const lastSeenDate = new Date(date);
  const now = new Date();
  
  // If it's within the last minute
  const secondsDiff = Math.floor((now - lastSeenDate) / 1000);
  if (secondsDiff < 60) {
    return 'just now';
  }
  
  // If it's within the last hour
  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) {
    return `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'} ago`;
  }
  
  // If it's today
  if (isDateToday(lastSeenDate)) {
    return `today at ${format(lastSeenDate, 'HH:mm')}`;
  }
  
  // If it's yesterday
  if (isDateYesterday(lastSeenDate)) {
    return `yesterday at ${format(lastSeenDate, 'HH:mm')}`;
  }
  
  // If it's within a week
  const daysDiff = Math.floor((now - lastSeenDate) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return `${format(lastSeenDate, 'EEEE')} at ${format(lastSeenDate, 'HH:mm')}`;
  }
  
  // Otherwise use relative time
  return formatDistanceToNow(lastSeenDate, { addSuffix: true });
};

export const isToday = (date) => {
  return isDateToday(new Date(date));
};

export const isYesterday = (date) => {
  return isDateYesterday(new Date(date));
};

export const formatMessageTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
};

export const formatChatTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  
  if (isDateToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }
  
  if (isDateYesterday(messageDate)) {
    return 'Yesterday';
  }
  
  return format(messageDate, 'MMM d');
};
