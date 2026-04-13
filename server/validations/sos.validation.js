const { z } = require('zod');

const locationSchema = z.union([
  z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2),
  })
]);

const submitSosSchema = z.object({
  body: z.object({
    localId: z.string().uuid().optional().or(z.string().min(1)),
    location: locationSchema,
    emergencyType: z.enum(['medical', 'fire', 'trapped', 'flood', 'other']),
    message: z.string().max(200).optional(),
    severity: z.enum(['critical', 'high', 'medium']).optional(),
  }),
});

const updateSosStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['pending', 'acknowledged', 'resolved']),
  }),
});

module.exports = { submitSosSchema, updateSosStatusSchema };
