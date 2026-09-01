let app;
try {
  app = require('../backend/server.js');
} catch (err) {
  console.error('[ROOT API INDEX ERROR]:', err);
  app = (req, res) => {
    res.status(500).json({
      status: 'error',
      error: 'Serverless Function Load Failed',
      message: err.message
    });
  };
}

module.exports = app;
