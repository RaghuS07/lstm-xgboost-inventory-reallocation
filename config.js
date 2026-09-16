module.exports = {
  // Force supply-demand database - override any environment variable
  MONGO_URI: 'mongodb://localhost:27017/supply-demand',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'admin_api_key_123',
  SELLER_API_KEY: process.env.SELLER_API_KEY || 'seller_api_key_456',
  BUYER_API_KEY: process.env.BUYER_API_KEY || 'buyer_api_key_789',
  PORT: process.env.PORT || 5003,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
