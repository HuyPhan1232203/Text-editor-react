/**
 * @file /src/utils/options.ts
 * @name Options
 * @description Utility functions for retrieving extension options.
 */

import { Editor } from '@tiptap/core'
import { PAGINATION_EXTENSION_NAME } from '../constants/pagination'
import { findExtension } from './extension'
import type { Undefinable } from '../types/record'
import type { PaginationOptions } from '../PaginationExtension'

/**
 * Retrieves the options for a specified extension in the editor.
 *
 * @param editor - The editor instance containing the extensions.
 * @param extensionName - The name of the extension whose options are to be retrieved.
 * @returns The options of the specified extension, or undefined if the extension is not found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getExtensionOptions = (editor: Editor, extensionName: string): Undefinable<Record<string, any>> => {
  const extension = findExtension(editor, extensionName)

  return extension?.options
}

/**
 * Retrieves the options for the pagination extension in the editor.
 *
 * @param editor - The editor instance containing the extensions.
 * @returns The options of the pagination extension, or undefined if the extension is not found.
 * @throws An error if the pagination extension is not found in the editor.
 */
export const getPaginationExtensionOptions = (editor: Editor): PaginationOptions => {
  const options = getExtensionOptions(editor, PAGINATION_EXTENSION_NAME)

  if (!options) {
    throw new Error('Pagination extension not found in the editor.')
  }

  return options as PaginationOptions
}
