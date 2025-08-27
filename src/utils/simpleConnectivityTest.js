// Simple connectivity test utility
// For when the main CloudFarmAPI has CORS issues

export const testBasicConnectivity = async (url) => {
  console.log('🧪 Testing basic connectivity to:', url);
  
  try {
    // First try: Simple fetch to root
    const response = await Promise.race([
      fetch(url, {
        method: 'GET',
        mode: 'cors', // Explicitly request CORS
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      // Timeout after 5 seconds
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    ]);

    if (response.ok) {
      console.log('✅ Basic connectivity test passed');
      return { success: true, status: response.status };
    } else {
      console.log('⚠️ Server responded with error:', response.status);
      return { success: false, status: response.status, error: 'HTTP error' };
    }
  } catch (error) {
    console.log('❌ Connectivity test failed:', error.message);
    
    let errorType = 'unknown';
    let suggestion = '';
    
    if (error.message.includes('Failed to fetch')) {
      errorType = 'cors_or_network';
      suggestion = 'CORS not configured or server offline';
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout';
      suggestion = 'Server is too slow or unresponsive';
    } else if (error.message.includes('NetworkError')) {
      errorType = 'network';
      suggestion = 'Network connectivity issue';
    }
    
    return { 
      success: false, 
      error: error.message, 
      errorType, 
      suggestion 
    };
  }
};

export const testCloudFarmConnectivity = async () => {
  const vpsURL = 'http://178.156.157.146:3001';
  
  console.log('🔍 Running CloudFarm connectivity diagnostics...');
  
  const result = await testBasicConnectivity(vpsURL);
  
  if (result.success) {
    console.log('🎉 CloudFarm VPS is accessible!');
  } else {
    console.log('💡 CloudFarm VPS issue detected:');
    console.log('   Error:', result.error);
    console.log('   Type:', result.errorType);
    console.log('   Suggestion:', result.suggestion);
    
    if (result.errorType === 'cors_or_network') {
      console.log('🔧 Possible solutions:');
      console.log('   1. Configure CORS on VPS backend');
      console.log('   2. Check if pm2 is running: pm2 list');
      console.log('   3. Restart service: pm2 restart cloudfarm-api');
      console.log('   4. Use local development instead');
    }
  }
  
  return result;
};
