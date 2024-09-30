import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface SuperAdminAttributes {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  password: string;
}

interface SuperAdminCreationAttributes
  extends Optional<SuperAdminAttributes, "id"> {}

export class SuperAdmin
  extends Model<SuperAdminAttributes, SuperAdminCreationAttributes>
  implements SuperAdminAttributes
{
  public id!: string;
  public username!: string;
  public email!: string;
  public firstName?: string | undefined;
  public lastName?: string | undefined;
  public role!: string;
  public password!: string;
}

SuperAdmin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'superAdmin',
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "SuperAdmin",
    tableName: "super_admins",
    timestamps: true,
  }
);
