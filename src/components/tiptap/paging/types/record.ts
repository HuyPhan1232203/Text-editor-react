/**
 * @file /src/types/record.ts
 * @name Record
 * @description This file contains utility types for working with records.
 */

/**
 * A type definition for a nullable record. Allows records to be either T or null.
 *
 * @param T - The type of the record.
 * @returns The record or null.
 */
export type Nullable<T> = T | null

/**
 * A type definition for an undefined record. Allows records to be either T or undefined.
 *
 * @param T - The type of the record.
 * @returns The record or undefined.
 */
export type Undefinable<T> = T | undefined
