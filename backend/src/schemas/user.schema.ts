import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  studentId: string;

  @Prop({ type: [Number], required: true })
  faceEncoding: number[]; // Vector 128 chiều từ Python AI service

  @Prop({ type: Number, default: 0 })
  handsomeScore: number;

  @Prop({ type: String, default: '' })
  aiComment: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
