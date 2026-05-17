import { Schema, model, type Document, type Types } from 'mongoose';

export interface CatchDoc extends Document {
  _id: Types.ObjectId;
  trip: Types.ObjectId;
  user: Types.ObjectId;
  fishType: string;
  weight?: number;
  length?: number;
  imageUrl?: string;
  imageKey?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const catchSchema = new Schema<CatchDoc>(
  {
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fishType: { type: String, required: true, trim: true, maxlength: 80 },
    weight: { type: Number, min: 0, max: 5000 },
    length: { type: Number, min: 0, max: 1000 },
    imageUrl: { type: String, trim: true },
    imageKey: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

catchSchema.index({ user: 1, createdAt: -1 });
catchSchema.index({ createdAt: -1 });

export const Catch = model<CatchDoc>('Catch', catchSchema);
