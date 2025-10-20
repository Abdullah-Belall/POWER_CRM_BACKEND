import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersDBService } from './DB_Service/users_db.service';

@Injectable()
export class UsersService {
  constructor(private readonly usersDBService: UsersDBService) {}
  async profile(id: string, tenant_id: string) {
    const user = await this.usersDBService.findOneUser({
      where: {
        id,
        tenant_id,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
  async findSupporter(tenant_id: string) {
    const [supporters, total] = await this.usersDBService.findUsers({
      where: { tenant_id },
    });
    return {
      supporters,
      total,
    };
  }
}
