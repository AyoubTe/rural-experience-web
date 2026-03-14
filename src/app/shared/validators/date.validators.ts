import {
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';

/**
 * Validates that the date is not in the past.
 */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;  // Let required handle emptiness

    const selected = new Date(control.value);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);

    return selected < today
      ? { notInPast: { value: control.value } }
      : null;
  };
}

/**
 * Cross-field validator: end date must be after start date.
 * Applied to the FormGroup, not a FormControl.
 */
export function endAfterStartValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end   = group.get('endDate')?.value;

    if (!start || !end) return null;

    return new Date(end) <= new Date(start)
      ? { endAfterStart: true }
      : null;
  };
}

/**
 * Validates that a number is a positive integer.
 */
export function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '') return null;

    const num = Number(control.value);
    return Number.isInteger(num) && num > 0
      ? null
      : { positiveInteger: { value: control.value } };
  };
}

/**
 * Validates price is a valid monetary amount (max 2 decimal places).
 */
export function monetaryAmountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const valid = /^\d+(\.\d{1,2})?$/.test(String(control.value));
    return valid ? null : { monetaryAmount: true };
  };
}
