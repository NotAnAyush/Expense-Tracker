/**
 * ApiResponse Helper — Standardized JSON API Responses
 */
class ApiResponse {
  /**
   * Send a successful JSON response
   */
  static success(res, data = {}, message = undefined, statusCode = 200) {
    const payload = {
      status: 'success',
      ...(message && { message }),
      ...(typeof data === 'object' && !Array.isArray(data) ? data : { data }),
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a structured error response
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = undefined) {
    return res.status(statusCode).json({
      status: 'error',
      message,
      ...(errors && { errors }),
    });
  }

  /**
   * Send a standardized paginated response
   */
  static paginated(res, items = [], page = 1, limit = 50, total = 0, extra = {}) {
    const totalPages = Math.ceil(total / Number(limit)) || 1;
    return res.status(200).json({
      status: 'success',
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: totalPages,
      },
      ...extra,
    });
  }
}

module.exports = ApiResponse;
