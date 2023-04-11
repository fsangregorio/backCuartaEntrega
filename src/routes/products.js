import { Router } from "express";
import { body, validationResult } from "express-validator";
import ProductManager from "../managers/productManager.js";

const productRouter = Router();

const productManager = new ProductManager("products.json");

productRouter.get("/", async (req, res) => {
  const products = await productManager.readFile();
  const limit = +req.query.limit;
  if (!limit) {
    return res.status(200).json(products);
  }
  const productLimited = products.slice(0, limit);
  res.status(200).json(productLimited);
});

productRouter.get("/:productId", async (req, res) => {
  const productId = +req.params.productId;
  const product = await productManager.getProductsById(productId);
  if (!product) return res.status(404).json({ message: `File doesn't exist` });
  res.status(200).json(product);
});

productRouter.post(
  "/",
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("code").trim().notEmpty(),
    body("price").isNumeric().toFloat(),
    body("status").notEmpty().toBoolean(),
    body("stock").isNumeric().toInt(),
    body("category").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;
    const newProduct = await productManager.createProduct({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });
    if (!newProduct)
      return res.status(404).json({
        message: `Product already in cart`,
      });
    const io = req.app.get("io");
    io.emit(`productAdded`, newProduct);
    return res.status(200).json({ message: newProduct });
  }
);
productRouter.put("/:productId", async (req, res) => {
  const productId = +req.params.productId;
  const newProductData = req.body;
  console.log(newProductData);
  await productManager.updateProductById(productId, newProductData);
  return res
    .status(203)
    .json({ message: `Product updated`, newProductData });
});

productRouter.delete("/:productId", async (req, res) => {
  const productId = +req.params.productId;
  const deletedProduct = await productManager.removeProductById(productId);
  console.log(deletedProduct);
  if (!deletedProduct) {
    return res.status(404).json({
      message: `Product not found`,
    });
  }
  const io = req.app.get("io");
  io.emit("productDeleted", productId);
  return res.status(200).json(`Product '${productId}' deleted`);
});
export default productRouter;
