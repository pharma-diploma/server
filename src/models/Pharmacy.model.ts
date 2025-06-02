import { Schema, model, Document } from "mongoose";

export interface IPharmacy extends Document {
    name: string;
    address: string;
    image: string;
    logo: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    workingHours: Map<string, { open: string; close: string }>;
    products: Schema.Types.ObjectId[];
}

const WorkingHoursSchema = new Schema(
    {
        open: { type: String, required: true },
        close: { type: String, required: true },
    },
    { _id: false }
);

const PharmacySchema = new Schema<IPharmacy>(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        image: { type: String, required: true },
        logo: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        workingHours: {
            type: Map,
            of: WorkingHoursSchema,
            required: true,
        },
        products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
);

export default model<IPharmacy>("Pharmacy", PharmacySchema);