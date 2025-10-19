import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComplaintsSolvingService } from './complaints-solving.service';
import { CreateComplaintsSolvingDto } from './dto/create-complaints-solving.dto';
import { UpdateComplaintsSolvingDto } from './dto/update-complaints-solving.dto';

@Controller('complaints-solving')
export class ComplaintsSolvingController {
  constructor(
    private readonly complaintsSolvingService: ComplaintsSolvingService,
  ) {}
}
