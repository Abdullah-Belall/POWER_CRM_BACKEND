import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}
  @Get('test')
  async sendMessage() {
    return await this.telegramService.sendMessage(
      '5726273594',
      'tessssssssssst',
    );
  }
  @Get('test2')
  async getChatIds() {
    return await this.telegramService.getChatIds();
  }
}
