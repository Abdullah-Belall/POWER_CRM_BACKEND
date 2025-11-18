import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Post()
  @UseGuards(AuthGuard)
  async createService(
    @User() user: UserTokenInterface,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return await this.servicesService.createService(user, createServiceDto);
  }
}
