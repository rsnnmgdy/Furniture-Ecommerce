// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const colors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Cancelled: 'error',
    Refunded: 'default',
  };
  return colors[status] || 'default';
};

// Validate email
export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// Get image URL or placeholder
export const getImageUrl = (image, placeholder = '/placeholder.jpg') => {
  return image?.url || placeholder;
};
