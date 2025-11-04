import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

export interface ComplaintsFilterInterface {
  have_max_time_to_solve?: boolean | string;
  client_id?: string;
  status?: ComplaintStatusEnum;
  accept_excuse?: boolean | null | string;
  created_from?: Date;
  created_to?: Date;
  ordered_by?: 'DESC' | 'ASC';
}
