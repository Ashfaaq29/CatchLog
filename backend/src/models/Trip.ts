import { Schema, model, type Document, type Types } from 'mongoose';

export interface TripDoc extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  place?: Types.ObjectId;
  location: string;
  latitude?: number;
  longitude?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<TripDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    place: { type: Schema.Types.ObjectId, ref: 'Place', index: true },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    date: { type: Date, required: true },
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

tripSchema.index({ user: 1, date: -1 });

export const Trip = model<TripDoc>('Trip', tripSchema);
