import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { Translations } from 'src/utils/base';
import * as fs from 'fs';
import FormData from 'form-data';
import { PdfGeneratorService } from 'src/pdf-generator/pdf-generator.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramEntity } from './entities/telegram.entity';
import { Repository } from 'typeorm';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { TenantDBService } from 'src/tenants/DB_Services/tenant_db.service';
import { UpdateTelegramDto } from './dto/update-telegram.dto';

@Injectable()
export class TelegramService {
  private readonly botToken = '8204493735:AAFR1o8rCy_EbYGCvEDp8H1K8Ku5BO3aLjs';
  private readonly baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  constructor(
    private readonly pdfGeneratorService: PdfGeneratorService,
    @InjectRepository(TelegramEntity)
    private readonly telegramRepo: Repository<TelegramEntity>,
    private readonly usersDBService: UsersDBService,
    private readonly tenantDBService: TenantDBService,
  ) {}
  async sendMessage(chat_id: string, message: string) {
    const url = `${this.baseUrl}/sendMessage`;
    try {
      await axios.post(url, {
        chat_id,
        text: message,
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.error(err);
    }
  }
  async sendTelegramPDF(chat_id: string, filePath: string) {
    const url = `${this.baseUrl}/sendDocument`;
    const form = new FormData();

    form.append('chat_id', chat_id);
    form.append('document', fs.createReadStream(filePath));

    await axios.post(url, form, {
      headers: form.getHeaders(),
    });
  }
  async getChatIds() {
    const response = await axios.get(`${this.baseUrl}/getUpdates`);
    if (!response.data.ok) {
      throw new InternalServerErrorException(Translations.errorMsg.ar);
    }
    const latestByDate = response.data?.result;
    let final;
    if (latestByDate.length > 0) {
      final = latestByDate.reduce((latest, current) =>
        current.message.date > latest.message.date ? current : latest,
      );
    }
    return {
      chat_id: final?.message?.chat?.id,
      text: final?.message?.text,
    };
  }
  async sendComplaint(data: any, chatIds: string[]) {
    const filePath = await this.pdfGeneratorService.generateInvoicePdf(data);

    for (const chat_id of chatIds) {
      await this.sendTelegramPDF(chat_id, filePath);
    }
    fs.unlinkSync(filePath);
  }
  async addChatId(tenant_id: string, user_id: string, chat_id: string) {
    const user = await this.usersDBService.findOneUser({
      where: { id: user_id, tenant_id },
    });
    if (!user) throw new NotFoundException();
    const tenant = await this.tenantDBService.findOneTenant({
      where: { tenant_id },
    });
    if (!tenant) throw new NotFoundException();
    await this.telegramRepo.save(
      this.telegramRepo.create({
        tenant_id,
        tenant,
        chat_id,
        user,
      }),
    );
    return {
      done: true,
    };
  }
  async updateChatId(
    tenant_id: string,
    telegram_id: string,
    updateChatIdDto: UpdateTelegramDto,
  ) {
    const telegram = await this.telegramRepo.findOne({
      where: { id: telegram_id, tenant_id },
    });
    if (!telegram) throw new NotFoundException();
    Object.assign(telegram, updateChatIdDto);
    await this.telegramRepo.save(telegram);
    return {
      done: true,
    };
  }
}
