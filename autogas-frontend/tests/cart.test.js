import { jest } from '@jest/globals';
import * as Cart from '../js/cart.js';

beforeEach(() => {
  sessionStorage.clear();
});

test('addToCart adds new item and increments quantity', async () => {
  const product = { id: 'p1', name: 'Prod', price: 10 };
  await Cart.addToCart(product);
  let cart = await Cart.getCart();
  expect(cart.length).toBe(1);
  expect(cart[0].quantity).toBe(1);

  // add same product again
  await Cart.addToCart(product);
  cart = await Cart.getCart();
  expect(cart.length).toBe(1);
  expect(cart[0].quantity).toBe(2);
});

test('getCartTotalItems and getCartTotalPrice compute correctly', async () => {
  const p1 = { id: 'p1', name: 'P1', price: '5' };
  const p2 = { id: 'p2', name: 'P2', price: '3.5' };
  await Cart.addToCart(p1);
  await Cart.addToCart(p2);
  await Cart.addToCart(p2);

  const totalItems = await Cart.getCartTotalItems();
  const totalPrice = await Cart.getCartTotalPrice();

  expect(totalItems).toBe(3);
  expect(totalPrice).toBeCloseTo(5 + 3.5 * 2, 5);
});
