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
    constructor(botModel) {
        this.botModel = botModel;
        this.onStart();
        this.onContact();
        this.onLocation();
        this.onMessage();
        this.onCallback();
    }
    async onStart() {
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const username = msg.chat.username ?? 'user';
            const firstname = msg.chat.first_name ?? 'user';
            const exists = await this.botModel.findOne({ chatId });
            if (!exists) {
                await this.botModel.create({ chatId, username });
            }
            await this.bot.sendMessage(chatId, `Assalomu alaykum, <b>${firstname}</b>! 👋\n` +
                `Botdan foydalanish uchun telefon raqamingizni va joylashuvingizni yuboring 📞📍`, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: '📱 Telefon raqamni yuborish',
                                request_contact: true,
                            },
                        ],
                        [
                            {
                                text: '📍 Joylashuvni yuborish',
                                request_location: true,
                            },
                        ],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        });
    }
    async onContact() {
        this.bot.on('contact', async (msg) => {
            const chatId = msg.chat.id;
            const phone = msg.contact?.phone_number;
            if (phone) {
                await this.botModel.updateOne({ chatId }, { phone });
                await this.bot.sendMessage(chatId, `✅ Telefon raqamingiz saqlandi`);
                this.showStartButton(chatId);
            }
            else {
                await this.bot.sendMessage(chatId, `+998901234567 ko‘rinishida yuboring yoki\n"📱 Telefon raqamni yuborish" tugmasini bosing.`);
            }
        });
    }
    async onLocation() {
        this.bot.on('location', async (msg) => {
            const chatId = msg.chat.id;
            const location = msg.location;
            if (location) {
                await this.botModel.updateOne({ chatId }, { location: { lat: location.latitude, lon: location.longitude } });
                await this.bot.sendMessage(chatId, `✅ Joylashuvingiz saqlandi`);
                this.showStartButton(chatId);
            }
            else {
                await this.bot.sendMessage(chatId, `Iltimos, "📍 Joylashuvni yuborish" tugmasini bosing.`);
            }
        });
    }
    async showStartButton(chatId) {
        await this.bot.sendMessage(chatId, `Endi botdan to'liq foydalanishingiz mumkin👇`, {
            reply_markup: {
                keyboard: [[{ text: 'Menyu🧾' }, { text: 'Manzil📍' }]],
                resize_keyboard: true,
            },
        });
    }
    async onMessage() {
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            if (msg.text === 'Menyu🧾') {
                await this.bot.sendMessage(chatId, `Kategoriyani tanlang 🍽️`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🍔 Burgerlar', callback_data: 'category_burger' }],
                            [{ text: '🫔 Shaverma', callback_data: 'category_shaverma' }],
                            [{ text: '🥤 Ichimliklar', callback_data: 'category_drink' }],
                        ],
                    },
                });
            }
            if (msg.text === 'Manzil📍') {
                await this.bot.sendMessage(chatId, `📍 Manzil: 
● ул. Аль-Хорезми, 72
● Ургенч, 4-й микрорайон, 31.
● Ургенч, улица Абульгази Бахадырхана, 205.`);
            }
        });
    }
    async onCallback() {
        this.bot.on('callback_query', async (query) => {
            const chatId = query.message?.chat.id;
            const data = query.data;
            if (!chatId || !data)
                return;
            if (data === 'category_burger') {
                await this.bot.sendMessage(chatId, `🍔 Burgerlar ro‘yxati:`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Cheeseburger (Oddiy) - 25 000 so‘m', callback_data: 'burger_single' }],
                            [{ text: 'Double Cheeseburger - 33 000 so‘m', callback_data: 'burger_double' }],
                            [{ text: '⬅️ Ortga', callback_data: 'back_to_menu' }],
                        ],
                    },
                });
            }
            if (data === 'burger_single') {
                await this.bot.sendMessage(chatId, `🍔 Siz <b>Cheeseburger (Oddiy)</b> tanladingiz!\nNarxi: 25 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_burger_single' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'burger_double') {
                await this.bot.sendMessage(chatId, `🍔 Siz <b>Double Cheeseburger</b> tanladingiz!\nNarxi: 33 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_burger_double' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'order_burger_single') {
                await this.bot.sendMessage(chatId, `✅ Cheeseburger buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'order_burger_double') {
                await this.bot.sendMessage(chatId, `✅ Double Cheeseburger buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'category_shaverma') {
                await this.bot.sendMessage(chatId, `🫔 Shavermalar ro‘yxati:`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Oddiy Shaverma - 22 000 so‘m', callback_data: 'shaverma_single' }],
                            [{ text: 'Double Shaverma - 30 000 so‘m', callback_data: 'shaverma_double' }],
                            [{ text: '⬅️ Ortga', callback_data: 'back_to_menu' }],
                        ],
                    },
                });
            }
            if (data === 'shaverma_single') {
                await this.bot.sendMessage(chatId, `🫔 Siz <b>Oddiy Shaverma</b> tanladingiz!\nNarxi: 22 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_shaverma_single' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'shaverma_double') {
                await this.bot.sendMessage(chatId, `🫔 Siz <b>Double Shaverma</b> tanladingiz!\nNarxi: 30 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_shaverma_double' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'order_shaverma_single') {
                await this.bot.sendMessage(chatId, `✅ Oddiy Shaverma buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'order_shaverma_double') {
                await this.bot.sendMessage(chatId, `✅ Double Shaverma buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'category_drink') {
                await this.bot.sendMessage(chatId, `🥤 Ichimliklar ro‘yxati:`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Coca-Cola - 10 000 so‘m', callback_data: 'drink_cola' }],
                            [{ text: 'Fanta - 10 000 so‘m', callback_data: 'drink_fanta' }],
                            [{ text: 'Pepsi - 10 000 so‘m', callback_data: 'drink_pepsi' }],
                            [{ text: '⬅️ Ortga', callback_data: 'back_to_menu' }],
                        ],
                    },
                });
            }
            if (data === 'drink_cola') {
                await this.bot.sendMessage(chatId, `🥤 Siz <b>Coca-Cola</b> tanladingiz!\nNarxi: 10 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_drink_cola' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'drink_fanta') {
                await this.bot.sendMessage(chatId, `🥤 Siz <b>Fanta</b> tanladingiz!\nNarxi: 10 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_drink_fanta' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'drink_pepsi') {
                await this.bot.sendMessage(chatId, `🥤 Siz <b>Pepsi</b> tanladingiz!\nNarxi: 10 000 so‘m\nZakaz berasizmi?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Ha, zakaz beraman', callback_data: 'order_drink_pepsi' },
                                { text: '❌ Bekor qilish', callback_data: 'cancel' },
                            ],
                        ],
                    },
                });
            }
            if (data === 'order_drink_cola') {
                await this.bot.sendMessage(chatId, `✅ Coca-Cola buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'order_drink_fanta') {
                await this.bot.sendMessage(chatId, `✅ Fanta buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'order_drink_pepsi') {
                await this.bot.sendMessage(chatId, `✅ Pepsi buyurtmangiz qabul qilindi! 🚚`);
            }
            if (data === 'back_to_menu') {
                await this.bot.sendMessage(chatId, `Kategoriyani tanlang 🍽️`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🍔 Burgerlar', callback_data: 'category_burger' }],
                            [{ text: '🫔 Shaverma', callback_data: 'category_shaverma' }],
                            [{ text: '🥤 Ichimliklar', callback_data: 'category_drink' }],
                        ],
                    },
                });
            }
            if (data === 'cancel') {
                await this.bot.sendMessage(chatId, `❌ Buyurtma bekor qilindi.`);
            }
            await this.bot.answerCallbackQuery(query.id);
        });
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bot_schema_1.Bot.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BotService);
//# sourceMappingURL=bot.service.js.map