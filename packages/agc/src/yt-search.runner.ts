import Nightmare from 'nightmare';
import path from 'upath';

const nightmare = new Nightmare({
  show: true,
  gotoTimeout: 70000,
  waitTimeout: 70000,
  paths: {
    userData: path.join(process.cwd(), 'tmp/cache/nightmare')
  }
});

nightmare
  .goto('https://www.youtube.com/results?search_query=chimeraland+level')
  .wait('yt-formatted-string')
  .evaluate(() => Array.from(document.querySelectorAll('ytd-video-renderer')).map((el) => el.innerHTML))
  .end()
  .then(console.log)
  .catch((error: any) => {
    console.error('Search failed:', error);
  });
