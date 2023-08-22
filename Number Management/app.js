const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;

app.get('/numbers', async (req, res) => {
    const urlParams = req.query.url;

    if (!urlParams) {
        return res.status(400).json({ error: 'No URLs provided' });
    }

    try {
        const urls = Array.isArray(urlParams) ? urlParams : [urlParams];
        const fetchPromises = urls.map(async (url) => {
            try {
                const response = await axios.get(url, { timeout: 500 });
                return response.data.numbers || [];
            } catch (error) {
                console.error(`Error fetching numbers from ${url}: ${error.message}`);
                return [];
            }
        });

        const fetchResults = await Promise.allSettled(fetchPromises);

        const uniqueNumbers = fetchResults
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value)
            .flat()
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort((a, b) => a - b);

        res.json({ numbers: uniqueNumbers });
    } catch (error) {
        console.error(`Error processing numbers: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`number-management-service is running on port ${PORT}`);
});
