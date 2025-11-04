import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { Translations } from 'src/utils/base';
import * as fs from 'fs';
import FormData from 'form-data';
import { PdfGeneratorService } from 'src/pdf-generator/pdf-generator.service';

@Injectable()
export class TelegramService {
  private readonly botToken = '8204493735:AAFR1o8rCy_EbYGCvEDp8H1K8Ku5BO3aLjs';
  private readonly baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  constructor(private readonly pdfGeneratorService: PdfGeneratorService) {}
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
}
