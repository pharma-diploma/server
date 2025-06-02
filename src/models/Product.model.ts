import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    brand: string;
    description?: string;
    category: string;
    prescriptionRequired: boolean;
    image: string;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        description: { type: String },
        category: { type: String, required: true },
        prescriptionRequired: { type: Boolean, required: true, default: false },
        image: { type: String, default: 'https://storage.googleapis.com/static-storage/products/images/v2/1065004_mTxVZlCn_20220919_180614.jpg' },
    },
    { timestamps: true }
);

export default model<IProduct>('Product', ProductSchema);