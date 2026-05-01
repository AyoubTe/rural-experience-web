import { CanDeactivateFn } from '@angular/router';

/** Interface that components must implement to support the guard */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Warns the user before navigating away from a form with unsaved changes.
 * Used on the experience creation and edit forms.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;

  return window.confirm(
    'You have unsaved changes. ' +
    'Are you sure you want to leave this page?'
  );
};
