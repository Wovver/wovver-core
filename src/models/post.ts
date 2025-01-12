import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Like from './like';

class Post extends Model {
  public id!: number;
  public userId!: number;
  public content!: string;

  public static associate() {
    Post.belongsTo(User, { foreignKey: 'userId' });
    Post.hasMany(Like, { foreignKey: 'postId' });
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