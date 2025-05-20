"use server";

/**
 * Utility functions to standardize field naming across the application
 * This helps handle inconsistencies between database column names and code field names
 */

type FieldMappingConfig = {
  [key: string]: string;
}

// Define mapping between database column names and code field names
const DB_TO_CODE_MAPPING: FieldMappingConfig = {
  'poster_image': 'poster_url',
  'actors': 'cast'
};

const CODE_TO_DB_MAPPING: FieldMappingConfig = {
  'poster_url': 'poster_image',
  'cast': 'actors'
};

/**
 * Standardizes database field names to code field names
 * @param data The data object from database
 * @returns A new object with standardized field names
 */
export function standardizeFromDB(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => standardizeFromDB(item));
  }

  const result = { ...data };

  for (const [dbField, codeField] of Object.entries(DB_TO_CODE_MAPPING)) {
    if (dbField in result) {
      // Set the standardized field name but keep the original too for backward compatibility
      result[codeField] = result[dbField];
    }
  }

  return result;
}

/**
 * Standardizes code field names to database column names
 * @param data The data object from code
 * @returns A new object with standardized field names for database operations
 */
export function standardizeToDB(data: any): any {
  if (!data) return data;

  const result = { ...data };

  for (const [codeField, dbField] of Object.entries(CODE_TO_DB_MAPPING)) {
    if (codeField in result) {
      // Set the standardized field name but keep the original too for backward compatibility
      result[dbField] = result[codeField];
    }
  }

  return result;
}

/**
 * Gets a field value handling both naming conventions
 * @param data The data object
 * @param primaryField The primary field name
 * @param alternateField The alternate field name
 * @param defaultValue Default value if neither field exists
 * @returns The value of the field
 */
export function getField(data: any, primaryField: string, alternateField: string, defaultValue: any = ''): any {
  if (!data) return defaultValue;

  return data[primaryField] !== undefined ? data[primaryField] :
    data[alternateField] !== undefined ? data[alternateField] :
      defaultValue;
}
