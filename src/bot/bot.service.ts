import { Injectable } from '@nestjs/common';
import { Command, Context, On, Start, Update } from 'nestjs-telegraf';

@Injectable()
@Update()
export class BotService {
  @Start()
  async start(@Context() ctx: any) {
    await ctx.reply('Welcome to PinkSense Bot! 👋');
  }

  @Command('order')
  async order(@Context() ctx: any) {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      await ctx.reply('Please provide an ID. Usage: /order <id>');
      return;
    }

    const id = args[1];
    if (!/^\d+$/.test(id)) {
      await ctx.reply('Please provide a valid numeric ID');
      return;
    }

    await ctx.reply(`Order received for ID: ${id}`);
  }

  @On('text')
  async onMessage(@Context() ctx: any) {
    await ctx.reply(`You said: ${ctx.message.text}`);
  }
} 