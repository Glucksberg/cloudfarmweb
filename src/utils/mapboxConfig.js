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
    console.log('🧹 Starting gentle map cleanup...');

    // DON'T abort the controller immediately - this causes tile AbortErrors
    // Instead, mark it as aborted for our event handlers only
    let isCleaningUp = false;
    if (abortController) {
      isCleaningUp = true;
    }

    if (mapRef.current) {
      try {
        console.log('🔇 Removing event listeners gently...');

        // Remove specific event listeners instead of all at once
        const events = ['load', 'error', 'styledata', 'sourcedata', 'click', 'mouseenter', 'mouseleave'];
        events.forEach(event => {
          try {
            mapRef.current.off(event);
          } catch (e) {
            // Ignore errors for events that don't exist
          }
        });

        // Store reference and clear immediately to prevent further operations
        const mapToRemove = mapRef.current;
        mapRef.current = null;

        // Very gentle cleanup with longer delay to let tiles finish
        setTimeout(() => {
          try {
            if (mapToRemove && !mapToRemove._removed) {
              console.log('🗑️ Removing map instance gently...');

              // Let Mapbox finish any pending operations before removal
              mapToRemove.remove();
              console.log('✅ Map cleanup completed successfully');
            }
          } catch (removeError) {
            console.warn('⚠️ Map removal error (IGNORED):', removeError.message);
          }

          // Only abort the controller after map is safely removed
          if (abortController && !abortController.signal.aborted) {
            try {
              abortController.abort();
            } catch (abortErr) {
              // Ignore abort errors
            }
          }
        }, 300); // Longer delay to let Mapbox finish tile operations

      } catch (cleanupError) {
        console.warn('⚠️ General cleanup error (IGNORED):', cleanupError.message);
      }
    }
  };
};

export const createSafeEventHandlers = (abortController) => {
  let componentMounted = true;

  // Use a simple flag instead of relying on abortController.signal
  if (abortController) {
    const originalAbort = abortController.abort.bind(abortController);
    abortController.abort = () => {
      componentMounted = false;
      // Don't actually abort yet - wait for cleanup
    };
  }

  return {
    onLoad: (callback) => {
      return () => {
        if (!componentMounted) {
          console.log('⏹️ Load event ignored - component unmounted');
          return;
        }

        try {
          callback();
        } catch (error) {
          console.warn('⚠️ Error in load callback (IGNORED):', error.message);
        }
      };
    },

    onError: (callback) => {
      return (e) => {
        if (!componentMounted) {
          console.log('⏹️ Error event ignored - component unmounted');
          return;
        }

        // Ignore network-related errors and abort errors
        const errorMsg = e.error?.message || 'Unknown error';
        if (errorMsg.includes('Failed to fetch') ||
            errorMsg.includes('NetworkError') ||
            errorMsg.includes('fetch') ||
            errorMsg.includes('Telemetry blocked') ||
            errorMsg.includes('AbortError') ||
            errorMsg.includes('signal is aborted')) {
          console.warn('⚠️ Ignoring expected network/abort error:', errorMsg);
          return;
        }

        try {
          callback(e);
        } catch (error) {
          console.warn('⚠️ Error in error callback (IGNORED):', error.message);
        }
      };
    },

    // Helper to check if component is still mounted
    isMounted: () => componentMounted
  };
};

// Initialize telemetry blocking immediately when this module is imported
blockMapboxTelemetry();

// Additional error suppression for AbortErrors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');

    // Suppress known Mapbox AbortErrors that we can't prevent
    if (message.includes('AbortError: signal is aborted without reason') ||
        message.includes('AbortError') && message.includes('tile') ||
        message.includes('_abortTile') ||
        message.includes('_removeTile')) {
      console.warn('🔇 Suppressed Mapbox AbortError (expected):', message.substring(0, 100) + '...');
      return;
    }

    return originalConsoleError.apply(this, args);
  };
}
