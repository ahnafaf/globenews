const express = require('express');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Send index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Add a proxy endpoint for fetching news
app.get('/news', async (req, res) => {
  const country = req.query.country;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(country)}&hl=en-US&gl=US&ceid=US:en`;
  
  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    const result = await parser.parseStringPromise(response.data);
    
    const newsItems = result.rss.channel.item.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.description,
      source: item.source,
      pubDate: item.pubDate
    }));

    res.json(newsItems);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Error fetching news' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
