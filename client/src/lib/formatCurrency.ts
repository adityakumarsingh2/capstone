export const formatPrice = (price: number): string => {
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
};
