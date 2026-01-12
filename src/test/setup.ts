import '@testing-library/jest-dom';

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
