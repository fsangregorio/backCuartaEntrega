import { Router } from "express";
import ProductManager from "../managers/productManager.js";

const viewsRouter = Router();
const productManager = new ProductManager("products.json");

viewsRouter.get("/", async function (req, res) {
  const products = await productManager.readFile();

  res.render("home", {
    sectionTitle: "All products",
    products: products,
  });
});
viewsRouter.get("/realtimeproducts", async function (req, res) {
  const products = await productManager.readFile();
  const io = req.app.get("io");
  io.on("connection", (socket) => {
    const productManager = new ProductManager("products.json");
    console.log(`New client found`);

    socket.on("addProduct", async (data) => {
      console.log(data);
      const {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
      } = data;
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
      console.log(newProduct);
      if (newProduct) {
        socket.emit(`productAdded`, newProduct);
      }
    });

    socket.on("deleteProduct", async (productId) => {
      const deletedProduct = await productManager.removeProductById(productId);
      if (deletedProduct) {
        console.log(`${productId}`);
        socket.emit(`productDeleted`, productId);
      }
    });
  });
  res.render("realTimeProducts", {
    sectionTitle: `Real Time Products`,
    products: products,
  });
});

export default viewsRouter;
