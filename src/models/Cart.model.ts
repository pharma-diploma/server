import { Schema, model, Document, Types } from "mongoose";

export interface ICart extends Document {
  user: Types.ObjectId;
  items: Types.ObjectId[];
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [{ type: Schema.Types.ObjectId, ref: "PharmacyProduct", required: true }],
  },
  { timestamps: true }
);

export default model<ICart>("Cart", CartSchema);