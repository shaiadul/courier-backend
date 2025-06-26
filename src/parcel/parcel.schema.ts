import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Parcel extends Document {
  @Prop() recipientName: string;
  @Prop() pickupAddress: string;
  @Prop() deliveryAddress: string;
  @Prop() parcelType: string;
  @Prop() isCOD: boolean;
  @Prop({
    type: String,
    enum: ['Booked', 'Assigned', 'Delivered', 'Cancelled'],
    default: 'Booked',
  })
  status: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) sender: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedAgent: Types.ObjectId;
  @Prop({
    type: {
      lat: Number,
      lng: Number,
    },
    _id: false,
  })
  pickupLocation: { lat: number; lng: number };

  @Prop({
    type: {
      lat: Number,
      lng: Number,
    },
    _id: false,
  })
  deliveryLocation: { lat: number; lng: number };

  @Prop({
    type: {
      lat: Number,
      lng: Number,
    },
    _id: false,
    default: null,
  })
  currentLocation: { lat: number; lng: number };
}

export const ParcelSchema = SchemaFactory.createForClass(Parcel);
