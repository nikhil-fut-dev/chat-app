const errorHandler = (err, req, res, next) => {
  console.error("========== ERROR ==========");
  console.error(err);
  console.error(err.stack);
  console.error("===========================");

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
