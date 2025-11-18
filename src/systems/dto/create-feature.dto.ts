import { IsString } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  title: string;
  @IsString()
  details: string;
}
