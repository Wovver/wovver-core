import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/auth';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRoutes);

sequelize.sync()
  .then(() => {
    console.log('Database synced');
    app.listen(8080, () => {
      console.log('Server running on http://localhost:8080');
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });