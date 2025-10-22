import { jest } from '@jest/globals';

beforeEach(async () => {
  // polyfill TextEncoder/TextDecoder before loading jsdom
  const util = await import('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;

  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM(`<!doctype html><html><body><div id="products-grid"></div></body></html>`);
  global.document = dom.window.document;
  global.window = dom.window;
});

test('createProductCard returns element and triggers callbacks', async () => {
  const { createProductCard } = await import('../js/products.js');
  const product = { id: 'p1', name: 'Test', price: 9.99, description: 'desc' };
  const onAdd = jest.fn();
  const onShow = jest.fn();
  const el = createProductCard(product, { onAddToCart: onAdd, onShowDetail: onShow });
  expect(el).toBeInstanceOf(global.window.HTMLElement);
  // find button and click
  const btn = el.querySelector('button');
  expect(btn).not.toBeNull();
  btn.click();
  // Since the button stops propagation and calls onAddToCart with id, ensure it was called
  expect(onAdd).toHaveBeenCalled();
  // click on card
  el.click();
  expect(onShow).toHaveBeenCalled();
});
