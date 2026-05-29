const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Uploads a local multer file to Cloudinary.
 * If Cloudinary is not configured or an upload error occurs, it falls back to serving the file locally.
 * Automatically deletes the temporary local file if it was uploaded to Cloudinary.
 * 
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Returns the URL string of the uploaded file
 */
const uploadFile = async (file) => {
  if (!file) return null;

  const localUrl = `/uploads/${file.filename}`;

  // If Cloudinary is not configured, fall back to local file storage url
  if (!isCloudinaryConfigured()) {
    console.log(`Cloudinary is not configured. Serving file locally at: ${localUrl}`);
    return localUrl;
  }

  try {
    const ext = path.extname(file.originalname).toLowerCase();
    let folder = 'industrial_automation/others';
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      folder = 'industrial_automation/images';
    } else if (ext === '.pdf') {
      folder = 'industrial_automation/pdfs';
    } else if (ext === '.zip') {
      folder = 'industrial_automation/zipfiles';
    }

    const uploadResponse = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
      use_filename: false,
      unique_filename: true,
    });

    // Delete temporary local file after successful upload to free up disk space
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.warn('Failed to delete temporary local file after uploading to Cloudinary:', err.message);
    }

    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed, falling back to local file:', error.message);
    // Return local url fallback
    return localUrl;
  }
};

/**
 * Helper to delete a file. If it's a local url, deletes it from disk.
 * If it's a Cloudinary url, deletes it from the Cloudinary repository (optional).
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  if (fileUrl.startsWith('/uploads/')) {
    const filename = path.basename(fileUrl);
    const localPath = path.join(__dirname, '../../uploads', filename);
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`Deleted local file: ${localPath}`);
      }
    } catch (err) {
      console.error('Failed to delete local file:', err.message);
    }
  } else if (fileUrl.includes('cloudinary.com')) {
    // Optional: parse public ID and delete from Cloudinary
    try {
      const parts = fileUrl.split('/');
      const filename = parts.pop();
      const publicIdWithFolder = parts.slice(parts.indexOf('upload') + 2).join('/') + '/' + filename.split('.')[0];
      if (isCloudinaryConfigured()) {
        await cloudinary.uploader.destroy(publicIdWithFolder);
        console.log(`Deleted Cloudinary asset: ${publicIdWithFolder}`);
      }
    } catch (err) {
      console.error('Failed to delete Cloudinary asset:', err.message);
    }
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
