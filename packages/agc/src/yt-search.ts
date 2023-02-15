import * as yt from 'youtube-search-without-api-key';

export async function search_yt(term: string) {
  /**
   * Given a search query, searching on youtube
   * @param {string} search value (string or videoId).
   */
  const videos = await yt.search(term);
  console.log(videos);
}
