import { z } from 'zod';
import texts from '../config/texts.json';

export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\d+$/, texts.validacao.apenasNumeros)
    .min(10, texts.validacao.telefoneMinimo)
    .max(15, texts.validacao.telefoneMaximo),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;
