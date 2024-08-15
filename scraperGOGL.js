function fetchGoogleNewsRSS(countryCode = 'US', languageCode = 'en') {
    return new Promise((resolve, reject) => {
        const url = `/news?countryCode=${countryCode}&languageCode=${languageCode}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch news: ${response.statusText}`);
                }
                return response.text();
            })
            .then(xmlText => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                const items = xmlDoc.querySelectorAll("item");
                const newsItems = Array.from(items).map(item => ({
                    title: item.querySelector("title").textContent,
                    link: item.querySelector("link").textContent,
                    pubDate: item.querySelector("pubDate").textContent,
                    description: cleanDescription(item.querySelector("description").textContent)
                }));
                resolve(newsItems);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}
function cleanDescription(description) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    const links = tempDiv.querySelectorAll('a');
    return Array.from(links).map(link => link.textContent).join(' | ');
}

// Make the function globally available
window.fetchGoogleNewsRSS = fetchGoogleNewsRSS;
