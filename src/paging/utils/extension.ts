/**
 * @file /src/utils/extension.ts
 * @name Extension
 * @description Utility functions for extensions
 */

import type { AnyExtension, Editor } from '@tiptap/core'
import type { Undefinable } from '../types/record'

/**
 * Finds an extension by its name in the editor's extension manager.
 *
 * @param editor - The editor instance containing the extension manager.
 * @param extensionName - The name of the extension to find.
 * @returns The extension if found, otherwise undefined.
 */
export const findExtension = (editor: Editor, extensionName: string): Undefinable<AnyExtension> =>
  editor.extensionManager.extensions.find((ext) => ext.name === extensionName)
