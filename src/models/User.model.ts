// C:\ШАГ 4 КУРС\pharma-backend\models\User.js

import mongoose from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name?: string;
    createdAt: Date;
    notifications?: {
      sales: boolean;
      orderStatus: boolean;
      deliveryMessage: boolean;
    };
    _doc: any;
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: false
  },
  notifications: {
    sales: {
      type: Boolean,
      default: true,
    },
    orderStatus: {
      type: Boolean,
      default: true,
    },
    deliveryMessage: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>('User', UserSchema);