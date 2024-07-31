import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum ImageLayoutEnum {
  Vertical = 'Vertical',
  Horizontal = 'Horizontal',
  Square = 'Square',
}

export type MemeDocument = HydratedDocument<Meme>;

@Schema()
export class Meme {
  @Prop()
  id: string;
  @Prop()
  name: string;
  @Prop()
  lines: number;
  @Prop()
  overlays: number;
  @Prop()
  styles: string[];
  @Prop()
  blank: string;
  @Prop(
    raw({
      text: { type: Array<string> },
      url: { type: String },
    }),
  )
  example: Record<string, any>;

  @Prop()
  source: string;

  @Prop()
  keywords: string[];

  @Prop()
  _self: string;

  @Prop(
    raw({
      width: { type: Number },
      height: { type: Number },
      aspectRatio: { type: Number },
      layoutType: { type: String },
      size: { type: Number },
    }),
  )
  metadata: Record<string, any>;
}

export const MemeSchema = SchemaFactory.createForClass(Meme);
