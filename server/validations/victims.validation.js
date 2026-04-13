const { z } = require('zod');

const locationSchema = z.union([
  z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2),
  })
]);

const createVictimSchema = z.object({
  body: z.object({
    localId: z.string().uuid().optional().or(z.string().min(1)),
    name: z.string().min(1, 'Name is required'),
    location: locationSchema,
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    status: z.enum(['reported', 'in_progress', 'rescued', 'deceased']).optional(),
    notes: z.string().max(500).optional(),
  }),
});

const updateVictimSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    location: locationSchema.optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    status: z.enum(['reported', 'in_progress', 'rescued', 'deceased']).optional(),
    notes: z.string().max(500).optional(),
  }),
});

module.exports = { createVictimSchema, updateVictimSchema };
