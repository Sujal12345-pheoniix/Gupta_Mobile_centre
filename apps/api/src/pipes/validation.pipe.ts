import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ValidationPipe implements PipeTransform {
  transform(value: unknown) {
    return value;
  }
}