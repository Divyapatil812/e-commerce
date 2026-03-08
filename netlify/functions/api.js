const serverless = require('serverless-http');
const app = require('../../neocommerce-backend/server');

module.exports.handler = serverless(app, { basePath: '/.netlify/functions/api' });