import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportMessage } from './support_message.entity';

interface CreateSupportMessageDto {
  UserID: number;
  Subject: string;
  Content: string;
  Category?: string;
  Priority?: string;
}

interface DatabaseError extends Error {
  message: string;
}

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async create(@Body() body: CreateSupportMessageDto): Promise<SupportMessage> {
    try {
      // Validate required fields
      if (!body.UserID || !body.Subject || !body.Content) {
        throw new HttpException(
          'UserID, Subject, and Content are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const supportMessage: Partial<SupportMessage> = {
        UserID: body.UserID,
        Subject: body.Subject,
        Content: body.Content,
        Category: body.Category,
        Priority: body.Priority,
        Status: 'Open',
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      return await this.supportService.create(supportMessage);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new HttpException(
        `Failed to create support message: ${dbError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllMessages(): Promise<SupportMessage[]> {
    try {
      return await this.supportService.findAll();
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new HttpException(
        `Failed to fetch support messages: ${dbError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<SupportMessage> {
    try {
      const message = await this.supportService.findOne(id);
      if (!message) {
        throw new HttpException(
          'Support message not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new HttpException(
        `Failed to fetch support message: ${dbError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateSupportMessageDto>,
  ): Promise<SupportMessage> {
    try {
      const updateData: Partial<SupportMessage> = {
        ...(body.UserID && { UserID: body.UserID }),
        ...(body.Subject && { Subject: body.Subject }),
        ...(body.Content && { Content: body.Content }),
        ...(body.Category && { Category: body.Category }),
        ...(body.Priority && { Priority: body.Priority }),
        UpdatedAt: new Date(),
      };

      const message = await this.supportService.update(id, updateData);
      if (!message) {
        throw new HttpException(
          'Support message not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new HttpException(
        `Failed to update support message: ${dbError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    try {
      await this.supportService.delete(id);
      return { message: 'Support message deleted successfully' };
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new HttpException(
        `Failed to delete support message: ${dbError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
