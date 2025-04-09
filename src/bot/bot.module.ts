import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '7345325889:AAF2P4MxCntrbSg4tolK-sC1XAw6b2lpO_U',
      include: [BotModule],
    }),
  ],
  providers: [BotService],
  controllers: [BotController],
})
export class BotModule {}
