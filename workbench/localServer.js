// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Serve static files from current directory
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint
app.get('/api/co2data', async (req, res) => {
    try {
        const response = await axios.get('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching CO2 data');
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
