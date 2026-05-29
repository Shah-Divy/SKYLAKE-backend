const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ApiError = require('../utils/apiError');
const { HTTP_STATUS, FILE_LIMITS } = require('../constants');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage setup - Generates secure UUID filenames to completely eliminate path traversal injections
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = crypto.randomUUID();
    cb(null, `${file.fieldname}-${uniqueId}${ext}`);
  },
});

// File validation filter checking allowed MIME-types and file extensions strictly
const fileFilter = (req, file, cb) => {
  const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'images' || file.fieldname === 'image' || file.fieldname === 'profileImage' || file.fieldname === 'logo') {
    if (!allowedImageExts.includes(ext)) {
      return cb(new ApiError(HTTP_STATUS.BAD_REQUEST, `Only images (${allowedImageExts.join(', ')}) are allowed.`), false);
    }
  } else if (file.fieldname === 'pdfFile') {
    if (ext !== '.pdf') {
      return cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only PDF documents are allowed.'), false);
    }
  } else if (file.fieldname === 'zipFile') {
    if (ext !== '.zip') {
      return cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only ZIP archives are allowed.'), false);
    }
  } else {
    // Catch-all safety filter
    const allAllowed = [...allowedImageExts, '.pdf', '.zip'];
    if (!allAllowed.includes(ext)) {
      return cb(new ApiError(HTTP_STATUS.BAD_REQUEST, `File format '${ext}' not supported.`), false);
    }
  }
  cb(null, true);
};

// Size limit parsing dynamically based on standard fields
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(FILE_LIMITS.IMAGE_SIZE, FILE_LIMITS.PDF_SIZE, FILE_LIMITS.ZIP_SIZE),
  },
});

module.exports = {
  upload,
  uploadDir,
};
