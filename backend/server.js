const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
  logger,
  morganStream,
  requestLogger,
  errorLogger,
  metricsMiddleware,
  trackSyncOperation,
  healthCheck,
  metricsEndpoint,
  errorHandler
} = require('./monitoring');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP logging
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Basic API authentication middleware
const API_KEY = process.env.API_KEY || 'demo-api-key';
app.use((req, res, next) => {
  // Skip auth for health and metrics
  if (req.path === '/health' || req.path === '/metrics') {
    return next();
  }

  const providedKey = req.headers['x-api-key'];
  if (!providedKey || providedKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Request logging and metrics
app.use(metricsMiddleware);
app.use(require('morgan')('combined', { stream: morganStream }));
app.use(requestLogger);

// In-memory storage for demo
let syncedReports = [];
let syncedAlerts = [];

// Health check
app.get('/health', healthCheck);

// Metrics endpoint for Prometheus
app.get('/metrics', metricsEndpoint);

// Sync reports
app.post('/reports/sync', (req, res) => {
  try {
    const report = req.body;
    logger.info('Syncing report', { reportId: report.id });

    // Simulate syncing with potential failure
    if (Math.random() < 0.05) { // 5% chance of failure for testing
      trackSyncOperation('report', 'failed');
      return res.status(500).json({ error: 'Sync failed' });
    }

    syncedReports.push(report);
    trackSyncOperation('report', 'success');
    logger.info('Report synced successfully', { reportId: report.id });

    res.json({ id: Date.now().toString() });
  } catch (error) {
    trackSyncOperation('report', 'error');
    logger.error('Error syncing report', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync alerts
app.post('/alerts/sync', (req, res) => {
  try {
    const alert = req.body;
    logger.info('Syncing alert', { alertId: alert.id });

    // Simulate syncing with potential failure
    if (Math.random() < 0.03) { // 3% chance of failure for testing
      trackSyncOperation('alert', 'failed');
      return res.status(500).json({ error: 'Sync failed' });
    }

    syncedAlerts.push(alert);
    trackSyncOperation('alert', 'success');
    logger.info('Alert synced successfully', { alertId: alert.id });

    res.json({ id: Date.now().toString() });
  } catch (error) {
    trackSyncOperation('alert', 'error');
    logger.error('Error syncing alert', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch resources
app.get('/resources', (req, res) => {
  const resources = [
    {
      id: 1,
      name: 'Nairobi Women\'s Hospital GVRC – Adams',
      category: 'Medical / GBV Centre',
      phone: '+254 709 667 000',
      address: 'Ngong Rd, Adams Arcade, Nairobi, Kenya',
      latitude: -1.2987,
      longitude: 36.7819,
      isOpen24h: true,
    },
    {
      id: 2,
      name: 'Kenya National GBV Helpline 1195',
      category: 'Helpline',
      phone: '+254 780 119 500',
      address: '24/7 toll-free helpline within Kenya',
      latitude: null,
      longitude: null,
      isOpen24h: true,
    },
  ];
  res.json(resources);
});

app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});