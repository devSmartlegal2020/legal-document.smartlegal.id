import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  brandName: string;
  totalPrice: number;
  status: 'Leads' | 'Client';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp: { type: String, required: true },
    brandName: { type: String, required: true },
    totalPrice: { type: Number, required: true, default: 99000 },
    status: {
      type: String,
      required: true,
      enum: ['Leads', 'Client'],
      default: 'Leads',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
