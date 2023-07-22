const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const REQUEST_MAX_TIMEOUT = 500; // milliseconds

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URL parameters' });
  }

  const validURLs = urls.filter(url => isValidURL(url));

  if (validURLs.length === 0) {
    return res.status(400).json({ error: 'No valid URLs found' });
  }

  try {
    const numberPromises = validURLs.map(url => axios.get(url, { timeout: REQUEST_MAX_TIMEOUT }));
    const responses = await Promise.allSettled(numberPromises);

    const numbers = responses
      .filter(response => response.status === 'fulfilled' && Array.isArray(response.value.data?.numbers))
      .flatMap(response => response.value.data.numbers);

    const unique = Array.from(new Set(numbers)).sort((a, b) => a - b);

    res.json({ numbers: unique });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving numbers' });
  }
});

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

app.listen(PORT, () => {
  console.log("server has started");
});
