import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { Translations } from 'src/utils/base';
import * as fs from 'fs';
import FormData from 'form-data';
import { PdfGeneratorService } from 'src/pdf-generator/pdf-generator.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramEntity } from './entities/telegram.entity';
import { Repository } from 'typeorm';
import { TenantDBService } from 'src/tenants/DB_Services/tenant_db.service';
import { TenantsEntity } from 'src/tenants/entities/tenant.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class TelegramService {
  private readonly botToken = '8204493735:AAFR1o8rCy_EbYGCvEDp8H1K8Ku5BO3aLjs';
  private readonly baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  constructor(
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly usersDBService: UsersDBService,
    private readonly tenantDBService: TenantDBService,
    @InjectRepository(TelegramEntity)
    private readonly telegramRepo: Repository<TelegramEntity>,
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
  async setAhmed() {
    const user = await this.usersDBService.findOneUser({
      where: {
        id: 'ae40666c-64c5-4e52-a1a7-55f8f2d774ff',
      },
    });
    const tenant = await this.tenantDBService.findOneTenant({
      where: {
        tenant_id: user?.tenant_id,
      },
    });
    const chat_id = await this.telegramRepo.save(
      this.telegramRepo.create({
        tenant: tenant ?? undefined,
        tenant_id: 'c33236ab-9238-464b-a57e-69647d30968d',
        chat_id: '808663814',
        user: user ?? undefined,
      }),
    );
    await this.usersDBService.saveUser(LangsEnum.EN, {
      ...user,
      chat_id,
    } as UserEntity);
  }
}
