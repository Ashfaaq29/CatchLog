import { Schema, model, type Document, type Types } from 'mongoose';

export interface PlaceDoc extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  latitude: number;
  longitude: number;
  geocodeLabel?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const placeSchema = new Schema<PlaceDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    geocodeLabel: { type: String, trim: true, maxlength: 200 },
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

placeSchema.index({ user: 1, name: 1 });

export const Place = model<PlaceDoc>('Place', placeSchema);
