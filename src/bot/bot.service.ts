import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bot } from './bot.schema';
import { Model } from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';

interface Question {
  q: string;
  answer: number;
}

interface SessionData {
  questions: Question[];
  current: number;
  correct: number;
}

@Injectable()
export class BotService {
  private bot = new TelegramBot(process.env.TOKEN as string, { polling: true });
  private sessions = new Map<number, SessionData>();

  constructor(@InjectModel(Bot.name) private botModel: Model<Bot>) {
    this.onStart();
    this.onMessage();
    this.onActions();
  }

  
  private async onStart() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.chat.username ?? 'user';

      const exists = await this.botModel.findOne({ chatId });
      if (!exists) {
        await this.botModel.create({ chatId, username });
      }

      this.bot.sendMessage(
        chatId,
        `Assalomu alaykum, ${username}! 👋\n` +
          `Bu matematika bot.\nSizga 10 ta misol beraman. Har biriga javob yuboring.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Start test', callback_data: 'start_quiz' }],
            ],
          },
        },
      );
    });
  }

  private onActions() {
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message!.chat.id
      const action = query.data;

      if (action === 'start_quiz' || action === 'again_quiz') {
        await this.bot.answerCallbackQuery(query.id);
        this.startQuiz(chatId);
      }
    });
  }


  private onMessage() {
    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      const session = this.sessions.get(chatId);
      if (!session) return;

      const userAnswer = Number(text);
      if (isNaN(userAnswer)) {
        return this.bot.sendMessage(chatId, 'faqat raqam yuboring!!');
      }

      const correctAnswer = session.questions[session.current].answer;
      if (userAnswer === correctAnswer) {
        session.correct++;
        this.bot.sendMessage(chatId, `To'g'ri✅`);
      } else {
        this.bot.sendMessage(chatId, `Javob xato to'g'ri javob: ${correctAnswer}`);
      }

      session.current++;
      this.askQuestion(chatId);
    });
  }
  private startQuiz(chatId: number) {
    const questions = this.generateQuestions();
    this.sessions.set(chatId, { questions, current: 0, correct: 0 });

    this.bot.sendMessage(chatId, 'test boshlandi');
    this.askQuestion(chatId);
  }

  private askQuestion(chatId: number) {
    const session = this.sessions.get(chatId);
    if (!session) return;

    if (session.current >= 10) {
      this.bot.sendMessage(
        chatId,
        `✅ Test tugadi!\nTo‘g‘ri javoblar: *${session.correct} / 10*\n Yana 10 ta test kerak bolsa pasdagi tugmani bosing`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔁 Yana 10 ta savol', callback_data: 'again_quiz' }],
            ],
          },
        },
      );
      this.sessions.delete(chatId);
      return;
    }

    const question = session.questions[session.current].q;
    this.bot.sendMessage(chatId, `${session.current + 1}: ${question}`);
  }

  

  private generateQuestions(): Question[] {
    const ops = ['+', '-', '*'];
    const questions: Question[] = [];

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
}
