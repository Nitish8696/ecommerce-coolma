const Product = require("../models/Product");
const express = require("express");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js")
const path = require("path");
const router = require("express").Router();

const multer = require('multer');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public'); // Destination directory for uploaded files
    },
    filename: function (req, file, cb) {
        return cb(null, Date.now() + path.extname(file.originalname)); // File naming
    }
});

const upload = multer({ storage: storage });

router.post("/",verifyTokenAndAdmin , upload.array('images'),async (req, res) => {

    const categoryArray = JSON.parse(req.body.category);
    const variable = JSON.parse(req.body.variable);

    let productimages = []

    const productImagesLocalpath = () => {
        req.files?.forEach(file => {
            productimages.push(file.filename)
        })
    }

    await productImagesLocalpath()

    const isVariable = JSON.parse(req.body.isVariable)

    const stock = JSON.parse(req.body.stock)
    

    const salePrice = JSON.parse(req.body.salePrice)
    const regularPrice = JSON.parse(req.body.regularPrice)

     let newProduct;

    if (isVariable) {
         newProduct = new Product({
            title: req.body.title,
            desc: req.body.description,
            img: productimages,
            categories: categoryArray,
            inStock: stock,
            isVariable: isVariable,
            variable: variable
        })
    }
    else {
         newProduct = new Product({
            title: req.body.title,
            desc: req.body.description,
            img: productimages,
            categories: categoryArray,
            inStock: stock,
            isVariable: isVariable,
            salePrice: salePrice,
            regularPrice: regularPrice
        })
    }
    try {
        const savedProduct = await newProduct.save();

        res.status(200).json(savedProduct)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
        if (updatedUser) {
            res.status(200).json(updatedProduct)
        }
    } catch (error) {
        res.status(500).json(err)
    }
})

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json("Product has been deleted")
    } catch (error) {
        res.status(500).json(error)
    }
})
router.get("/find/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;

    try {
        let products;
        if (qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(1);
        } else if (qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory]
                }
            })
        } else {
            products = await Product.find()
        }

        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit

        // const result = products.skip(skip).limit(limit)
        const result = products.slice(skip, skip + limit)

        products = await result
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router