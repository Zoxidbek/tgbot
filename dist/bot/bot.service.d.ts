import { Bot } from './bot.schema';
import { Model } from 'mongoose';
export declare class BotService {
    private botModel;
    private bot;
    constructor(botModel: Model<Bot>);
    private onStart;
    private onContact;
    private onLocation;
    private showStartButton;
    private onMessage;
    private onCallback;
}
