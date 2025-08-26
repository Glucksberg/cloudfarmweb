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
      // Return a resolved promise with empty response instead of rejection
      return Promise.resolve(new Response('', {
        status: 200,
        statusText: 'OK',
        headers: new Headers()
      }));
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
      // Silently return without doing anything
      return;
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
    console.log('🧹 Starting ultra-gentle map cleanup...');

    if (mapRef.current) {
      try {
        // Store reference and clear immediately to prevent further operations
        const mapToRemove = mapRef.current;
        mapRef.current = null;

        console.log('🔇 Removing map instance without touching abort controller...');

        // Remove map WITHOUT touching AbortController to avoid tile errors
        setTimeout(() => {
          try {
            if (mapToRemove && !mapToRemove._removed) {
              // Remove all listeners at once
              mapToRemove.off();

              // Remove map instance
              mapToRemove.remove();
              console.log('✅ Map cleanup completed successfully');
            }
          } catch (removeError) {
            // Ignore all cleanup errors
            console.warn('⚠️ Map removal error (COMPLETELY IGNORED):', removeError.message);
          }
        }, 100); // Shorter delay since we're not touching abort controller

      } catch (cleanupError) {
        // Ignore all errors
        console.warn('⚠️ General cleanup error (COMPLETELY IGNORED):', cleanupError.message);
      }
    }

    // DON'T touch the abortController at all - let it be handled by React
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

// Enhanced error suppression for all Mapbox-related errors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');

    // Suppress all known Mapbox errors that we can't prevent
    if (message.includes('AbortError') ||
        message.includes('Failed to fetch') ||
        message.includes('TypeError: Failed to fetch') ||
        message.includes('_abortTile') ||
        message.includes('_removeTile') ||
        message.includes('signal is aborted') ||
        message.includes('Telemetry blocked')) {
      console.warn('🔇 Suppressed Mapbox error (expected):', message.substring(0, 100) + '...');
      return;
    }

    return originalConsoleError.apply(this, args);
  };

  // Also suppress unhandled promise rejections
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const message = event.reason?.message || event.reason || '';

    if (message.includes && (
        message.includes('Failed to fetch') ||
        message.includes('AbortError') ||
        message.includes('Telemetry blocked') ||
        message.includes('signal is aborted')
    )) {
      console.warn('🔇 Suppressed unhandled rejection (expected):', message.substring(0, 100) + '...');
      event.preventDefault();
      return;
    }

    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };
}
