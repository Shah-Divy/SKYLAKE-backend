/**
 * System-wide Constants
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
};

const POLICY_TYPE = {
  SHIPPING: 'shipping',
  REFUND: 'refund',
};

const FILE_LIMITS = {
  IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  PDF_SIZE: 10 * 1024 * 1024,  // 10MB
  ZIP_SIZE: 25 * 1024 * 1024,  // 25MB
};

module.exports = {
  HTTP_STATUS,
  STATUS,
  MEDIA_TYPE,
  POLICY_TYPE,
  FILE_LIMITS,
};
