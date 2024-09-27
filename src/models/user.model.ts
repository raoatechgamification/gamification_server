import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface UserAttributes {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  organizations?: string[];
  role?: string;
  password: string;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public username!: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public phone?: string;
  public organizations?: string[];
  public role!: string;
  public password!: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organizations: {
      type: DataTypes.ARRAY,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);
