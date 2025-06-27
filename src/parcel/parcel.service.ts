import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Parcel } from './parcel.schema';
import { Model } from 'mongoose';
import { NotificationService } from 'src/common/notification.service';

@Injectable()
export class ParcelService {
  constructor(
    @InjectModel(Parcel.name) private parcelModel: Model<Parcel>,
    private readonly notificationService: NotificationService,
  ) {}

  async book(data: any): Promise<any> {
    const parcel = await this.parcelModel.create({
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

    await this.notificationService.sendBookingEmail(
      data.recipientEmail,
      data.recipientName,
      parcel._id?.toString() || '',
    );

    return parcel;
  }

  findAll() {
    return this.parcelModel.find().populate('sender assignedAgent').exec();
  }

  findParcelBySenderId(senderId: string) {
    return this.parcelModel.find({ sender: senderId });
  }

  updateParcel(id: string, data: Partial<Parcel>) {
    return this.parcelModel.findByIdAndUpdate(id, data, { new: true });
  }

  deleteParcel(id: string) {
    return this.parcelModel.findByIdAndDelete(id);
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

  async updateStatus(id: string, status: string) {
    const parcel = await this.parcelModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!parcel) {
      throw new NotFoundException(`Parcel with id ${id} not found`);
    }

    await this.notificationService.sendParcelStatusEmail(
      parcel.recipientEmail,
      parcel.recipientName,
      status,
    );

    return parcel;
  }

  updateCurrentLocation(id: string, lat: number, lng: number) {
    return this.parcelModel.findByIdAndUpdate(
      id,
      { currentLocation: { lat, lng } },
      { new: true },
    );
  }
  async getAdvancedAnalytics() {
    const [
      byType,
      byStatus,
      codVsPrepaid,
      failedDeliveries,
      avgDeliveryTime,
      topAgents,
      deliveryRate,
      avgAssignDelay,
    ] = await Promise.all([
      // Parcel count by type
      this.parcelModel.aggregate([
        { $group: { _id: '$parcelType', count: { $sum: 1 } } },
      ]),

      // Count by status
      this.parcelModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // COD vs Prepaid revenue
      this.parcelModel.aggregate([
        {
          $group: {
            _id: '$isCOD',
            totalAmount: { $sum: '$price' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Failed deliveries
      this.parcelModel.aggregate([
        {
          $match: {
            status: { $in: ['Cancelled', 'Returned'] },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Average delivery time (assigned ➝ delivered)
      this.parcelModel.aggregate([
        {
          $match: {
            assignedAt: { $ne: null },
            deliveredAt: { $ne: null },
          },
        },
        {
          $project: {
            timeTakenHours: {
              $divide: [
                { $subtract: ['$deliveredAt', '$assignedAt'] },
                1000 * 60 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageDeliveryTimeHours: { $avg: '$timeTakenHours' },
          },
        },
      ]),

      // Top 5 agents by delivery count
      this.parcelModel.aggregate([
        {
          $match: {
            assignedAgent: { $ne: null },
            status: 'Delivered',
          },
        },
        {
          $group: {
            _id: '$assignedAgent',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Delivery completion rate
      this.parcelModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Avg delay from booking to assignment
      this.parcelModel.aggregate([
        {
          $match: {
            assignedAt: { $ne: null },
          },
        },
        {
          $project: {
            delayHours: {
              $divide: [
                { $subtract: ['$assignedAt', '$createdAt'] },
                1000 * 60 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDelayHours: { $avg: '$delayHours' },
          },
        },
      ]),
    ]);

    // Delivery rate calculation
    const totalCount = deliveryRate.reduce((acc, item) => acc + item.count, 0);
    const deliveredCount =
      deliveryRate.find((d) => d._id === 'Delivered')?.count || 0;
    const completionRate = totalCount ? (deliveredCount / totalCount) * 100 : 0;

    return {
      parcelTypeStats: byType,
      statusStats: byStatus,
      codVsPrepaid,
      failedDeliveries,
      averageDeliveryTimeHours:
        avgDeliveryTime[0]?.averageDeliveryTimeHours || 0,
      topAgentsByDelivery: topAgents,
      deliveryCompletionRate: completionRate.toFixed(2) + '%',
      averageAssignDelayHours: avgAssignDelay[0]?.avgDelayHours || 0,
    };
  }
}
