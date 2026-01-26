export function formatTweetDate(dateString: string) {
  if (!dateString) return "";

  const safeDateString = dateString.replace(/-/g, '/');

  const date = new Date(safeDateString);

  if (isNaN(date.getTime())) {

    const originalDate = new Date(dateString);
    if (!isNaN(originalDate.getTime())) {
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(originalDate);
    }
    return dateString; 
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',

  }).format(date);
}