export function errorHandler(err, req, res, next) {
  console.error(err.stack); // full detail stays in server logs only

  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message;

  // Never send raw error detail to the client in production — a stack trace
  // reveals your file paths, libraries, and code structure to an attacker.
  res.status(status).json({ error: message });
}