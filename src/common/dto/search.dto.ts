import { IsIn, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsIn(['users'])
  search_in: string;
  @IsString()
  search_with: string;
  @IsString()
  @IsOptional()
  column: string;
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  created_sort: 'ASC' | 'DESC';
}
