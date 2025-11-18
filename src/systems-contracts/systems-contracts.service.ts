import { Injectable } from '@nestjs/common';
import { SystemsContractsDBService } from './DB_Service/systems-contracts_db.service';

@Injectable()
export class SystemsContractsService {
  constructor(
    private readonly systemsContractsDBService: SystemsContractsDBService,
  ) {}
}
