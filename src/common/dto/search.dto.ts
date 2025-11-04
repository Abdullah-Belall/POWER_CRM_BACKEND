import { IsIn, IsOptional, IsString } from 'class-validator';
import { allowedSearchTables } from 'src/utils/base';

export class SearchDto {
  @IsIn(allowedSearchTables)
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
