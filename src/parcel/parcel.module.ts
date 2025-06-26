import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Parcel, ParcelSchema } from './parcel.schema';
import { ParcelService } from './parcel.service';
import { ParcelController } from './parcel.controller';
import { NotificationModule } from 'src/common/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Parcel.name, schema: ParcelSchema }]),
    NotificationModule,
  ],
  controllers: [ParcelController],
  providers: [ParcelService],
})
export class ParcelModule {}
