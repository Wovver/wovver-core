import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';
import Post from './post';
import Like from './like';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public flags!: number;
  public bio!: string | null;
  public followers?: User[];
  public following?: User[];
  public displayName!: string | null;

  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public hasFlag(flag: number): boolean {
    return (this.flags & flag) === flag;
  }

  public addFlag(flag: number): void {
    this.flags |= flag;
  }

  public removeFlag(flag: number): void {
    this.flags &= ~flag;
  }

  public getDisplayName(): string {
    return this.displayName || this.username;
  }

  public static associate() {
    User.hasMany(Post, { foreignKey: 'userId' });
    User.hasMany(Like, { foreignKey: 'userId' });
  }
}

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
  flags: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'display_name'
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
});

User.belongsToMany(User, {
  through: 'follows',
  as: 'followers',
  foreignKey: 'followingId',
});

User.belongsToMany(User, {
  through: 'follows',
  as: 'following',
  foreignKey: 'followerId',
});

export default User;