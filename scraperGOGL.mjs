import fetch from 'node-fetch';
import xml2js from 'xml2js';

async function fetchGoogleNewsRSS(countryCode = 'US', languageCode = 'en') {
    const url = `https://news.google.com/rss?hl=${languageCode}-${countryCode}&gl=${countryCode}&ceid=${countryCode}:${languageCode}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const xmlText = await response.text();
        const parser = new xml2js.Parser({ explicitArray: false });

        parser.parseString(xmlText, (err, result) => {
            if (err) {
                throw new Error(`Failed to parse XML: ${err}`);
            }

            const items = result.rss.channel.item;
            items.forEach(item => {
                const cleanedDescription = cleanDescription(item.description);
                console.log(`Title: ${item.title}`);
                console.log(`Link: ${item.link}`);
                console.log(`Date: ${item.pubDate}`);
                console.log(`Description: ${cleanedDescription}`);
                console.log('\n' + '-'.repeat(80) + '\n');
            });
        });
    } catch (error) {
        console.error(error);
    }
}

function cleanDescription(description) {
    const regex = /<a href="[^"]+" target="_blank">([^<]+)<\/a>/g;
    const matches = [];
    let match;
    while ((match = regex.exec(description)) !== null) {
        matches.push(match[1]);
    }
    return matches.join(' | ');
}

fetchGoogleNewsRSS(); // You can provide countryCode and languageCode as arguments
