// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log the error (you can log it to a file or monitoring system if needed)
    console.error(err);
  
    // Set the status code, defaulting to 500 (Internal Server Error) if no specific code is set
    const statusCode = err.statusCode || 500;
  
    // Send a response with the error message and status code
    res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong! Please try again later.",
      // Optionally, you can send stack trace for development purposes (remove in production)
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  };
  
  export { errorHandler };
  
