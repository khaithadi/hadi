import { z } from 'zod';
import { PROPERTY_TYPES } from '@/lib/constants';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional(),
  phone: z.string().min(9).max(20).optional(),
  password: z.string().min(8).max(128),
  role: z.enum(['guest', 'host']).default('guest'),
  locale: z.enum(['ar', 'fr', 'en']).default('ar'),
}).refine((d) => d.email || d.phone, { message: 'Email or phone is required' });

export const loginSchema = z.object({
  identifier: z.string().min(3), // email or phone
  password: z.string().min(1),
});

export const otpSendSchema = z.object({
  phone: z.string().min(9).max(20),
  purpose: z.enum(['login', 'register', 'recover']).default('login'),
});

export const otpVerifySchema = z.object({
  phone: z.string().min(9).max(20),
  code: z.string().length(6),
  purpose: z.enum(['login', 'register', 'recover']).default('login'),
});

export const propertySearchSchema = z.object({
  wilaya: z.coerce.number().int().min(1).max(58).optional(),
  q: z.string().optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  guests: z.coerce.number().int().min(1).optional(),
  amenities: z.string().optional(), // comma-separated keys
  minRating: z.coerce.number().min(0).max(5).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  sort: z.enum(['recommended', 'price_asc', 'price_desc', 'rating']).default('recommended'),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
});

export const propertyCreateSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  type: z.enum(PROPERTY_TYPES),
  wilayaId: z.coerce.number().int().min(1).max(58),
  municipalityId: z.string().optional(),
  addressLine: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  capacity: z.coerce.number().int().min(1).max(50),
  rooms: z.coerce.number().int().min(0).max(30),
  beds: z.coerce.number().int().min(1).max(50),
  bathrooms: z.coerce.number().int().min(1).max(20),
  pricePerNight: z.coerce.number().int().min(500),
  cleaningFee: z.coerce.number().int().min(0).default(0),
  securityDeposit: z.coerce.number().int().min(0).default(0),
  minNights: z.coerce.number().int().min(1).default(1),
  bookingMode: z.enum(['request', 'instant']).default('request'),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('11:00'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  houseRules: z.array(z.string()).default([]),
});

export const bookingCreateSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.coerce.number().int().min(1),
  method: z.enum(['mock', 'satim_cib', 'edahabia', 'baridimob', 'bank_transfer', 'cash']).default('mock'),
});

export const reviewCreateSchema = z.object({
  bookingId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const messageCreateSchema = z.object({
  conversationId: z.string(),
  body: z.string().min(1).max(2000),
  attachmentUrl: z.string().url().optional(),
});

export const conversationCreateSchema = z.object({
  bookingId: z.string(),
});

export type PropertySearchParams = z.infer<typeof propertySearchSchema>;
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
