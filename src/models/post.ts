// models/post.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user';

class Post extends Model {
  public id!: number;
  public userId!: number;
  public content!: string;

  public static associate() {
    // Define the relationship between Post and User
    Post.belongsTo(User, { foreignKey: 'userId' });
  }
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
  }
);

export default Post;
