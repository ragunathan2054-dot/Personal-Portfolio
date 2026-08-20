export function errorHandler(err, req, res, next) {
  console.error(err.stack); // full detail stays in server logs only

  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message;


  res.status(status).json({ error: message });
}