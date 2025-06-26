import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(private mailerService: MailerService) {}

  async sendParcelStatusEmail(to: string, name: string, status: string) {
    return this.mailerService.sendMail({
      to,
      subject: `📦 Your parcel status is now: ${status}`,
      template: 'parcel-status', // .hbs file
      context: {
        name,
        status,
      },
    });
  }

  async sendBookingEmail(to: string, name: string, trackingId: string) {
    return this.mailerService.sendMail({
      to,
      subject: '🎉 Parcel Booked Successfully!',
      template: 'booking-confirmation',
      context: {
        name,
        trackingId,
      },
    });
  }
}


