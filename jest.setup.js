import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Polyfill for Next.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;