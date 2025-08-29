// ========================================
// 📋 CORS CONFIGURATION FOR VPS BACKEND
// ========================================
// 
// FILE TO EDIT: ~/CloudFarm/src/index.js
// 
// ADD THIS CODE after "const app = express();"
// ========================================

// CORS configuration for CloudFarm backend
app.use((req, res, next) => {
  // Allow all origins (for development)
  res.header('Access-Control-Allow-Origin', '*');
  
  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  
  // Allow specific headers
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ========================================
// COMMANDS TO EXECUTE ON VPS:
// ========================================
// 
// 1. SSH into VPS:
//    ssh root@178.156.157.146
//    cd ~/CloudFarm
// 
// 2. Edit main file:
//    nano src/index.js
// 
// 3. Add the code above after "const app = express();"
// 
// 4. Save and exit:
//    Ctrl+X, then Y, then Enter
// 
// 5. Restart server:
//    pm2 restart cloudfarm-api
// 
// 6. Check logs:
//    pm2 logs cloudfarm-api --lines 10
// 
// ========================================
// WHAT THIS DOES:
// ========================================
// 
// - Allows frontend (fly.dev) to make requests to backend (VPS)
// - Handles browser preflight OPTIONS requests
// - Sets proper CORS headers for cross-origin communication
// 
// ========================================
// VERIFICATION:
// ========================================
// 
// Test CORS with:
// curl -X OPTIONS http://178.156.157.146:3001/api/auth/login \
//   -H "Origin: https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev" \
//   -v
// 
// Should return Access-Control-Allow-* headers
// 
// ========================================
