import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTelegramDto {
  @IsString()
  @IsNotEmpty()
  chat_id: string;
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
