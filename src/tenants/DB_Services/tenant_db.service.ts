import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantsEntity } from '../entities/tenant.entity';
import { Repository } from 'typeorm';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class TenantDBService {
  constructor(
    @InjectRepository(TenantsEntity)
    private readonly tenantsRepo: Repository<TenantsEntity>,
  ) {}
  getTenantsRepo() {
    return this.tenantsRepo;
  }
  createTenantInstance(obj: object) {
    return this.tenantsRepo.create(obj);
  }
  async saveTenant(lang: LangsEnum, tenant: TenantsEntity) {
    let saved: TenantsEntity;
    try {
      saved = await this.tenantsRepo.save(tenant);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }

  async getNextIndex() {
    return (await this.tenantsRepo.count()) + 1;
  }
}
