const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRouter = require('./routes');
const errorHandler = require('./middlewares/errorMiddleware');
const ApiError = require('./utils/apiError');
const { HTTP_STATUS } = require('./constants');
const Admin = require('./models/Admin');

const app = express();

// 1. Establish Database Connection
connectDB().then(() => {
  // Database seeded on connection
  seedDefaultAdmin();
});

// 2. Setup Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allows frontends to view local static fallback images
}));

// CORS Configuration - Restricts access to trusted origins
const allowedOrigins = [
  'http://localhost:3000', // React default
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new ApiError(HTTP_STATUS.FORBIDDEN, 'CORS Policy violation: Origin blocked.'), false);
  },
  credentials: true,
}));

// 3. Setup Parser Middlewares
app.use(express.json({ limit: '20mb' })); // Protects against oversized payload exhaustion
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 4. Static Serving of Uploaded Assets (resilient fallback storage)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// 5. Mount Core Subrouters
app.use('/api', apiRouter);

// Root path diagnostic route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Industrial Automation Backend API is live.',
    version: '1.0.0'
  });
});

// 6. Route Not Found Interception (404)
app.all('*', (req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Resource route not found: ${req.originalUrl}`));
});

// 7. Centralized Error Mapping Middleware
app.use(errorHandler);

/**
 * Seeding default admin user on startup if database is completely empty
 */
async function seedDefaultAdmin() {
  try {
    const adminCount = await Admin.countDocuments({ isDeleted: false });
    if (adminCount === 0) {
      // Seed account password will be automatically hashed by Admin model's pre-save hook
      await Admin.create({
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('----------------------------------------------------');
      console.log('Default Administrator Seeding Complete!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('TODO(security): Change these credentials immediately in production!');
      console.log('----------------------------------------------------');
    }
  } catch (error) {
    console.error('Failed to seed default administrator account:', error.message);
  }
}

// 8. Bootstrap Express Listener
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1'; // Listen strictly on localhost to conform with secure coding practices

app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`Skylake Automation Server initialized successfully!`);
  console.log(`Environment Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Service URL: http://${HOST}:${PORT}`);
  console.log(`====================================================`);
});
