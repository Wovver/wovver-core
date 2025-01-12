import express from 'express';
import cors, { CorsOptions } from 'cors';
import sequelize from './config/database';
import authRoutes from './routes/v1/auth';
import postRoutes from './routes/v1/post';
import { logInfo, logWarn, logError, logSuccess } from './utils/logger';
import User from './models/user';
import Post from './models/post';
import Like from './models/like';

const app = express();

const allowedOrigins = ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:3050'];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS'), false); 
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  logInfo(`${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.use('/posts', (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed' });
});

if (typeof User.associate === 'function') {
  User.associate();
}
if (typeof Post.associate === 'function') {
  Post.associate();
}
if (typeof Like.associate === 'function') {
  Like.associate();
}

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

interface CustomError {
  message: string;
}

interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  logError(err.message);
  res.status(500).json({ error: err.message });
});