import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContractsDBService } from './DB_Service/contracts_db.service';
import { ContractStatusDBService } from './DB_Service/contract-status_db.service';
import { SystemsDBService } from 'src/systems/DB_Service/systems_db.service';
import { ServicesDBService } from 'src/services/DB_Service/services_db.service';
import { PotentialCustomersDBService } from 'src/potential-customers/DB_Service/potential-customer-db.dervice';
import { SystemsContractsDBService } from 'src/systems-contracts/DB_Service/systems-contracts_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractStatusEnum } from 'src/utils/types/enums/contract-status.enum';
import { ServiceEntity } from 'src/services/entities/service.entity';
import { SystemEntity } from 'src/systems/entities/system.entity';
import { PotentialCustomerStatus } from 'src/utils/types/enums/potential-customer.enum';
import { SignedContractDto } from './dto/signed-contract.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { UsersService } from 'src/users/users.service';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractDBService: ContractsDBService,
    private readonly contractStatusDBService: ContractStatusDBService,
    private readonly systemsDBService: SystemsDBService,
    private readonly servicesDBService: ServicesDBService,
    private readonly customersDBService: PotentialCustomersDBService,
    private readonly systemsContractsDBService: SystemsContractsDBService,
    private readonly usersDBService: UsersDBService,
    private readonly usersService: UsersService,
  ) {}
  async createContract(
    { tenant_id, lang }: UserTokenInterface,
    { systems, services, customer_id, discount, vat, w_tax }: CreateContractDto,
  ) {
    const systemsObj: { id: string; price: number }[] = JSON.parse(systems);
    if (systemsObj?.length === 0) {
      throw new BadRequestException();
    }
    const servicesIds: string[] = JSON.parse(services);
    const customer = await this.customersDBService.findOnePotentialCustomer({
      where: {
        id: customer_id,
      },
    });
    if (!customer) throw new NotFoundException();

    const servicesFetched: ServiceEntity[] = [];
    let total_price = 0;
    for (const servId of servicesIds) {
      const service = await this.servicesDBService.findOneService({
        where: {
          id: servId,
        },
      });
      if (!service) {
        throw new NotFoundException();
      }
      servicesFetched.push(service);
      total_price += Number(service.price);
    }
    const systemsFetched: SystemEntity[] = [];
    for (const oneSystem of systemsObj) {
      const system = await this.systemsDBService.findOneSystem({
        where: {
          id: oneSystem.id,
        },
      });
      if (!system) {
        throw new NotFoundException();
      }
      systemsFetched.push({ ...system, price: Number(oneSystem.price) });
      total_price += Number(oneSystem.price);
    }
    let var_total_price = Number(total_price);
    if (discount) {
      var_total_price -= var_total_price * (Number(discount) / 100);
    }
    if (vat) {
      var_total_price += var_total_price * (Number(vat) / 100);
    }
    if (w_tax) {
      var_total_price -= total_price * (Number(w_tax) / 100);
    }
    const contract = await this.contractDBService.saveContract(
      lang,
      this.contractDBService.createContractInstance({
        tenant_id,
        services: servicesFetched,
        index: await this.contractDBService.getNextIndex(
          tenant_id,
          customer_id,
        ),
        customer,
        discount,
        vat,
        w_tax,
        total_price: var_total_price,
      }),
    );
    await this.contractStatusDBService.saveContractStatus(
      lang,
      this.contractStatusDBService.createContractStatusInstance({
        tenant_id,
        index: await this.contractStatusDBService.getNextIndex(
          tenant_id,
          contract.id,
        ),
        contract,
        status: ContractStatusEnum.PENDING,
      }),
    );
    for (const system of systemsFetched) {
      await this.systemsContractsDBService.saveSystemsContract(
        lang,
        this.systemsContractsDBService.createSystemsContractInstance({
          tenant_id,
          system,
          system_price: system.price,
          contract,
        }),
      );
    }
    if (
      customer.status === PotentialCustomerStatus.PENDING ||
      customer.status === PotentialCustomerStatus.DISCUSSION ||
      customer.status === PotentialCustomerStatus.LOSTED
    ) {
      await this.customersDBService.savePotentialCustomer(lang, {
        ...customer,
        status: PotentialCustomerStatus.PRICE_DISCUSSIONS,
      });
    }
    return {
      done: true,
    };
  }
  async changeContractStatus(
    { tenant_id, lang }: UserTokenInterface,
    contract_id: string,
    status: ContractStatusEnum,
  ) {
    const contract = await this.contractDBService.findOneContract({
      where: {
        id: contract_id,
        tenant_id,
      },
      relations: ['customer'],
    });
    if (!contract) throw new NotFoundException();
    await this.contractStatusDBService.saveContractStatus(
      lang,
      this.contractStatusDBService.createContractStatusInstance({
        tenant_id,
        index: await this.contractStatusDBService.getNextIndex(
          tenant_id,
          contract_id,
        ),
        contract,
        status,
      }),
    );
    contract.curr_status = status;
    await this.contractDBService.saveContract(lang, contract);
    const savedContract = await this.contractDBService.findOneContract({
      where: {
        id: contract_id,
        tenant_id,
      },
      relations: ['customer'],
    });
    let client_id: string | null = null;
    if (
      savedContract &&
      savedContract.customer &&
      status === ContractStatusEnum.SIGNED
    ) {
      savedContract.customer.status = PotentialCustomerStatus.CONTRACTED;
      await this.customersDBService.savePotentialCustomer(
        lang,
        savedContract.customer,
      );
      const contract = await this.contractDBService.findOneContract({
        where: {
          customer: {
            id: savedContract.customer.id,
          },
          client: Not(IsNull()),
        },
        relations: ['client'],
      });
      client_id = contract ? contract.client.id : null;
    }
    return {
      done: true,
      client_id,
    };
  }
  async findOneContract(tenant_id: string, id: string) {
    const contract = await this.contractDBService
      .contractQB('contract')
      .where('contract.id = :id', { id })
      .andWhere('contract.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('contract.customer', 'customer')
      .addSelect([
        'customer.id',
        'customer.name',
        'customer.company',
        'customer.phone',
      ])
      .leftJoin('contract.status_history', 'statuses')
      .addSelect([
        'statuses.id',
        'statuses.index',
        'statuses.status',
        'statuses.created_at',
      ])
      .leftJoin('contract.services', 'services')
      .addSelect(['services.id', 'services.title', 'services.desc'])
      .leftJoin('contract.systems', 'systems_contracts')
      .addSelect(['systems_contracts.id', 'systems_contracts.created_at'])
      .leftJoin('systems_contracts.system', 'system')
      .addSelect([
        'system.id',
        'system.name',
        'system.desc',
        'system.price',
        'system.created_at',
      ])
      .orderBy('statuses.index', 'DESC')
      .getOne();
    if (!contract) throw new NotFoundException();
    return contract;
  }
  async confirmSignedContract(
    user: UserTokenInterface,
    contract_id: string,
    signedContractDto: SignedContractDto,
  ) {
    const { lang, tenant_id } = user;
    if (!signedContractDto.client_id && !signedContractDto.client_user_name) {
      throw new BadRequestException();
    }
    const contract = await this.contractDBService.findOneContract({
      where: {
        id: contract_id,
        tenant_id,
      },
    });
    if (!contract) {
      throw new NotFoundException();
    }
    let client: UserEntity;
    if (signedContractDto.client_id) {
      const clientFetched = await this.usersDBService.findOneUser({
        where: {
          id: signedContractDto.client_id,
        },
      });
      if (!clientFetched) throw new NotFoundException();
      client = clientFetched;
    } else {
      const savedUser = await this.usersService.createUser(user, {
        user_name: signedContractDto.client_user_name,
        password: signedContractDto.client_password,
        role_id: signedContractDto.client_role_id,
        email: null as any,
        phone: null as any,
      });
      client = (await this.usersDBService.findOneUser({
        where: {
          id: savedUser.id,
        },
      })) as UserEntity;
    }
    Object.assign(contract, { ...signedContractDto, client });
    await this.contractDBService.saveContract(lang, contract);
    return {
      done: true,
    };
  }
}
