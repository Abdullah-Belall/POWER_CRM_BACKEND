import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DelayExcuseService } from './delay-excuse.service';
import { CreateDelayExcuseDto } from './dto/create-delay-excuse.dto';
import { UpdateDelayExcuseDto } from './dto/update-delay-excuse.dto';

@Controller('delay-excuse')
export class DelayExcuseController {
  constructor(private readonly delayExcuseService: DelayExcuseService) {}
}
