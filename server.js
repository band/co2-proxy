const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
//const rateLimit = require('express-rate-limit');
//const helmet = require('helmet');

const app = express();

// Use environment variables for configuration
const PORT = process.env.PORT || 3000;

// Security middleware
//app.use(helmet());

// Rate limiting
/*
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
*/

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://praxis101.net', // Replace with your actual frontend domain
            'https://co2-proxy.onrender.com'  // Replace with your Render domain
          ]
        : 'http://localhost:3000',
    optionsSuccessStatus: 200
};
//app.use(cors(corsOptions));
app.use(cors());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Proxy endpoint with caching
let cachedData = null;
let lastFetch = 0;
//const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const CACHE_DURATION = 60 * 2 * 1000 // 2 minutes

app.get('/api/co2data', async (req, res) => {
    try {
        // Check cache
        const now = Date.now();
        if (cachedData && (now - lastFetch < CACHE_DURATION)) {
						console.log('returning cachedData')
            return res.json(cachedData);
        }

        // Fetch new data
        const response = await axios.get('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt', {
            timeout: 5000,
            headers: {
                'User-Agent': 'CO2 Data Proxy Service'
            }
        });

        // Update cache
        cachedData = response.data;
        lastFetch = now;

//        res.send(response.data);
				res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        if (cachedData) {
            // Return cached data if available, with warning header
            res.setHeader('X-Data-Source', 'cache');
            return res.json(cachedData);
        }
        res.status(500).send('Error fetching CO2 data');
    }
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Error Handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
