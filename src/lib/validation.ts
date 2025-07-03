import { NextResponse } from 'next/server';
import { createErrorResponse } from './apiUtils';

export function validateRequired(data: any, fields: string[]) {
  const missingFields = fields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: createErrorResponse(
        `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: createErrorResponse(
        'Địa chỉ email không hợp lệ',
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validatePhone(phone: string) {
  const phoneRegex = /^[0-9]{10,11}$/;
  
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      error: createErrorResponse(
        'Số điện thoại không hợp lệ (phải có 10-11 số)',
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validatePassword(password: string, minLength: number = 6) {
  if (password.length < minLength) {
    return {
      valid: false,
      error: createErrorResponse(
        `Mật khẩu phải có ít nhất ${minLength} ký tự`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validateMatch(value1: string, value2: string, fieldName: string = 'Giá trị') {
  if (value1 !== value2) {
    return {
      valid: false,
      error: createErrorResponse(
        `${fieldName} không khớp`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validateMinLength(value: string, minLength: number, fieldName: string = 'Giá trị') {
  if (value.length < minLength) {
    return {
      valid: false,
      error: createErrorResponse(
        `${fieldName} phải có ít nhất ${minLength} ký tự`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validateDate(date: string, fieldName: string = 'Ngày') {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return {
      valid: false,
      error: createErrorResponse(
        `${fieldName} không hợp lệ`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validateMinAge(birthdate: string, minAge: number) {
  const birthdateObj = new Date(birthdate);
  
  if (isNaN(birthdateObj.getTime())) {
    return {
      valid: false,
      error: createErrorResponse(
        'Ngày sinh không hợp lệ',
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  const today = new Date();
  const age = today.getFullYear() - birthdateObj.getFullYear();
  const monthDiff = today.getMonth() - birthdateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateObj.getDate())) {
    // Chưa tới sinh nhật năm nay
    if (age - 1 < minAge) {
      return {
        valid: false,
        error: createErrorResponse(
          `Bạn phải từ ${minAge} tuổi trở lên`,
          400,
          'VALIDATION_ERROR'
        )
      };
    }
  } else if (age < minAge) {
    return {
      valid: false,
      error: createErrorResponse(
        `Bạn phải từ ${minAge} tuổi trở lên`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

// Thêm interface cho File để sử dụng ở cả client và server
export interface FileWithMetadata {
  name: string;
  type: string;
  size: number;
  lastModified?: number;
}

export function validateFileType(file: FileWithMetadata, allowedTypes: string[]) {
  const fileType = file.type;
  
  if (!allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: createErrorResponse(
        `Loại file không được hỗ trợ. Các loại file được phép: ${allowedTypes.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}

export function validateFileSize(file: FileWithMetadata, maxSizeInBytes: number) {
  if (file.size > maxSizeInBytes) {
    const maxSizeInMB = maxSizeInBytes / (1024 * 1024);
    return {
      valid: false,
      error: createErrorResponse(
        `Kích thước file vượt quá giới hạn cho phép (${maxSizeInMB}MB)`,
        400,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return { valid: true };
}
