import Nightmare from 'nightmare';
const nightmare = Nightmare({ show: true });

nightmare
  .goto('https://www.youtube.com/results?search_query=chimeraland+level')
  .wait('yt-formatted-string')
  .evaluate(() => document.querySelector('yt-formatted-string').textContent)
  .end()
  .then(console.log)
  .catch((error: any) => {
    console.error('Search failed:', error);
  });
