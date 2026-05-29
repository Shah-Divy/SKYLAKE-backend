const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let cachedSecret = null;

/**
 * Resolves the JWT secret key following a multi-tiered secure strategy:
 * 1. Checks environment variable
 * 2. Checks file-based persistent key
 * 3. Falls back to generating a secure random ephemeral key in-memory
 */
function getSecret() {
  if (cachedSecret) return cachedSecret;

  if (process.env.JWT_SECRET) {
    cachedSecret = process.env.JWT_SECRET;
    return cachedSecret;
  }

  // Check localized persistent file
  const secretPath = path.join(__dirname, '../../jwt_secret.txt');
  try {
    if (fs.existsSync(secretPath)) {
      cachedSecret = fs.readFileSync(secretPath, 'utf-8').trim();
      if (cachedSecret) return cachedSecret;
    }
  } catch (err) {
    console.error('Failed to read persistent secret file:', err.message);
  }

  console.warn("Generating ephemeral secret. Instance-isolated!");
  const ephemeral = crypto.randomBytes(32).toString('hex');
  
  try {
    fs.writeFileSync(secretPath, ephemeral, { encoding: 'utf-8', mode: 0o600 });
    cachedSecret = ephemeral;
  } catch (err) {
    console.warn('Could not persist ephemeral secret to disk, using in-memory only.');
    cachedSecret = ephemeral;
  }

  return cachedSecret;
}

module.exports = {
  getSecret
};
