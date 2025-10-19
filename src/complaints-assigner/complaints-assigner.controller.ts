import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComplaintsAssignerService } from './complaints-assigner.service';
import { CreateComplaintsAssignerDto } from './dto/create-complaints-assigner.dto';
import { UpdateComplaintsAssignerDto } from './dto/update-complaints-assigner.dto';

@Controller('complaints-assigner')
export class ComplaintsAssignerController {
  constructor(
    private readonly complaintsAssignerService: ComplaintsAssignerService,
  ) {}
}
