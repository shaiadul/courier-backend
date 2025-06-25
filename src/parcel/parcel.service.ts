import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Parcel } from './parcel.schema';
import { Model } from 'mongoose';

@Injectable()
export class ParcelService {
  constructor(@InjectModel(Parcel.name) private parcelModel: Model<Parcel>) {}

  book(data) {
    return this.parcelModel.create({
      ...data,
      pickupLocation: {
        lat: data.pickupLat,
        lng: data.pickupLng,
      },
      deliveryLocation: {
        lat: data.deliveryLat,
        lng: data.deliveryLng,
      },
    });
  }

  findAll() {
    return this.parcelModel.find().populate('sender assignedAgent').exec();
  }

  assignAgent(id: string, agentId: string) {
    return this.parcelModel.findByIdAndUpdate(
      id,
      {
        assignedAgent: agentId,
        status: 'Assigned',
      },
      { new: true },
    );
  }

  updateStatus(id: string, status: string) {
    return this.parcelModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  updateCurrentLocation(id: string, lat: number, lng: number) {
    return this.parcelModel.findByIdAndUpdate(
      id,
      { currentLocation: { lat, lng } },
      { new: true },
    );
  }
}
