// Add this near your other endpoint definitions
app.get('/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        status: 'OK'
    };
    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = error;
        res.status(503).json(healthcheck);
    }
});
