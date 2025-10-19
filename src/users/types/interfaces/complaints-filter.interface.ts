import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

export interface ComplaintsFilterInterface {
  have_max_time_to_solve?: boolean | string;

  status?: string; // ComplaintStatusEnum[]
  accept_excuse?: boolean | null | string;
  created_from?: Date;
  created_to?: Date;
}
