import { Schema, model, Document } from "mongoose";

export interface IPharmacyProduct extends Document {
    pharmacy: Schema.Types.ObjectId;
    product: Schema.Types.ObjectId;
    expirationDate: Date;
    price: number;
    stock: number;
}

const PharmacyProductSchema = new Schema<IPharmacyProduct>(
    {
        pharmacy: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true },
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        expirationDate: { type: Date },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
    },
    { timestamps: true }
);

export default model<IPharmacyProduct>("PharmacyProduct", PharmacyProductSchema);