// Vercel API entrypoint that explicitly imports Express
const express = require('express');
// Re‑use the existing Express app defined in backend/server.js
const app = require('../backend/server.js');
// Export the app for Vercel's @vercel/node builder
module.exports = app;
