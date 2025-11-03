import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Bot, BotSchema } from './bot.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bot.name, schema: BotSchema }])],
  controllers: [], 
  providers: [BotService],
})
export class BotModule {}

