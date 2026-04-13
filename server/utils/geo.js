/**
 * Normalizes flat location object {lat, lng} into GeoJSON Point format
 * @param {Object} location - The location object from client
 * @returns {Object|null} - GeoJSON Point object or null if invalid
 */
const normalizeLocation = (location) => {
  if (!location) return null;
  
  // If already GeoJSON
  if (location.type === 'Point' && Array.isArray(location.coordinates)) {
    return location;
  }

  // If flat format {lat, lng}
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return {
      type: 'Point',
      coordinates: [location.lng, location.lat], // GeoJSON uses [lng, lat]
    };
  }

  return null;
};

module.exports = { normalizeLocation };
