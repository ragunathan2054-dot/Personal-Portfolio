// Express 4 does not catch errors thrown by async route handlers: the request
// just hangs. This passes them on to the error handler instead.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
