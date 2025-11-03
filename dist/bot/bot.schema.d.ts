import { Model } from "mongoose";
export declare class Bot extends Model {
    chatId: number;
    username: string;
}
export declare const BotSchema: import("mongoose").Schema<Bot, Model<Bot, any, any, any, import("mongoose").Document<unknown, any, Bot, any, {}> & Bot & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Bot, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Bot>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Bot> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
