import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SupportMessage } from './support_message.entity';

interface DatabaseResult {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

interface DatabaseError extends Error {
  message: string;
}

interface RawSupportMessage {
  MessageID: number;
  UserID: number;
  Subject: string;
  Content: string;
  Category: string;
  Priority: string;
  Status: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  AssignedTo?: number;
  Resolution?: string;
}

@Injectable()
export class SupportService {
  constructor(private readonly dataSource: DataSource) {}

  async create(data: Partial<SupportMessage>): Promise<SupportMessage> {
    try {
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map(() => '?').join(', ');

      const query = `
        INSERT INTO SupportMessages (${columns}) 
        VALUES (${placeholders})
      `;

      const result = await this.dataSource.query<DatabaseResult[]>(
        query,
        values,
      );
      return this.findOne(result[0].insertId);
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to create support message: ${dbError.message}`);
    }
  }

  async findAll(): Promise<SupportMessage[]> {
    try {
      const query = `
        SELECT * FROM SupportMessages 
        ORDER BY CreatedAt DESC
      `;
      const messages = await this.dataSource.query<RawSupportMessage[]>(query);
      return this.mapSupportMessageResults(messages);
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to fetch support messages: ${dbError.message}`);
    }
  }

  async findOne(id: number): Promise<SupportMessage> {
    try {
      const query = `
        SELECT * FROM SupportMessages 
        WHERE MessageID = ?
      `;
      const [message] = await this.dataSource.query<RawSupportMessage[]>(
        query,
        [id],
      );

      if (!message) {
        throw new Error(`Support message with ID ${id} not found`);
      }

      return this.mapSupportMessageResults([message])[0];
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to fetch support message: ${dbError.message}`);
    }
  }

  async update(
    id: number,
    data: Partial<SupportMessage>,
  ): Promise<SupportMessage> {
    try {
      const updates = Object.entries(data)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(data), id];

      const query = `
        UPDATE SupportMessages 
        SET ${updates} 
        WHERE MessageID = ?
      `;

      await this.dataSource.query(query, values);
      return this.findOne(id);
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to update support message: ${dbError.message}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const query = `
        DELETE FROM SupportMessages 
        WHERE MessageID = ?
      `;

      await this.dataSource.query(query, [id]);
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to delete support message: ${dbError.message}`);
    }
  }

  private mapSupportMessageResults(
    results: RawSupportMessage[],
  ): SupportMessage[] {
    return results.map((result) => {
      const message = new SupportMessage();
      Object.assign(message, {
        MessageID: result.MessageID,
        UserID: result.UserID,
        Subject: result.Subject,
        Content: result.Content,
        Category: result.Category,
        Priority: result.Priority,
        Status: result.Status,
        CreatedAt: result.CreatedAt,
        UpdatedAt: result.UpdatedAt,
        AssignedTo: result.AssignedTo,
        Resolution: result.Resolution,
      });
      return message;
    });
  }
}
