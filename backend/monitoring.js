const winston = require('winston');
const morgan = require('morgan');
const expressWinston = require('express-winston');
const promClient = require('prom-client');
const Sentry = require('@sentry/node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Create Prometheus registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const apiRequestsTotal = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status'],
});

const syncOperationsTotal = new promClient.Counter({
  name: 'sync_operations_total',
  help: 'Total number of sync operations',
  labelNames: ['type', 'status'],
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

register.registerMetric(httpRequestDuration);
register.registerMetric(apiRequestsTotal);
register.registerMetric(syncOperationsTotal);
register.registerMetric(activeConnections);

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'protectme-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Morgan stream for HTTP request logging
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Middleware functions
const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req, res) => {
    return req.url === '/health' || req.url === '/metrics';
  }
});

const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger
});

// Metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.url, res.statusCode.toString())
      .observe(duration);

    apiRequestsTotal
      .labels(req.method, req.url, res.statusCode.toString())
      .inc();
  });

  next();
};

// Sync operation tracking
const trackSyncOperation = (type, status) => {
  syncOperationsTotal.labels(type, status).inc();
  logger.info(`Sync operation: ${type} - ${status}`);
};

// Health check with metrics
const healthCheck = (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  // Update active connections metric
  activeConnections.set(1); // This is a simple counter; in production you'd track actual connections

  logger.info('Health check requested', { health });
  res.json(health);
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Error generating metrics', { error: error.message });
    res.status(500).end();
  }
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Send error to Sentry
  Sentry.captureException(error);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);

  // Close Sentry
  Sentry.close(2000).then(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = {
  logger,
  morganStream,
  requestLogger,
  errorLogger,
  metricsMiddleware,
  trackSyncOperation,
  healthCheck,
  metricsEndpoint,
  errorHandler,
  register
};