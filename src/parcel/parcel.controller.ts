import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ParcelService } from './parcel.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('parcels')
export class ParcelController {
  constructor(private parcelService: ParcelService) {}

  @Post('book')
  book(@Body() body) {
    return this.parcelService.book(body);
  }

  @Get()
  findAll() {
    return this.parcelService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/assign')
  assign(@Param('id') id: string, @Body() body: { assignedAgentId: string }) {
    console.log('📦 Incoming body:', body);
    return this.parcelService.assignAgent(id, body.assignedAgentId);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.parcelService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @Put(':id/location')
  updateCurrentLocation(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.parcelService.updateCurrentLocation(id, body.lat, body.lng);
  }
}
