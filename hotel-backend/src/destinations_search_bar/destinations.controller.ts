import { Controller, Get } from '@nestjs/common';
import destinations from './destinations';

@Controller('destinations')
export class DestinationsController {
  @Get()
  getDestinations() {
    return destinations;
  }
}
