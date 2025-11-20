import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/create-auth.dto';
import type { Response } from 'express';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { RefreshGuard } from './guards/refresh-token.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('sign-fuser')
  async signFirstUser() {
    return await this.authService.signFirstUser();
  }

  @Get('sign-suser')
  async signNormalFUser() {
    return await this.authService.signNormalFUser();
  }

  @Get('general-manager')
  async generalManager() {
    return await this.authService.generalManager();
  }

  @Get('sign-nxt-user')
  async signNormalxFUser() {
    return await this.authService.signNormalxFUser();
  }

  @Post('sign-in')
  async SignIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.SignIn(signInDto, response);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @User() user: UserTokenInterface,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user, changePasswordDto);
  }

  @Get('refresh-token')
  @UseGuards(RefreshGuard)
  async refreshToken(@User() { id, tenant_id, lang }: UserTokenInterface) {
    return await this.authService.refreshToken(id, tenant_id, lang);
  }

  @Get('sign-out')
  @UseGuards(AuthGuard)
  async SignOut(@Res({ passthrough: true }) response: Response) {
    return await this.authService.SignOut(response);
  }
}
