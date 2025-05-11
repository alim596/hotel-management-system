import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './room-types/room-types.module';

@Module({
  imports: [HotelsModule, RoomTypesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
