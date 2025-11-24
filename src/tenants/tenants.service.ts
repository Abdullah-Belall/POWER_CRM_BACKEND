import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantDBService } from './DB_Services/tenant_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { hash } from 'bcrypt';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';
import { RolesDBService } from 'src/roles/DB_Service/roles_db.service';
@Injectable()
export class TenantsService {
  constructor(
    private readonly tenantsDBService: TenantDBService,
    private readonly userDBService: UsersDBService,
    private readonly rolesDBService: RolesDBService,
  ) {}
  async getAllowedOrigins() {
    const origins = await this.tenantsDBService.getTenantsRepo()?.find({
      where: { is_active: true },
      select: {
        tenant_id: true,
        domain: true,
        company_title: false,
        company_logo: false,
        chat_ids: false,
        phone: false,
        is_active: false,
        created_at: false,
        updated_at: false,
      },
    });
    return origins.map(
      (e) =>
        `http${process.env.NODE_ENV === 'production' ? 's' : ''}://${e.domain}`,
    );
  }
  async createTenant(lang: LangsEnum, createTenantDto: CreateTenantDto) {
    const isDublicate = await this.tenantsDBService.findOneTenant({
      where: {
        domain: createTenantDto.domain,
      },
    });
    if (isDublicate) {
      throw new ConflictException();
    }
    const tenant = await this.tenantsDBService.saveTenant(
      lang,
      this.tenantsDBService.createTenantInstance({
        ...createTenantDto,
        index: await this.tenantsDBService.getNextIndex(),
      }),
    );
    const roles = [
      'create-user',
      'read-user',
      'update-user',
      'read-system',
      'create-system',
      'update-system',
      'read-service',
      'create-service',
      'update-service',
      'create-role',
      'read-role',
      'update-role',

      'sub-complaint-f-client',
      'self-solve-complaint',
      'read-complaint',
      'assign-complaint',
      'update-complaint',

      'read-potential-customers',
      'potential-customers-assign',
      'suitable_for_meeting',

      'read-task',
      'create-task',
      'update-task',
    ];
    const role = await this.rolesDBService.saveRoles(
      lang,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant.tenant_id,
        name: 'General Manager',
        code: 1000,
        roles,
      }),
    );
    await this.userDBService.saveUser(
      lang,
      this.userDBService.createUserInstance({
        user_name: createTenantDto.user_name,
        password: await hash(createTenantDto.password, 12),
        index: 1001,
        tenant_id: tenant.tenant_id,
        role,
      }),
    );
    return {
      done: true,
    };
  }
  async updateTenant(
    lang: LangsEnum,
    tenant_id: string,
    updateTenantDto: UpdateTenantDto,
  ) {
    const tenant = await this.tenantsDBService.getTenantsRepo()?.findOne({
      where: {
        tenant_id,
      },
    });
    if (!tenant)
      throw new NotFoundException(Translations.tenant.notFound[lang]);
    Object.assign(tenant, updateTenantDto);
    await this.tenantsDBService.saveTenant(lang, tenant);
    return {
      done: true,
    };
  }
  async getTenants() {
    const results = await this.tenantsDBService.searchEngine(
      '',
      'domain',
      'DESC',
    );
    return {
      tenants: results.data,
      total: results.total,
    };
  }
}
