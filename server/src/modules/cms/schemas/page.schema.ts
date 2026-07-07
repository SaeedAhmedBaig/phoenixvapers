import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ _id: false })
class PageCard {
  @Prop({ required: true }) title: string;

  @Prop({ required: true }) text: string;

  @Prop() meta?: string;
}

@Schema({ _id: false })
class PageSection {
  @Prop({ required: true }) title: string;

  @Prop({ type: [PageCard], default: [] }) cards?: PageCard[];

  @Prop({ type: [String], default: [] }) list?: string[];
}

@Schema({ _id: false })
class PageFaq {
  @Prop({ required: true }) question: string;

  @Prop({ required: true }) answer: string;
}

@Schema({ timestamps: true })
export class Page extends Document {
  @Prop({ required: true, unique: true }) slug: string;

  @Prop({ required: true }) eyebrow: string;

  @Prop({ required: true }) title: string;

  @Prop({ required: true }) description: string;

  @Prop() cta?: string;

  @Prop() ctaHref?: string;

  @Prop({ type: [[String]], default: [] }) stats: string[][];

  @Prop({ type: [PageSection], default: [] }) sections: PageSection[];

  @Prop({ type: [PageFaq], default: [] }) faqs: PageFaq[];

  @Prop({ default: false }) form: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
