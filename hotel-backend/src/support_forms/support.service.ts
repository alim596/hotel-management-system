import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportMessage } from './support_message.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportMessage)
    private readonly supportRepo: Repository<SupportMessage>,
  ) {}

  create(data: Partial<SupportMessage>) {
    const message = this.supportRepo.create(data);
    return this.supportRepo.save(message);
  }

  async findAll(): Promise<SupportMessage[]> {
    return this.supportRepo.find();
  }
}
