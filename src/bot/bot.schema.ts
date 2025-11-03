import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Schema({ timestamps: true, versionKey: false })
export class Bot extends Model {
    @Prop()
    chatId: number;

    @Prop()
    username: string
}

export const BotSchema = SchemaFactory.createForClass(Bot)