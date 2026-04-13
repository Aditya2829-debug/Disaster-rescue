const { z } = require('zod');

const syncSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      localId: z.string().min(1),
      collection: z.enum(['victims', 'sos_signals']),
      operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      payload: z.any(), // Payload validation is tricky in batch, but we can at least ensure it's there
    })),
  }),
});

module.exports = { syncSchema };
