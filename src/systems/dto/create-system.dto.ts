import { IsNumber, IsString } from 'class-validator';

export class CreateSystemDto {
  @IsString()
  name: string;
  @IsString()
  desc: string;
  @IsNumber()
  price: number;
}
