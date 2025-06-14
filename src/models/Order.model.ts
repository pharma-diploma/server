import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
  pharmacyProduct: Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    pharmacyProduct: { type: Schema.Types.ObjectId, ref: "PharmacyProduct", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    status: { type: String, default: "pending" }, // pending, paid, shipped, completed, cancelled
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model<IOrder>("Order", OrderSchema);