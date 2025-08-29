# 🚨 VPS Backend Completely Inaccessible - Troubleshooting Guide

## Problem Identified
Your VPS backend server at `178.156.157.146:3001` is completely unreachable, causing all "Failed to fetch" errors.

## 🔍 Root Cause Analysis
The errors indicate:
- ❌ Server not responding to HTTP requests
- ❌ WebSocket connections failing  
- ❌ All connection attempts timing out

This suggests one of:
1. **Backend server is offline/crashed**
2. **Firewall blocking port 3001**
3. **Backend not listening on external IP**
4. **VPS IP address changed**

## 🛠️ IMMEDIATE ACTIONS - Execute on Your VPS

### Step 1: Check Backend Process Status
```bash
# SSH into your VPS first
ssh your-user@178.156.157.146

# Check if CloudFarm backend is running
pm2 list

# Expected output should show 'cloudfarm-api' with status 'online'
# If NOT running, you'll see empty list or 'stopped' status
```

**If backend is NOT running:**
```bash
cd ~/CloudFarm
pm2 start src/index.js --name cloudfarm-api
pm2 save
```

### Step 2: Verify Port is Open and Listening
```bash
# Check if port 3001 is listening
netstat -tlnp | grep 3001

# Expected output: 
# tcp 0 0 0.0.0.0:3001 0.0.0.0:* LISTEN 1234/node

# If port is NOT listening, backend isn't running properly
```

### Step 3: Check Firewall Rules
```bash
# Check current firewall status
sudo ufw status

# Allow port 3001 if not already allowed
sudo ufw allow 3001

# Verify the rule was added
sudo ufw status numbered
```

### Step 4: Test Backend Locally on VPS
```bash
# Test if backend responds locally
curl -i http://localhost:3001/

# Expected: Should return some response (200 OK or similar)
# If this fails, backend has internal issues

# Test API health endpoint
curl -i http://localhost:3001/api/health

# Test externally accessible
curl -i http://178.156.157.146:3001/
```

### Step 5: Check Backend Logs
```bash
# View recent backend logs
pm2 logs cloudfarm-api --lines 50

# Look for:
# - Server startup messages
# - Port binding confirmations
# - Error messages
# - CORS configuration logs
```

## 🔧 Common Issues and Solutions

### Issue 1: Backend Not Running
**Symptoms:** `pm2 list` shows empty or 'stopped'
**Solution:**
```bash
cd ~/CloudFarm
npm install  # Ensure dependencies are installed
pm2 start src/index.js --name cloudfarm-api
pm2 startup  # Enable auto-start on reboot
pm2 save
```

### Issue 2: Backend Listening on Wrong IP
**Symptoms:** `netstat` shows `127.0.0.1:3001` instead of `0.0.0.0:3001`
**Solution:** Check your backend `src/index.js`:
```javascript
// Should be:
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:3001');
});

// NOT:
app.listen(3001, 'localhost', () => { ... });
```

### Issue 3: Firewall Blocking
**Symptoms:** Local curl works, external curl fails
**Solution:**
```bash
sudo ufw allow 3001
sudo ufw reload

# For stricter security, allow only from specific IPs:
# sudo ufw allow from 0.0.0.0/0 to any port 3001
```

### Issue 4: PM2 Process Crashed
**Symptoms:** PM2 shows 'errored' or keeps restarting
**Solution:**
```bash
pm2 logs cloudfarm-api  # Check error logs
pm2 restart cloudfarm-api
pm2 monit  # Monitor real-time
```

### Issue 5: Backend Code Errors
**Symptoms:** Process starts but crashes immediately
**Solution:**
```bash
# Check logs for errors
pm2 logs cloudfarm-api --err

# Test backend manually
cd ~/CloudFarm
node src/index.js  # Run directly to see errors
```

## 📋 Verification Checklist

After making changes, verify each step:

- [ ] `pm2 list` shows 'cloudfarm-api' status 'online'
- [ ] `netstat -tlnp | grep 3001` shows process listening on `0.0.0.0:3001`
- [ ] `sudo ufw status` shows port 3001 allowed
- [ ] `curl http://localhost:3001/` returns response
- [ ] `curl http://178.156.157.146:3001/` returns response from external
- [ ] `pm2 logs cloudfarm-api` shows no critical errors

## 🎯 Expected Backend Configuration

Your backend should have these settings:

### src/index.js
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev';

// CORS middleware BEFORE other middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Other middleware after CORS...
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'CloudFarm API running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0' });
});

// Start server on external IP
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CloudFarm API running on 0.0.0.0:${PORT}`);
  console.log(`📡 CORS origin: ${CORS_ORIGIN}`);
});
```

### .env (Backend)
```bash
PORT=3001
CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev
NODE_ENV=production
```

## 🆘 Emergency Recovery

If nothing works:

1. **Restart VPS completely:**
   ```bash
   sudo reboot
   ```

2. **After reboot, manually start everything:**
   ```bash
   cd ~/CloudFarm
   npm install
   pm2 start src/index.js --name cloudfarm-api
   pm2 startup
   pm2 save
   ```

3. **Test step by step:**
   ```bash
   pm2 list
   netstat -tlnp | grep 3001
   curl http://localhost:3001/
   curl http://178.156.157.146:3001/
   ```

## 📞 Next Steps After Fix

Once your backend is accessible:

1. Refresh your frontend application
2. The simplified VPS checker should show successful connections
3. The connection status should change from red to green
4. You should be able to log in and access CloudFarm features

## 🚨 If Still Not Working

If you've tried everything above and it still doesn't work:

1. Check if your VPS provider changed your IP address
2. Verify your VPS is actually running (not suspended/stopped)
3. Check if there are network routing issues
4. Consider redeploying the backend completely

The root issue is at the VPS level - the frontend code is working correctly but cannot reach your backend server.
