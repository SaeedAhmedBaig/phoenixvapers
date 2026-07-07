import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class WebhookEndpoint extends Document {
  @Prop({ required: true }) url: string;

  @Prop({ required: true, index: true }) event: string;

  @Prop({ required: true }) secret: string;

  @Prop({ default: true }) active: boolean;
}

export const WebhookEndpointSchema = SchemaFactory.createForClass(WebhookEndpoint);
