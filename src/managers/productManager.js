import fs from "fs";
export default class ProductManager {
  #products;
  #idAuto = 1;
  constructor(path) {
    this.#products = [];
    this.path = path;
    if (!fs.existsSync(this.path)) {
      fs.promises.writeFile(this.path, "[]");
    }
  }

  async readFile() {
    try {
      const products = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(products);
    } catch (error) {
      console.log(`Creating file ${this.path}...`);
      await fs.promises.writeFile(this.path, "[]");
      return [];
    }
  }

  async updateFile(newProductData) {
    await fs.promises.writeFile(this.path, JSON.stringify(newProductData));
  }

  async loadProducts() {
    return (this.#products = await this.readFile());
  }

  async getProducts() {
    try {
      await this.loadProducts();
      return this.#products;
    } catch (error) {
      console.log(error);
    }
  }

  async createProduct({
    code,
    title,
    description,
    price,
    status,
    stock,
    category,
    thumbnails,
  }) {
    try {
      const products = await this.loadProducts();
      if (
        title === undefined ||
        description === undefined ||
        price === undefined ||
        code === undefined ||
        stock === undefined ||
        category === undefined
      ) {
        throw new Error("Missing data from products");
      }
      const sameCode = this.#products.find((p) => p.code === code);
      if (sameCode) {
        throw Error("Repeated product code");
      }

      if (!products.length) {
        this.#idAuto = 1;
      } else {
        this.#idAuto = products[products.length - 1].id + 1;
      }
      const product = {
        id: this.#idAuto,
        code,
        title,
        description,
        price,
        status: status || true,
        category,
        stock,
        thumbnails: thumbnails || [],
      };

      products.push(product);
      await this.updateFile(products);
      return product;
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsById(productId) {
    try {
      const products = await this.readFile();
      const product = products.find((p) => p.id === productId);
      if (!product) {
        throw Error("File doesn't exist");
      }
      return product;
    } catch (error) {
      console.log(error);
    }
  }

  async updateProductById(productId, newProductData) {
    try {
      const products = await this.loadProducts();
      const index = products.findIndex((p) => p.id === productId);
      if (index < 0) {
        throw Error(`ID not found: ${productId}.`);
      }
      products[index] = {
        id: productId,
        ...products[index],
        ...newProductData,
      };
      await this.updateFile(products);
      console.log(`Product ${productId} updated`);
    } catch (error) {
      console.log(error);
    }
  }

  async removeProductById(productId) {
    try {
      const products = await this.loadProducts();
      const index = products.findIndex((p) => p.id === productId);
      if (index < 0) {
        throw Error(`ID ${productId} not found.`);
      }
      products.splice(index, 1);
      await this.updateFile(products);
      return `File ${productId} deleted`;
    } catch (error) {
      console.log(error);
    }
  }
}
