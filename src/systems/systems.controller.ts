import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SystemsService } from './systems.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateSystemDto } from './dto/create-system.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createSystem(
    @User() user: UserTokenInterface,
    @Body() createSystemDto: CreateSystemDto,
  ) {
    return await this.systemsService.createSystem(user, createSystemDto);
  }

  @Post(':id/feature')
  @UseGuards(AuthGuard)
  async addFeature(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createFeatureDto: CreateFeatureDto,
  ) {
    return await this.systemsService.addFeature(user, id, createFeatureDto);
  }
}
