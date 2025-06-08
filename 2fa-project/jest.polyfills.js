// Add Node.js API polyfills that are missing in the Jest environment
// This is particularly needed for packages that expect Node.js APIs
// to be available globally

// Define a simple setImmediate polyfill
global.setImmediate =
  global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || ((id) => clearTimeout(id));

// Mock TextEncoder/TextDecoder if needed
class MockTextEncoder {
  encode(input) {
    return Buffer.from(input);
  }
}

class MockTextDecoder {
  decode(input) {
    return Buffer.from(input).toString();
  }
}

global.TextEncoder = global.TextEncoder || MockTextEncoder;
global.TextDecoder = global.TextDecoder || MockTextDecoder;

// NodeJS.Timeout
global.NodeJS = global.NodeJS || {};
global.NodeJS.Timeout =
  global.NodeJS.Timeout || setTimeout(() => {}).constructor;
