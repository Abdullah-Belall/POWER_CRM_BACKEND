import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { complaintView } from './view/complaint-view';

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(data: any): Promise<string> {
    const ProductionObj = {
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    const LocalObj = {
      headless: true,
    };
    const browser = await puppeteer.launch(
      process.env.NODE_ENV === 'production' ? ProductionObj : LocalObj,
    );
    const page = await browser.newPage();
    const html = complaintView(data);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const filePath = path.join(__dirname, `${Date.now()}.pdf`);
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });

    await browser.close();
    return filePath;
  }
}
