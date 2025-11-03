import { Bot } from './bot.schema';
import { Model } from 'mongoose';
export declare class BotService {
    private botModel;
    private bot;
    private sessions;
    constructor(botModel: Model<Bot>);
    private onStart;
    private onActions;
    private onMessage;
    private startQuiz;
    private askQuestion;
    private generateQuestions;
}
