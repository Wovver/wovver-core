import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user';

class Follow extends Model {
  public followerId!: number;
  public followingId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Follow.init(
  {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    followingId: {
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
    modelName: 'Follow',
    tableName: 'follows',
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId'],
      },
    ],
  }
);

export default Follow; 