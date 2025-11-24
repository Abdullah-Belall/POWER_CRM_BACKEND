import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './tenants/tenants.module';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ComplaintsSolvingModule } from './complaints-solving/complaints-solving.module';
import { ComplaintsAssignerModule } from './complaints-assigner/complaints-assigner.module';
import { DelayExcuseModule } from './delay-excuse/delay-excuse.module';
import { RolesModule } from './roles/roles.module';
import { CommonModule } from './common/common.module';
import { PdfGeneratorModule } from './pdf-generator/pdf-generator.module';
import { PotentialCustomersModule } from './potential-customers/potential-customers.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { ContractsModule } from './contracts/contracts.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SystemsModule } from './systems/systems.module';
import { ServicesModule } from './services/services.module';
import { SystemsContractsModule } from './systems-contracts/systems-contracts.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        migrations: [__dirname + '/migrations/*.{js,ts}'],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TenantsModule,
    TelegramModule,
    UsersModule,
    AuthModule,
    ComplaintsModule,
    ComplaintsSolvingModule,
    ComplaintsAssignerModule,
    DelayExcuseModule,
    RolesModule,
    CommonModule,
    PdfGeneratorModule,
    PotentialCustomersModule,
    DiscussionsModule,
    ContractsModule,
    AttachmentsModule,
    SystemsModule,
    ServicesModule,
    SystemsContractsModule,
    TasksModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
