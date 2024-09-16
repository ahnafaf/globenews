const express = require('express');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Parse URL-encoded bodies (form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

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

// Add an endpoint for sending emails
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  const mailOptions = {
    from: email,
    to: 'muzammilmuhammad12@gmail.com', // Replace with your email address
    subject: `Message from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
