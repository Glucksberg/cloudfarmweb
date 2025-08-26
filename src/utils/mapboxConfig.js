// Mapbox Anti-Telemetry Configuration
// Centralizes all telemetry blocking logic

let telemetryBlocked = false;

export const blockMapboxTelemetry = () => {
  if (telemetryBlocked || typeof window === 'undefined') return;
  
  console.log('🚫 Initializing Mapbox telemetry blocker...');
  
  // Block Mapbox telemetry at the fetch level
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    // Block Mapbox analytics/telemetry requests
    if (typeof url === 'string' && (
      url.includes('events.mapbox.com') ||
      url.includes('/events/') ||
      url.includes('/turnstile') ||
      url.includes('/performance') ||
      url.includes('/telemetry') ||
      url.includes('analytics')
    )) {
      console.log('🚫 Blocked telemetry request:', url.substring(0, 100) + '...');
      return Promise.reject(new Error('Telemetry blocked by anti-telemetry system'));
    }
    
    return originalFetch.apply(this, args);
  };
  
  // Block at XMLHttpRequest level too
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && (
      url.includes('events.mapbox.com') ||
      url.includes('/events/') ||
      url.includes('/turnstile') ||
      url.includes('/performance') ||
      url.includes('/telemetry')
    )) {
      console.log('🚫 Blocked XHR telemetry request:', url);
      // Return empty response
      this.addEventListener('loadstart', () => {
        this.abort();
      });
    }
    return originalXHROpen.call(this, method, url, ...args);
  };
  
  telemetryBlocked = true;
  console.log('✅ Mapbox telemetry blocker active');
};

export const getRestrictiveMapConfig = (container, style = 'mapbox://styles/mapbox/streets-v11', center = [-47.15, -15.48], zoom = 10) => {
  return {
    container,
    style,
    center,
    zoom,
    // Disable all tracking and telemetry
    attributionControl: false,
    logoPosition: 'bottom-right',
    collectResourceTiming: false,
    trackResize: false,
    // Reduce network requests
    maxParallelImageRequests: 4,
    maxTileCacheSize: 50,
    // Request transformer to block analytics
    transformRequest: (url, resourceType) => {
      // Block analytics requests at the map level too
      if (url.includes('/events/') || 
          url.includes('telemetry') || 
          url.includes('analytics') ||
          url.includes('performance') ||
          url.includes('/turnstile')) {
        console.log('🚫 Map-level blocked request:', url.substring(0, 50) + '...');
        return { url: '', headers: {} };
      }
      return { url };
    }
  };
};

export const createSafeMapCleanup = (mapRef, abortController) => {
  return () => {
    console.log('🧹 Starting safe map cleanup...');
    
    if (abortController) {
      abortController.abort();
    }
    
    if (mapRef.current) {
      try {
        console.log('🔇 Removing all event listeners...');
        mapRef.current.off();
        
        // Force stop any ongoing requests
        if (mapRef.current._requestManager) {
          try {
            mapRef.current._requestManager.abort();
          } catch (abortError) {
            console.warn('Could not abort request manager:', abortError.message);
          }
        }
        
        // Store reference and clear immediately
        const mapToRemove = mapRef.current;
        mapRef.current = null;
        
        // Delayed removal to prevent AbortError
        setTimeout(() => {
          try {
            if (mapToRemove && !mapToRemove._removed) {
              console.log('🗑️ Removing map instance...');
              mapToRemove.remove();
              console.log('✅ Map cleanup completed successfully');
            }
          } catch (removeError) {
            console.warn('⚠️ Map removal error (IGNORED):', removeError.message);
          }
        }, 100); // Increased delay for more robust cleanup
        
      } catch (cleanupError) {
        console.warn('⚠️ General cleanup error (IGNORED):', cleanupError.message);
      }
    }
  };
};

export const createSafeEventHandlers = (abortController) => {
  return {
    onLoad: (callback) => {
      return () => {
        if (abortController?.signal.aborted) {
          console.log('⏹️ Load event ignored - component unmounted');
          return;
        }
        callback();
      };
    },
    
    onError: (callback) => {
      return (e) => {
        if (abortController?.signal.aborted) {
          console.log('⏹️ Error event ignored - component unmounted');
          return;
        }
        
        // Ignore network-related errors that we can't control
        const errorMsg = e.error?.message || 'Unknown error';
        if (errorMsg.includes('Failed to fetch') || 
            errorMsg.includes('NetworkError') ||
            errorMsg.includes('fetch') ||
            errorMsg.includes('Telemetry blocked')) {
          console.warn('⚠️ Ignoring expected network error:', errorMsg);
          return;
        }
        
        callback(e);
      };
    }
  };
};

// Initialize telemetry blocking immediately when this module is imported
blockMapboxTelemetry();
