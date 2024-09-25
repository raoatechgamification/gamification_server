import { DataTypes, Model, ModelStatic, Optional } from "sequelize";
import sequelize from "../config/db";

interface OrganizationAttributes {
  id?: number;
  name: string;
  email: string;
  phone: string;
  preferredUrl: string;
  password: string;
  referral?: string | number;
  referralSource: string
}

interface OrganizationCreationAttributes
  extends Optional<OrganizationAttributes, "id"> {}

export class Assessment
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string
  public preferredUrl!: string;
  public password!: string;
  public referral!: string | number;
  public referralSource!: string;
  static associate: (models: {
    Course: ModelStatic<Model<any, any>>;
    Submission: ModelStatic<Model<any, any>>;
  }) => void;
}

Assessment.init(
  {
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
      allowNull: false
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
      allowNull: false,
    },
    referralSource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Organization",
    tableName: "organization",
    timestamps: true,
  }
);
