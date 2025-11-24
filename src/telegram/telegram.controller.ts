import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateTelegramDto } from './dto/create-telegram.dto';
import { UpdateTelegramDto } from './dto/update-telegram.dto';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}
  @Get('chat-ids')
  async getChatIds() {
    return await this.telegramService.getChatIds();
  }
  @Post(':user_id/add-chat-id')
  async addChatId(
    @User() { tenant_id }: UserTokenInterface,
    @Param('user_id', new ParseUUIDPipe()) user_id: string,
    @Body() { chat_id }: CreateTelegramDto,
  ) {
    return await this.telegramService.addChatId(tenant_id, user_id, chat_id);
  }
  @Patch(':telegram_id')
  async updateChatId(
    @User() { tenant_id }: UserTokenInterface,
    @Param('telegram_id', new ParseUUIDPipe()) telegram_id: string,
    @Body() updateTelegramDto: UpdateTelegramDto,
  ) {
    return await this.telegramService.updateChatId(
      tenant_id,
      telegram_id,
      updateTelegramDto,
    );
  }
}
