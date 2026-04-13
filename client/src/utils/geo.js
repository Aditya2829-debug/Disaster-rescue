/**
 * Extracts coordinates from either GeoJSON or legacy {lat, lng} format.
 * Returns [lat, lng] for Leaflet compatibility.
 * @param {Object} location - The location object from either source
 * @returns {Array|null} - [latitude, longitude] or null if invalid
 */
export const getCoords = (location) => {
  if (!location) return null;

  // Handle GeoJSON format
  if (location.type === 'Point' && Array.isArray(location.coordinates)) {
    const [lng, lat] = location.coordinates;
    return [lat, lng];
  }

  // Handle legacy flat format
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return [location.lat, location.lng];
  }

  return null;
};

/**
 * Formats coordinates for display.
 * @param {Object} location - The location object
 * @returns {string} - Formatted string or 'Unknown'
 */
export const formatLocation = (location) => {
  const coords = getCoords(location);
  if (!coords) return 'Unknown';
  return `${coords[0].toFixed(5)}°N, ${coords[1].toFixed(5)}°E`;
};
