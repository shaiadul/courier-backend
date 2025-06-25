import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop() name: string;
  @Prop({ unique: true }) email: string;
  @Prop() password: string;
  @Prop({ default: 'customer' }) role: 'admin' | 'agent' | 'customer';
}

export const UserSchema = SchemaFactory.createForClass(User);
