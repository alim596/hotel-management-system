import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportMessage } from './support_message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupportMessage])],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
