import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Like from './like';

class Post extends Model {
  public id!: number;
  public userid!: number;
  public content!: string;
  public replyTo!: number | null; // Use camelCase here
  public createdAt!: Date;
  public updatedAt!: Date;
  public User?: User;  // For the included user relation
  public Likes?: Like[];  // For the included likes relation
  public parentPost?: Post;  // Add this line for the parent post relation

  public static associate() {
    Post.belongsTo(User, { foreignKey: 'userId' });
    Post.hasMany(Like, { foreignKey: 'postId' });
    Post.belongsTo(Post, { foreignKey: 'replyTo', as: 'parentPost' }); // Self-referencing relationship
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
    replyTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'replyto',
      references: {
        model: 'posts',
        key: 'id',
      },
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
    // Remove underscored: true
  }
);

export default Post;
