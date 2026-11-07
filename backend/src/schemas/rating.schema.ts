import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'ratings', timestamps: true })
export class Rating extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  studentId: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: 'Success' })
  status: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
