import {tap} from 'rxjs/operators';
import {MonoTypeOperatorFunction} from 'rxjs';
import {NgZone} from '@angular/core';

/**
 * Operator which throws an error if inside the Angular zone.
 */
export function throwIfInAngularZone<T>(message: string): MonoTypeOperatorFunction<T> {
  return tap(() => {
    if (NgZone.isInAngularZone()) {
      throw Error(`[ZoneError] Call must not be in Angular zone [${message}]`);
    }
  });
}
