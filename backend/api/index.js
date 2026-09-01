let app;
try {
  app = require('../server.js');
} catch (err) {
  console.error('[BACKEND API INDEX ERROR]:', err);
  app = (req, res) => {
    res.status(500).json({
      status: 'error',
      error: 'Backend Function Load Failed',
      message: err.message
    });
  };
}

module.exports = app;
