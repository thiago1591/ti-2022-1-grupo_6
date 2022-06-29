require('dotenv').config()
const { v4 } = require("uuid");
const { CartModel } = require("../models/Cart");
const { Product } = require("../modules/products/models/Product");

const userId = "123456";

module.exports = {
    async getCart(req, res) {
        try {
            const cartExists = await CartModel.findOne({ userId })

            if (!cartExists) {
                throw new Error("Carrinho não existe!");
            }

            return res.json(cartExists);
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    },

    async addProduct(req, res) {
        try {
            let {
                productId,
                quantity
            } = req.body;

            const productExists = await Product.findOne({ _id: productId });

            if (!productExists) {
                throw new Error("produto não existe!");
            }

            const cartExists = await CartModel.findOne({ userId })

            let cart = [];

            if (!cartExists) {
                cart = await CartModel.create({
                    userId,
                    products: [{productId, quantity}],
                });

                return res.json(cart);
            } else {
                const productExistsInCart = cartExists.products.find(product => {
                    if (product.productId === productId) 
                        return true
                });
    
                if (productExistsInCart) {
                    await CartModel.updateOne({ 
                        userId, 
                        "products.productId": productExistsInCart.productId
                    }, {
                        $inc: { "products.$.quantity": 1}
                    });

                    return res.json({message: "carinho atualizado!"});
                }
    
                await cartExists.updateOne(
                    { $push: {products: [{productId, quantity}]} }
                )
        
                return res.json({message: "carinho atualizado!"});
            }
        } catch (error) {
			return res.status(400).json({message: error.message});
        }
    },

    async updateProduct(req, res) {
        try {
            const {productId} = req.params;
            const {quantity} = req.body;

            const cartExists = await CartModel.findOne({ userId })

            if (!cartExists) {
                throw new Error("Carrinho não existe!");
            }

            const productExists = await Product.findOne({ _id: productId });

            if (!productExists) {
                throw new Error("produto não existe!");
            }
            
            if (!quantity) {
                throw new Error("quantidade de produto não definida");
            }

            if (quantity < 1) {
                throw new Error("quantidade precisa ser maior que 0");
            }

            await CartModel.updateOne({ 
                userId,
                "products.productId": productId
            }, {
                $set: { "products.$.quantity": quantity}
            });

            return res.json({message: "produto atualizado com sucesso!"});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    },

    async deleteProduct(req, res) {
        try {
            const {productId} = req.params;

            const cartExists = await CartModel.findOne({ userId });

            if (!cartExists) {
                throw new Error("Carrinho não existe!");
            }

            const productExistsInCart = cartExists.products.find( product => 
                product.productId === productId
            );

            if (!productExistsInCart) {
                throw new Error("produto não existe!");
            }
            
            await CartModel.updateOne({ 
                userId
            }, {
                $pull: { products: { productId: productId } }
            });

            return res.json({message: "produto removido com sucesso!"});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    },

    async deleteAll(req, res) {
        try {
            const cartExists = await CartModel.findOne({ userId });

            if (!cartExists) {
                throw new Error("Carrinho não existe!");
            }

            await CartModel.deleteOne({ userId });

            return res.json({message: "carrinho removido com sucesso!"});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
}
