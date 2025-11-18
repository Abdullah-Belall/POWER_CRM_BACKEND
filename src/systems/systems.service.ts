import { Injectable, NotFoundException } from '@nestjs/common';
import { SystemsDBService } from './DB_Service/systems_db.service';
import { SystemFeaturesDBService } from './DB_Service/system-features_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { CreateSystemDto } from './dto/create-system.dto';

@Injectable()
export class SystemsService {
  constructor(
    private readonly systemsDBService: SystemsDBService,
    private readonly systemFeaturesDBService: SystemFeaturesDBService,
  ) {}
  async addFeature(
    { tenant_id, lang }: UserTokenInterface,
    system_id: string,
    createFeatureDto: CreateFeatureDto,
  ) {
    const system = await this.systemsDBService.findOneSystem({
      where: {
        id: system_id,
        tenant_id,
      },
    });
    if (!system) throw new NotFoundException();
    await this.systemFeaturesDBService.saveSystemFeature(
      lang,
      this.systemFeaturesDBService.createSystemFeaturesInstance({
        ...createFeatureDto,
        system,
        tenant_id,
        index: await this.systemFeaturesDBService.getNextIndex(
          tenant_id,
          system_id,
        ),
      }),
    );
    return {
      done: true,
    };
  }
  async createSystem(
    { tenant_id, lang }: UserTokenInterface,
    createSystemDto: CreateSystemDto,
  ) {
    await this.systemsDBService.saveSystem(
      lang,
      this.systemsDBService.createSystemInstance({
        tenant_id,
        ...createSystemDto,
      }),
    );
    return {
      done: true,
    };
  }
}
