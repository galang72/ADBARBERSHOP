// Format utilities dengan error handling

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return '-';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    // Format manual 24 jam
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes} WIB`;
  } catch (e) {
    return '-';
  }
};

export const formatTime = (timeValue) => {
  if (!timeValue) return '-';
  try {
    // Handle time string format (e.g., "14:30:00" or "14:30")
    if (typeof timeValue === 'string' && timeValue.includes(':')) {
      const parts = timeValue.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes} WIB`;
    }
    // Handle Date object - format manual 24 jam
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} WIB`;
    }
    return '-';
  } catch (e) {
    return '-';
  }
};

export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  return new Intl.NumberFormat('id-ID').format(number);
};
