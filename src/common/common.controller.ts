import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommonService } from './common.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { SearchDto } from './dto/search.dto';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('common-search')
  @UseGuards(AuthGuard)
  async searchEngine(
    @User() { tenant_id, role }: UserTokenInterface,
    @Body() { search_in, search_with, column, created_sort }: SearchDto,
    @Query('role_id_for_users') role_id_for_users?: string,
    @Query('client_id') client_id?: string,
  ) {
    return await this.commonService.searchEngine(
      role.roles,
      tenant_id,
      search_in,
      search_with,
      column,
      created_sort,
      { role_id_for_users, client_id },
    );
  }
}
