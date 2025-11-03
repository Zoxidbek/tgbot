"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bot_schema_1 = require("./bot.schema");
const mongoose_2 = require("mongoose");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
let BotService = class BotService {
    botModel;
    bot = new node_telegram_bot_api_1.default(process.env.TOKEN, { polling: true });
    sessions = new Map();
    constructor(botModel) {
        this.botModel = botModel;
        this.onStart();
        this.onMessage();
        this.onActions();
    }
    async onStart() {
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const username = msg.chat.username ?? 'user';
            const exists = await this.botModel.findOne({ chatId });
            if (!exists) {
                await this.botModel.create({ chatId, username });
            }
            this.bot.sendMessage(chatId, `Assalomu alaykum, ${username}! 👋\n` +
                `Bu matematika bot.\nSizga 10 ta misol beraman. Har biriga javob yuboring.`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Start test', callback_data: 'start_quiz' }],
                    ],
                },
            });
        });
    }
    onActions() {
        this.bot.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const action = query.data;
            if (action === 'start_quiz' || action === 'again_quiz') {
                await this.bot.answerCallbackQuery(query.id);
                this.startQuiz(chatId);
            }
        });
    }
    onMessage() {
        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            const session = this.sessions.get(chatId);
            if (!session)
                return;
            const userAnswer = Number(text);
            if (isNaN(userAnswer)) {
                return this.bot.sendMessage(chatId, 'faqat raqam yuboring!!');
            }
            const correctAnswer = session.questions[session.current].answer;
            if (userAnswer === correctAnswer) {
                session.correct++;
                this.bot.sendMessage(chatId, `To'g'ri✅`);
            }
            else {
                this.bot.sendMessage(chatId, `Javob xato to'g'ri javob: ${correctAnswer}`);
            }
            session.current++;
            this.askQuestion(chatId);
        });
    }
    startQuiz(chatId) {
        const questions = this.generateQuestions();
        this.sessions.set(chatId, { questions, current: 0, correct: 0 });
        this.bot.sendMessage(chatId, 'test boshlandi');
        this.askQuestion(chatId);
    }
    askQuestion(chatId) {
        const session = this.sessions.get(chatId);
        if (!session)
            return;
        if (session.current >= 10) {
            this.bot.sendMessage(chatId, `✅ Test tugadi!\nTo‘g‘ri javoblar: *${session.correct} / 10*\n Yana 10 ta test kerak bolsa pasdagi tugmani bosing`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔁 Yana 10 ta savol', callback_data: 'again_quiz' }],
                    ],
                },
            });
            this.sessions.delete(chatId);
            return;
        }
        const question = session.questions[session.current].q;
        this.bot.sendMessage(chatId, `${session.current + 1}: ${question}`);
    }
    generateQuestions() {
        const ops = ['+', '-', '*'];
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const op = ops[Math.floor(Math.random() * ops.length)];
            const q = `${a} ${op} ${b} = ?`;
            let answer = 0;
            switch (op) {
                case '+':
                    answer = a + b;
                    break;
                case '-':
                    answer = a - b;
                    break;
                case '*':
                    answer = a * b;
                    break;
            }
            questions.push({ q, answer });
        }
        return questions;
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bot_schema_1.Bot.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BotService);
//# sourceMappingURL=bot.service.js.map