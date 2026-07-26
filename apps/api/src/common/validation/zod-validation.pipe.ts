import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

/**
 * Runtime input validation at the API boundary (spec §16.10: "runtime
 * input is validated with Zod at the boundary").
 *
 * Usage: `@Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto`
 *
 * Security notes:
 *  - Zod strips unknown keys by default (`.strip()`), so mass-assignment
 *    of unexpected fields is structurally impossible.
 *  - Error responses list field paths and messages only — never echo the
 *    submitted values back to the caller.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  // `ZodType<T, any, any>` (not `ZodType<T>`) so schemas whose INPUT type
  // differs from their OUTPUT — anything using `.default()`, `.transform()` or
  // `.pipe()` (e.g. the multi-select facet params, §5.2) — still type-check.
  constructor(private readonly schema: ZodType<T, any, any>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    return result.data;
  }
}
