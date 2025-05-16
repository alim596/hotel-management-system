import { Controller, Get, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportMessage } from './support_message.entity';

@Controller('support') // 👈 this part is key!
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  create(@Body() body: Partial<SupportMessage>) {
    return this.supportService.create(body);
  }

  @Get()
  getAllMessages() {
    return this.supportService.findAll(); // ✅ correct call
  }
}

