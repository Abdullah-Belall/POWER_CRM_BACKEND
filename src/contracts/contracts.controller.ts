import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateContractStatusDto } from './dto/create-contract-status.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}
  @Post()
  @UseGuards(AuthGuard)
  async createContract(
    @User() user: UserTokenInterface,
    @Body() createContractDto: CreateContractDto,
  ) {
    return await this.contractsService.createContract(user, createContractDto);
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  async changeContractStatus(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { status }: CreateContractStatusDto,
  ) {
    return await this.contractsService.changeContractStatus(user, id, status);
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOneContract(
    @User() { tenant_id }: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.contractsService.findOneContract(tenant_id, id);
  }
}
