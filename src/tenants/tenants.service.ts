import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantDBService } from './DB_Services/tenant_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { hash } from 'bcrypt';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';
@Injectable()
export class TenantsService {
  constructor(
    private readonly tenantsDBService: TenantDBService,
    private readonly userDBService: UsersDBService,
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
    return origins.map((e) => e.domain);
  }
  async createTenant(lang: LangsEnum, createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsDBService.saveTenant(
      lang,
      this.tenantsDBService.createTenantInstance({
        ...createTenantDto,
        index: await this.tenantsDBService.getNextIndex(),
      }),
    );
    await this.userDBService.saveUser(
      lang,
      this.userDBService.createUserInstance({
        user_name: createTenantDto.user_name,
        password: await hash(createTenantDto.password, 12),
        index: 1,
        tenant_id: tenant.tenant_id,
        roles: createTenantDto.roles,
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
}
