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
  courier?: Types.ObjectId;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
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
    status: { type: String, default: "pending" },
    total: { type: Number, required: true },
    courier: { type: Schema.Types.ObjectId, ref: "User" },
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
  },
  { timestamps: true }
);

export default model<IOrder>("Order", OrderSchema);