// Standard API response helpers

export const successResponse = (data: any, message = 'Success') => ({
  success: true,
  message,
  data
});

export const errorResponse = (message = 'Error', statusCode = 500) => ({
  success: false,
  message,
  statusCode
});