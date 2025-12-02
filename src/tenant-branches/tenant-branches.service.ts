import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantBranchDto } from './dto/create-tenant-branch.dto';
import { UpdateTenantBranchDto } from './dto/update-tenant-branch.dto';
import { TenantBranchesDBService } from './DB_Service/tenant-branches-db.dervice';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { TenantDBService } from 'src/tenants/DB_Services/tenant_db.service';

@Injectable()
export class TenantBranchesService {
  constructor(
    private readonly tenantBranchesDBService: TenantBranchesDBService,
    private readonly tenantDBService: TenantDBService,
  ) {}

  async createTenantBranch(
    { tenant_id, lang }: UserTokenInterface,
    createTenantBranchDto: CreateTenantBranchDto,
  ) {
    const isDuplicateArName =
      await this.tenantBranchesDBService.findOneTenantBranch({
        where: {
          tenant: {
            tenant_id,
          },
          ar_name: createTenantBranchDto.ar_name,
        },
      });
    if (isDuplicateArName) {
      throw new ConflictException('Arabic name already exist');
    }
    if (createTenantBranchDto.en_name) {
      const isDuplicateErName =
        await this.tenantBranchesDBService.findOneTenantBranch({
          where: {
            tenant: {
              tenant_id,
            },
            en_name: createTenantBranchDto.en_name,
          },
        });
      if (isDuplicateErName) {
        throw new ConflictException('English name already exist');
      }
    }
    const tenant = await this.tenantDBService.findOneTenant({
      where: {
        tenant_id: createTenantBranchDto.tenant_id,
      },
    });
    if (!tenant) throw new NotFoundException();
    await this.tenantBranchesDBService.saveTenantBranch(
      lang,
      this.tenantBranchesDBService.createTenantBranchInstance({
        ...createTenantBranchDto,
        tenant,
        index: await this.tenantBranchesDBService.getNextIndex(tenant_id),
      }),
    );
    return {
      done: true,
    };
  }

  async updateTenantBranch(
    { lang }: UserTokenInterface,
    id: string,
    updateTenantBranchDto: UpdateTenantBranchDto,
  ) {
    const branch = await this.tenantBranchesDBService.findOneTenantBranch({
      where: {
        id,
      },
    });
    if (!branch) throw new NotFoundException();
    if (
      updateTenantBranchDto.ar_name &&
      updateTenantBranchDto.ar_name !== branch?.ar_name
    ) {
      const isDuplicateArName =
        await this.tenantBranchesDBService.findOneTenantBranch({
          where: {
            tenant: {
              tenant_id: branch.tenant.tenant_id,
            },
            ar_name: updateTenantBranchDto.ar_name,
          },
        });
      if (isDuplicateArName) {
        throw new ConflictException('Arabic name already exist');
      }
    }
    if (
      updateTenantBranchDto.en_name &&
      updateTenantBranchDto.en_name !== branch?.en_name
    ) {
      const isDuplicateErName =
        await this.tenantBranchesDBService.findOneTenantBranch({
          where: {
            tenant: {
              tenant_id: branch.tenant.tenant_id,
            },
            en_name: updateTenantBranchDto.en_name,
          },
        });
      if (isDuplicateErName) {
        throw new ConflictException('English name already exist');
      }
    }
    Object.assign(branch, updateTenantBranchDto);
    await this.tenantBranchesDBService.saveTenantBranch(lang, branch);
    return {
      done: true,
    };
  }

  async getTenantBranches(tenant_id: string) {
    return await this.tenantBranchesDBService.findTenantBranch({
      where: {
        tenant: {
          tenant_id,
        },
      },
    });
  }
}
