import { Controller } from '@nestjs/common';
import { SystemsContractsService } from './systems-contracts.service';

@Controller('systems-contracts')
export class SystemsContractsController {
  constructor(
    private readonly systemsContractsService: SystemsContractsService,
  ) {}
}
