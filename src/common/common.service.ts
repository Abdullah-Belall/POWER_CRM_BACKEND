import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';

@Injectable()
export class CommonService {
  constructor(private readonly usersDBService: UsersDBService) {}
  async searchEngine(
    roles: string[],
    tenant_id: string,
    search_in: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
    additinalQueries?: {
      role_id_for_users?: string;
    },
  ) {
    const allowedTables = ['users'];
    if (!allowedTables.includes(search_in)) {
      throw new BadRequestException();
    }
    if (search_in === 'users') {
      return await this.usersDBService.searchEngine(
        tenant_id,
        search_with,
        column,
        created_sort,
        additinalQueries?.role_id_for_users,
      );
    }
  }
}
