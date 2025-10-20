import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/create-auth.dto';
import type { Response } from 'express';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { RefreshGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async SignIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.SignIn(signInDto, response);
  }

  @Get('refresh-token')
  @UseGuards(RefreshGuard)
  async refreshToken(@User() { id, tenant_id, lang }: UserTokenInterface) {
    return await this.authService.refreshToken(id, tenant_id, lang);
  }
}
