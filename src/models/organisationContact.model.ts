import { Schema, model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

interface OrganisationContact extends Document {
    email: string;
    address: string;
    phoneNumber: string;
    organisationId: ObjectId;
}

const OrganisationContactSchema = new Schema<OrganisationContact>({
    email: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    organisationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});

const OrganisationContactModel = model<OrganisationContact>('OrganisationContact', OrganisationContactSchema);

export default OrganisationContactModel;