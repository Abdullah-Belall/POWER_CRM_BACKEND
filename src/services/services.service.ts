import { Injectable } from '@nestjs/common';
import { ServicesDBService } from './DB_Service/services_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesDBService: ServicesDBService) {}

  async createService(
    { tenant_id, lang }: UserTokenInterface,
    createServiceDto: CreateServiceDto,
  ) {
    await this.servicesDBService.saveService(
      lang,
      this.servicesDBService.createServiceInstance({
        tenant_id,
        ...createServiceDto,
      }),
    );
    return {
      done: true,
    };
  }
}
