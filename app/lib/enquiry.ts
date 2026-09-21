// Enquiry form fields and validation, shared by the form (browser) and the
// route handler (server) so both apply the same rules. The server check is the
// one that counts; the browser check only saves a round trip.

import type { FormField } from './content';

export type FieldName = 'name' | 'telephone' | 'email' | 'message';
export type EnquiryValues = Record<FieldName, string>;
export type EnquiryErrors = Partial<Record<FieldName, string>>;

// The live Divi forms used generated names; the port uses plain ones.
export const fieldName = (field: FormField): FieldName =>
  field.type === 'email' ? 'email' : field.type === 'tel' ? 'telephone' : field.type === 'textarea' ? 'message' : 'name';

// Every live form marks its fields required. Telephone only exists on the full form.
export const REQUIRED: Record<'quick' | 'full', FieldName[]> = {
  quick: ['name', 'email', 'message'],
  full: ['name', 'telephone', 'email', 'message'],
};

const LIMITS: Record<FieldName, number> = { name: 200, telephone: 40, email: 254, message: 5000 };

// Hidden field that people never see or fill in; bots often do.
export const HONEYPOT = 'company';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s()-]{5,}$/;

export function validateEnquiry(values: Partial<EnquiryValues>, variant: 'quick' | 'full'): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const field of REQUIRED[variant]) {
    const value = (values[field] ?? '').trim();
    if (!value) {
      errors[field] = 'Please fill in this field.';
      continue;
    }
    if (value.length > LIMITS[field]) errors[field] = `Please keep this under ${LIMITS[field]} characters.`;
    else if (field === 'email' && !EMAIL.test(value)) errors[field] = 'Please enter a valid email address.';
    else if (field === 'telephone' && !PHONE.test(value)) errors[field] = 'Please enter a valid phone number.';
  }
  return errors;
}
