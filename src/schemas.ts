import { z } from 'zod';

export const ImportItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().max(50).optional().default(''),
  category: z.string().min(1).max(100),
  checked: z.boolean().optional().default(false),
});

export const ImportPayloadSchema = z.object({
  version: z.number().optional(),
  name: z.string().min(1).max(200),
  items: z.array(ImportItemSchema).max(2000),
  timestamp: z.number().optional(),
});

export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
