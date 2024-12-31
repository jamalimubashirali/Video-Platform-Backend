const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    // Execute the requestHandler (which is an async function)
    await requestHandler(req, res, next);
  } catch (error) {
    // Catch any errors and pass them to the next error handling middleware
    next(error);
  }
};

export { asyncHandler };

