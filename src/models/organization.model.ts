import { DataTypes, Model, ModelStatic, Optional } from "sequelize";
import sequelize from "../config/db";

interface OrganizationAttributes {
  id: string;
  role?: string;
  name: string;
  email: string;
  phone: string;
  preferredUrl: string;
  password: string;
  referral?: string;
  referralSource: string;
}

interface OrganizationCreationAttributes
  extends Optional<OrganizationAttributes, "id"> {}

export class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  public id!: string;
  public role!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public preferredUrl!: string;
  public password!: string;
  public referral!: string;
  public referralSource!: string;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'amdin',
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preferredUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referral: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referralSource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Organization",
    tableName: "organizations",
    timestamps: true,
  }
);
