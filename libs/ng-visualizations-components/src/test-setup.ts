import 'jest-preset-angular/setup-jest';

Object.defineProperty(window, 'PointerEvent', {
  value: class PointerEvent {}
});
