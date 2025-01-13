# Detailed Render.com Deployment Guide for CO2 Proxy Server

## 1. Project Preparation

### Required Files

1. Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: co2-proxy
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    autoDeploy: true
    healthCheckPath: /health
```

2. Update `package.json`:
```json
{
  "name": "co2-proxy",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^2.6.9"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

3. Add `.gitignore`:
```
node_modules/
.env
.DS_Store
npm-debug.log
```

4. Update server.js to handle Render's health checks:
```javascript
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
```

## 2. Version Control Setup

1. Initialize Git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create GitHub repository:
   - Go to GitHub.com
   - Click "New repository"
   - Name it "co2-proxy"
   - Keep it public
   - Don't initialize with README
   - Copy the repository URL

3. Connect and push to GitHub:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## 3. Render.com Setup

1. Account Creation:
   - Go to render.com
   - Click "Sign Up"
   - Choose "Sign up with GitHub"
   - Authorize Render

2. New Web Service:
   - Click "New +" button
   - Select "Web Service"
   - Choose your GitHub repository
   - Render will auto-detect Node.js

3. Configuration:
   - Name: "co2-proxy" (or your preferred name)
   - Region: Choose closest to your users
   - Branch: main
   - Root Directory: ./
   - Environment: Node
   - Build Command: $ npm install
   - Start Command: $ node server.js
   - Plan: Free

4. Environment Variables:
   - Add via dashboard:
     - NODE_ENV: production
     - PORT: 10000
     - Add any other needed variables

## 4. Deployment Verification

1. Monitor Build:
   - Watch the deployment logs
   - Check for successful build completion
   - Verify health check endpoint

2. Test Endpoints:
```bash
# Test health endpoint
curl https://your-app-name.onrender.com/health

# Test CO2 data endpoint
curl https://your-app-name.onrender.com/api/co2-data
```

3. Update Client Code:
```javascript
const PROXY_URL = 'https://your-app-name.onrender.com';

async function fetchCO2Data() {
    try {
        const response = await fetch(`${PROXY_URL}/api/co2-data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        return parseCO2Data(data);
    } catch (error) {
        console.error('Error fetching CO2 data:', error);
        throw error;
    }
}
```

## 5. Monitoring and Maintenance

1. Set Up Logging:
```javascript
// Add to server.js
const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
};

app.use(requestLogger);
```

2. View Logs:
   - Go to your service dashboard
   - Click "Logs" tab
   - Filter by "System" or "Deploy"

3. Monitor Usage:
   - Check Render dashboard metrics
   - Monitor response times
   - Track error rates

## 6. Common Issues and Solutions

### Cold Starts
- Free tier services spin down after 15 minutes of inactivity
- Solution: Implement aggressive caching
- Add warning in logs about cold starts

### Memory Usage
- Free tier has 512 MB RAM limit
- Monitor memory usage in health checks
- Implement cleanup for large responses

### CORS Issues
Add specific CORS configuration:
```javascript
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
```
