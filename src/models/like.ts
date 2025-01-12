import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user';
import Post from './post';

class Like extends Model {
    public id!: number;
    public post_id!: number;
    public user_id!: number;
    
    public static associate() {
      Like.belongsTo(Post, { foreignKey: 'post_id' });
      Like.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  
  Like.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Post,
          key: 'id',
        },
      },
      user_id: {
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
      modelName: 'Like',
      tableName: 'likes',
      timestamps: true,
      underscored: true,
    }
  );
  

export default Like;