const parsRSS = (data) => {
  const parser = new DOMParser();
  const rssXML = parser.parseFromString(data, "text/xml");
  const rssItems = rssXML.getElementsByTagName("item");

  const posts = Array.from(rssItems).map((rssItem) => {
    const postTitle = rssItem.querySelector("title").textContent;
    const postDescription = rssItem.querySelector("description").textContent;
    const postHref = rssItem.querySelector("link").textContent;

    return { postTitle, postDescription, postHref };
  });

  const feedTitle = rssXML.querySelector("channel > title").textContent;
  const feedDescription = rssXML.querySelector(
    "channel > description"
  ).textContent;

  return { feedTitle, feedDescription, posts };
};

export default parsRSS;

//rss
// https://aljazeera.com/xml/rss/all.xml
// https://buzzfeed.com/world.xml
// https://thecipherbrief.com/feed
// https://rt.com/rss/news
// http://www.dp.ru/exportnews.xml
// http://www.fontanka.ru/fontanka.rss
// http://lenta.ru/l/r/EX/import.rss
