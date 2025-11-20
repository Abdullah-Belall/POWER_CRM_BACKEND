import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './decorators/user.decorator';
import type { UserTokenInterface } from './types/interfaces/user-token.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateUserGuard } from './guards/create.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UpdateUserDto } from './dto/update-user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('testotra')
  async tempoDelete() {
    return await this.usersService.tempoDelete();
  }
  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@User() { id, tenant_id }: UserTokenInterface) {
    return await this.usersService.profile(id, tenant_id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findUsers(
    @User() { tenant_id }: UserTokenInterface,
    @Query('roleAttributes') roleAttributes: string,
  ) {
    const roles = roleAttributes ? JSON.parse(roleAttributes) : undefined;
    return await this.usersService.findAllUsers(tenant_id, roles);
  }
  @Post('create')
  @UseGuards(CreateUserGuard)
  async createUser(
    @User() user: UserTokenInterface,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.usersService.createUser(user, createUserDto);
  }
  @Patch(':id/edit')
  @UseGuards(CreateUserGuard)
  async editUser(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.editUser(user, id, updateUserDto);
  }
  @Post('upload-users-excel')
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
    @User() { tenant_id }: UserTokenInterface,
    @Query('role_id', new ParseUUIDPipe()) role_id: string,
  ) {
    return this.usersService.importExcel(tenant_id, role_id, file.path);
  }
}
