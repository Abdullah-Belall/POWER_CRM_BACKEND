import { BadRequestException, Injectable } from '@nestjs/common';
import { ComplaintDBService } from 'src/complaints/DB_Service/complaints_db.service';
import { RolesDBService } from 'src/roles/DB_Service/roles_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { allowedSearchTables } from 'src/utils/base';

@Injectable()
export class CommonService {
  constructor(
    private readonly usersDBService: UsersDBService,
    private readonly rolesDBService: RolesDBService,
    private readonly complaintDBService: ComplaintDBService,
  ) {}
  async searchEngine(
    roles: string[],
    tenant_id: string,
    search_in: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
    additinalQueries?: {
      role_id_for_users?: string;
      client_id?: string;
    },
  ) {
    if (!allowedSearchTables.includes(search_in)) {
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
    } else if (search_in === 'roles') {
      return await this.rolesDBService.searchEngine(
        tenant_id,
        search_with,
        column,
        created_sort,
      );
    } else if (search_in === 'complaints') {
      return await this.complaintDBService.searchEngine(
        tenant_id,
        search_with,
        column,
        created_sort,
      );
    }
  }
}
