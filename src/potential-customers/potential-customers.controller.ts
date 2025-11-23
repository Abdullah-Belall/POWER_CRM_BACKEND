import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { PotentialCustomersService } from './potential-customers.service';
import { CreatePotentialCustomerDto } from './dto/create-potential-customer.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { ChangePotentialCustomerStatus } from './dto/change-customer-status';
import { UpdateAttachmentDto } from 'src/attachments/dto/update-attachment.dto';
import { UpdatePotentialCustomerDto } from './dto/update-potential-customer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('potential-customers')
export class PotentialCustomersController {
  constructor(
    private readonly potentialCustomersService: PotentialCustomersService,
  ) {}
  @Post('upload-excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async importExcel(
    @UploadedFile() file: any,
    @User() user: UserTokenInterface,
  ) {
    return this.potentialCustomersService.importExcel(user, file.path);
  }
  @Get()
  @UseGuards(AuthGuard)
  async findCustomers(@User() { tenant_id, id }: UserTokenInterface) {
    return await this.potentialCustomersService.findCustomers(tenant_id, id);
  }
  @Post()
  @UseGuards(AuthGuard)
  async addNew(
    @User() user: UserTokenInterface,
    @Body() createPotentialCustomerDto: CreatePotentialCustomerDto,
  ) {
    return await this.potentialCustomersService.addNew(
      user,
      createPotentialCustomerDto,
    );
  }
  @Post(':customer_id/assign/:saler_id')
  @UseGuards(AuthGuard)
  async assignSaler(
    @User() user: UserTokenInterface,
    @Param('customer_id', new ParseUUIDPipe()) customer_id: string,
    @Param('saler_id', new ParseUUIDPipe()) saler_id: string,
  ) {
    return await this.potentialCustomersService.assignSaler(
      user,
      customer_id,
      saler_id,
    );
  }
  @Patch(':id/edit')
  @UseGuards(AuthGuard)
  async editCustomerData(
    @User() user: UserTokenInterface,
    @Body() updatePotentialCustomerDto: UpdatePotentialCustomerDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.potentialCustomersService.editCustomerData(
      user,
      id,
      updatePotentialCustomerDto,
    );
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  async changeStatus(
    @User() user: UserTokenInterface,
    @Body() { status }: ChangePotentialCustomerStatus,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.potentialCustomersService.changeStatus(user, id, status);
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async customerProfile(
    @User() { tenant_id }: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.potentialCustomersService.customerProfile(tenant_id, id);
  }
}
