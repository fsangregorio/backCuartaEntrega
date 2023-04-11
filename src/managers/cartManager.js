import fs from "fs";

import ProductManager from "./productManager.js";
const productManager = new ProductManager("products.json");

export default class CartManager {
  #carts;
  #idAuto = 1;
  constructor(path) {
    this.#carts = [];
    this.path = path;
    if (!fs.existsSync(this.path)) {
      fs.promises.writeFile(this.path, "[]");
    }
  }
  async readFile() {
    try {
      const products = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(products || []);
    } catch (error) {
      console.log(`Creating file ${this.path}...`);
      await fs.promises.writeFile(this.path, "[]");
      return [];
    }
  }
  async updateFile(newCartData) {
    await fs.promises.writeFile(this.path, JSON.stringify(newCartData));
  }

  async loadCarts() {
    return (this.#carts = await this.readFile());
  }

  async createCart() {
    const carts = await this.loadCarts();
    if (!carts.length) {
      this.#idAuto = 1;
    } else {
      this.#idAuto = carts[carts.length - 1].id + 1;
    }

    const cart = {
      id: this.#idAuto,
      products: [],
    };
    carts.push(cart);
    await this.updateFile(carts);
  }
  async getCart(cartId) {
    try {
      const carts = await this.readFile();
      const cart = carts.find((cart) => cart.id === cartId);
      if (!cart) {
        throw Error("Cart not found");
      }
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  async updateCartById(cartId, updatedCart) {
    try {
      const carts = await this.readFile();
      const index = carts.findIndex((cart) => cart.id === cartId);
      if (index < 0) {
        throw Error(`Cart not found`);
      }

      carts[index].products = updatedCart.products;
      await this.updateFile(carts);
      return "Updated cart";
    } catch (error) {
      console.log(error);
    }
  }

  async addProduct(cartId, productId) {
    try {
      if (cartId === undefined || productId === undefined) {
        throw new Error(`Error`);
      }
      const cart = await this.getCart(cartId);
      const product = await productManager.getProductsById(productId);
      const newProduct = { id: productId, qty: 1 };
      if (!cart) {
        throw Error(`Cart not found`);
      }
      if (!product) {
        throw Error(`Product not found`);
      }
      const productIndex = cart.products.findIndex(
        (product) => product.id === productId
      );
      if (productIndex < 0) {
        cart.products.push(newProduct);
        return await this.updateCartById(cartId, cart);
      }
      cart.products[productIndex].qty++;

      return await this.updateCartById(cartId, cart);
    } catch (error) {
      console.log(error);
    }
  }
}
