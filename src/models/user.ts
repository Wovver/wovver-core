import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database'; // Adjust the import based on your project structure

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// Initialize the model
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,  // Pass your sequelize instance here
  modelName: 'User',
  tableName: 'users',  // Ensure you're using the right table
  timestamps: true,    // Automatically adds createdAt/updatedAt
});

export default User;
