process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/project-manager-test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-key-32-chars-long-minimum";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
process.env.SMTP_HOST = process.env.SMTP_HOST || "smtp.test.com";
process.env.SMTP_PORT = process.env.SMTP_PORT || "587";
process.env.SMTP_USER = process.env.SMTP_USER || "test@test.com";
process.env.SMTP_PASS = process.env.SMTP_PASS || "testpassword";
process.env.FROM_EMAIL = process.env.FROM_EMAIL || "test@test.com";
