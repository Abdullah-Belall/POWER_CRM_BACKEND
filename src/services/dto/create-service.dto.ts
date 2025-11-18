import { IsNumber, IsString } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  title: string;
  @IsString()
  desc: string;
  @IsNumber()
  price: number;
}
