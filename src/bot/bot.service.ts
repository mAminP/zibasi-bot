import { Injectable } from '@nestjs/common';
import { Context, On, Start, Update } from 'nestjs-telegraf';

@Injectable()
@Update()
export class BotService {
  @Start()
  async start(@Context() ctx: any) {
    await ctx.reply('Welcome to PinkSense Bot! 👋');
  }

  @On('text')
  async onMessage(@Context() ctx: any) {
    await ctx.reply(`You said: ${ctx.message.text}`);
  }
} 