import { ContactFormData } from '@/types/contact';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateContactForm(data: ContactFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Họ tên là bắt buộc' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Họ tên phải có ít nhất 2 ký tự' });
  }

  // Email validation
  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email là bắt buộc' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Địa chỉ email không hợp lệ' });
    }
  }

  // Subject validation
  if (!data.subject.trim()) {
    errors.push({ field: 'subject', message: 'Chủ đề là bắt buộc' });
  } else if (data.subject.trim().length < 5) {
    errors.push({ field: 'subject', message: 'Chủ đề phải có ít nhất 5 ký tự' });
  }

  // Message validation
  if (!data.message.trim()) {
    errors.push({ field: 'message', message: 'Nội dung là bắt buộc' });
  } else if (data.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Nội dung phải có ít nhất 10 ký tự' });
  }

  return errors;
}

export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(error => error.field === field)?.message;
}
