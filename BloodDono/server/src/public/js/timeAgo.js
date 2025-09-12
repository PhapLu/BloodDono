// public/js/timeAgo.js

function timeAgo(date) {
  const now = new Date();
  const diff = Math.abs(now - new Date(date)); // Convert string to Date object

  const minutes = Math.floor(diff / (1000 * 60)); // Convert milliseconds to minutes
  const hours = Math.floor(minutes / 60); // Convert minutes to hours

  if (minutes < 1) {
      return 'just now';
  } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const dateElements = document.querySelectorAll('.thread-list__date');

  dateElements.forEach(function (element) {
      const date = element.getAttribute('data-date');
      element.textContent = timeAgo(date);
  });
});