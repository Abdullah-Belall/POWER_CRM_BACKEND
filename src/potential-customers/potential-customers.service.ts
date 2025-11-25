import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PotentialCustomersDBService } from './DB_Service/potential-customer-db.dervice';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreatePotentialCustomerDto } from './dto/create-potential-customer.dto';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { PotentialCustomerStatus } from 'src/utils/types/enums/potential-customer.enum';
import { Brackets } from 'typeorm';
import { UpdatePotentialCustomerDto } from './dto/update-potential-customer.dto';
import * as XLSX from 'xlsx';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { PotentialCustomerEntity } from './entities/potential-customer.entity';

@Injectable()
export class PotentialCustomersService {
  constructor(
    private readonly customersDBService: PotentialCustomersDBService,
    private readonly usersDBService: UsersDBService,
  ) {}
  async addNew(
    { tenant_id, lang, id }: UserTokenInterface,
    createPotentialCustomerDto: CreatePotentialCustomerDto,
  ) {
    const assigner = await this.usersDBService.findOneUser({
      where: {
        id,
        tenant_id,
      },
    });
    if (!assigner) throw new NotFoundException();
    await this.customersDBService.savePotentialCustomer(
      lang,
      this.customersDBService.createPotentialCustomerInstance({
        ...createPotentialCustomerDto,
        assigner,
        tenant_id,
        index: await this.customersDBService.getNextIndex(tenant_id),
      }),
    );
    return { done: true };
  }
  async importExcel({ tenant_id, id, lang }: UserTokenInterface, path: string) {
    const workbook = XLSX.readFile(path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);
    const assigner = await this.usersDBService.findOneUser({
      where: {
        id,
        tenant_id,
      },
    });
    if (!assigner) {
      throw new NotFoundException();
    }
    let customers: PotentialCustomerEntity[] = [];
    for (const row of data) {
      const user = this.customersDBService.createPotentialCustomerInstance({
        tenant_id,
        assigner,
        index:
          Number(await this.customersDBService.getNextIndex(tenant_id)) + 1,
        name: row['Customer_Name'] ? row['Customer_Name']?.trim() : 'No Name',
        source: row['source'] ? row['source']?.trim() : undefined,
        note: row['Feedback'] ? row['Feedback']?.trim() : undefined,
        company: row['Company_Name'] ? row['Company_Name']?.trim() : undefined,
        phone: row['Contact'] ? `+20` + row['Contact']?.trim() : undefined,
      });
      customers.push(user);
    }
    await this.customersDBService.savePotentialCustomer(lang, customers as any);
    return { done: true };
  }
  async editCustomerData(
    { tenant_id, lang }: UserTokenInterface,
    customer_id: string,
    updateCustomerDto: UpdatePotentialCustomerDto,
  ) {
    const customer = await this.customersDBService.findOnePotentialCustomer({
      where: {
        id: customer_id,
        tenant_id,
      },
    });
    if (!customer) {
      throw new NotFoundException();
    }
    await this.customersDBService.savePotentialCustomer(lang, {
      ...customer,
      ...updateCustomerDto,
    });
    return {
      done: true,
    };
  }
  async assignSaler(
    { tenant_id, lang }: UserTokenInterface,
    customer_id: string,
    saler_id: string,
  ) {
    const customer = await this.customersDBService.findOnePotentialCustomer({
      where: {
        id: customer_id,
        tenant_id,
      },
    });
    if (!customer) throw new NotFoundException();
    const saler = await this.usersDBService.findOneUser({
      where: {
        id: saler_id,
        tenant_id,
      },
    });
    if (!saler) throw new NotFoundException();
    await this.customersDBService.savePotentialCustomer(lang, {
      ...customer,
      saler,
    });
    return {
      done: true,
    };
  }
  async changeStatus(
    { tenant_id, id, lang }: UserTokenInterface,
    customer_id: string,
    status: PotentialCustomerStatus,
  ) {
    const customer = await this.customersDBService.findOnePotentialCustomer({
      where: {
        id: customer_id,
        tenant_id,
      },
    });
    if (!customer) throw new NotFoundException();
    customer.status = status;
    await this.customersDBService.savePotentialCustomer(lang, customer);
    return {
      done: true,
    };
  }
  async findCustomers(tenant_id: string, user_id?: string) {
    const qb = this.customersDBService
      .potentialCustomerQB('cust')
      .leftJoin('cust.assigner', 'assigner')
      .leftJoin('cust.saler', 'saler')
      .loadRelationCountAndMap('cust.contracts_count', 'cust.contracts')
      .addSelect([
        'assigner.id',
        'assigner.user_name',
        'saler.id',
        'saler.user_name',
      ])
      .where('cust.tenant_id = :tenant_id', { tenant_id });

    if (user_id) {
      qb.andWhere(
        new Brackets((subqb) =>
          subqb
            .where('assigner.id = :id', { id: user_id })
            .orWhere('saler.id = :id', { id: user_id }),
        ),
      );
    }

    const [customers, total] = await qb
      .orderBy('cust.created_at', 'DESC')
      .getManyAndCount();
    return {
      customers,
      total,
    };
  }
  async customerProfile(tenant_id: string, id: string) {
    const customer = await this.customersDBService
      .potentialCustomerQB('customer')
      .where('customer.id = :id', { id })
      .andWhere('customer.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('customer.saler', 'saler')
      .addSelect(['saler.id', 'saler.user_name', 'saler.index', 'saler.email'])
      .leftJoin('customer.contracts', 'contract')
      .addSelect([
        'contract.id',
        'contract.index',
        'contract.curr_status',
        'contract.discount',
        'contract.vat',
        'contract.w_tax',
        'contract.total_price',
        'contract.created_at',
      ])
      .loadRelationCountAndMap('contract.systems_count', 'contract.systems')
      .leftJoin('customer.discussions', 'discuss')
      .addSelect([
        'discuss.index',
        'discuss.details',
        'discuss.status',
        'discuss.created_at',
      ])
      .leftJoin('discuss.discussant', 'discussant')
      .addSelect(['discussant.id', 'discussant.user_name'])
      .orderBy('discuss.index', 'DESC')
      .addOrderBy('contract.index', 'DESC')
      .getOne();
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }
}
