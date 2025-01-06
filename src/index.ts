import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/v1/auth';
import postRoutes from './routes/v1/post';
import { logInfo, logWarn, logError, logSuccess } from './utils/logger'; // Import specific functions

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  logInfo(`${req.method} ${req.url}`);
  next();
});

// 404 Error Handler with JSON Response
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    details: `The requested URL ${req.originalUrl} was not found on this server.`,
  });
});

// 500 Error Handler with JSON Response
interface ErrorRequestHandler {
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction): void;
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logError(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    details: 'Something went wrong on the server. Please try again later.',
    error: err.message || 'Unknown error',
  });
};

app.use(errorHandler);

// Use the routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

sequelize.sync()
  .then(() => {
    logSuccess('Database synced');
    app.listen(8080, () => {
      logSuccess('Server running on http://localhost:8080');
    });
  })
  .catch((err) => {
    logError('Error syncing database');
    console.error(err);
  });
