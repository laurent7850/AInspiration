// The /vitest entry augments Vitest's own Assertion type (toBeInTheDocument…);
// the bare import only extends Jest's, which Vitest 5 no longer aliases.
import '@testing-library/jest-dom/vitest';

// Mock for DOMParser used in sanitizeHtml
class MockDOMParser {
  parseFromString(html: string, _type: string) {
    return {
      body: {
        innerHTML: html,
        querySelectorAll: () => [],
        createTreeWalker: () => ({
          nextNode: () => null,
          currentNode: null
        })
      }
    };
  }
}

global.DOMParser = MockDOMParser as unknown as typeof DOMParser;
