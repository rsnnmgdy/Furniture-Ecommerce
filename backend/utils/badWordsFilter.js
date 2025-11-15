const Filter = require('bad-words');

// Initialize bad words filter (Unit 1 requirement)
const filter = new Filter();

// Add custom furniture-related bad words if needed
const customBadWords = [
  // Add any custom words you want to filter
  'scam',
  'fake',
  'garbage'
];

filter.addWords(...customBadWords);

// Filter text and return cleaned version
exports.filterBadWords = (text) => {
  if (!text) return text;
  try {
    // FIX: Using filter.clean() replaces bad words with ***
    return filter.clean(text);
  } catch (error) {
    console.error('Bad words filter error:', error);
    return text;
  }
};

// Check if text contains bad words
exports.hasBadWords = (text) => {
  if (!text) return false;
  try {
    return filter.isProfane(text);
  } catch (error) {
    console.error('Bad words check error:', error);
    return false;
  }
};

// Get filtered version with asterisks (Same as filterBadWords now)
exports.maskBadWords = (text) => {
  if (!text) return text;
  try {
    // FIX: Using filter.clean() which masks the words
    return filter.clean(text);
  } catch (error) {
    console.error('Bad words mask error:', error);
    return text;
  }
};

module.exports = exports;