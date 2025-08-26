// Mapbox configuration and utilities

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';

// Test if Mapbox token is valid
export const testMapboxToken = async (token = MAPBOX_TOKEN) => {
  try {
    // Use AbortController with timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=${token}`, {
      signal: controller.signal,
      method: 'HEAD', // Use HEAD instead of GET to reduce data transfer
      cache: 'no-cache'
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Mapbox token is valid');
      return { valid: true, status: response.status };
    } else {
      console.error('❌ Mapbox token validation failed:', response.status, response.statusText);
      return { valid: false, status: response.status, error: response.statusText };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Token validation timeout');
      return { valid: false, error: 'Timeout - check network connection' };
    }
    console.error('❌ Network error testing Mapbox token:', error);
    return { valid: false, error: `Network error: ${error.message}` };
  }
};

// Get fallback map style if main one fails
export const getFallbackStyle = () => {
  return 'mapbox://styles/mapbox/streets-v12'; // Simple streets instead of satellite
};

// Mapbox initialization configuration
export const getMapboxConfig = () => ({
  accessToken: MAPBOX_TOKEN,
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  fallbackStyle: getFallbackStyle(),
  center: [-47.15, -15.48],
  zoom: 12,
  // Simple transform request without signals (not serializable)
  transformRequest: (url, resourceType) => ({
    url: url,
    credentials: 'omit' // Prevent CORS issues
  })
});

// Handle Mapbox errors gracefully
export const handleMapboxError = (error, mapInstance) => {
  // Ignore abort errors as they're expected during cleanup
  if (error?.name === 'AbortError') {
    console.log('📋 Request aborted (expected during cleanup)');
    return error;
  }

  console.error('🚫 Mapbox Error:', error);

  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    console.log('🔄 Network error detected, attempting fallback...');

    // Try to switch to fallback style
    if (mapInstance && mapInstance.setStyle) {
      try {
        mapInstance.setStyle(getFallbackStyle());
        console.log('✅ Switched to fallback map style');
      } catch (fallbackError) {
        // Don't log abort errors from fallback
        if (fallbackError?.name !== 'AbortError') {
          console.error('❌ Fallback style also failed:', fallbackError);
        }
      }
    }
  }

  return error;
};
