const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");
// const {Product} = require('../database/models/Product');
// const { all } = require('../routes/productsRoute');

const estilos = {
    productos: '/stylesheets/productos-style.css',

};

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Category, Product, etc} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const products = db.Products;
const categorys = db.Categorys;
const marcas = db.Marcas;
const talles = db.Talles;

// .Promesas



const controller = {
    //---------------------------------GUESTS-------------------------------------
         //todos los productos
         list: (req, res) => {
            let promCategorys = categorys.findAll()
            let promMarcas = marcas.findAll()
            let promProducts =products.findAll({
                include:[{association:"categorys"},{association:"marcas"},{association:"talles"}]
            })
            Promise.all([promProducts, promCategorys, promMarcas])
                .then(([products, allCategorys, allMarcas])=>{
                    
                    res.render('products/products',{ products, allCategorys, allMarcas});
                })
                .catch(error => res.send(error))
        },
        //detalle de un producto
        detail:(req, res) => {
            products.findByPk(req.params.id,{
                include:[{association:"categorys"},{association:"marcas"},{association:"talles"}]
            })
                .then((product)=>{
                    res.render("products/detail", {product})
                })
        },
        //Buscar prodcutos
        search: (req, res) => {    
            let promCategorys = categorys.findAll()
            let promMarcas = marcas.findAll()
            let promProducts =products.findAll({
                where:{ name: { [Op.like]: '%' + req.query.search + '%' }},
                include:[{association:"categorys"},{association:"marcas"},{association:"talles"}]
            })
            Promise.all([promProducts, promCategorys, promMarcas])
            .then(([products, allCategorys, allMarcas])=>{
                res.render('products/products',{ products, allCategorys, allMarcas});
            })
            .catch(error => res.send(error))
            
         
        },
        //---------------------------- Menu----------------------------------
        // menuCategory: (req, res)=>{   
        //     let promCategorys = categorys.findAll()
        //     let promMarcas = marcas.findAll()
        //     let promProducts = products.findAll({
        //         where:{ category_id:{  [Op.eq] : req.body.category} },
        //         include:[{association:"categorys"},{association:"marcas"},{association:"talles"}]
        //     })
        //     Promise.all([promProducts, promCategorys, promMarcas])
        //     .then(([products, allCategorys, allMarcas])=>{
        //         res.render('products/products',{ products, allCategorys, allMarcas});
        //     })
        //     .catch(error => res.send(error))
        // },
 //---------------------------- Filro----------------------------------
        filter: (req, res)=>{   
             //--------orden------------
            let orderPrice = req.body.orderPrice;
            if(orderPrice == 1){ orderPrice = ["price"] } else {orderPrice = ["price", "DESC"]};
            let orderAlfa = req.body.orderAlfa;
            if(orderAlfa == 1){ orderAlfa = ["name"] } else {orderPrice = ["name", "DESC"]}; 
            let orderDate = req.body.orderDate;
            //-----------promesas---------------
            let promCategorys = categorys.findAll()
            let promMarcas = marcas.findAll()
            let promProducts = products.findAll({
                where :{
                    [Op.or]: [
                        {category_id: req.body.category},
                        { marca_id:  req.body.marca}
                    ]
                },
                //where:{  category_id:{  [Op.eq] : req.body.category} },
                //where:{ marca_id:{  [Op.eq] : req.body.marca} },
                // order:[orderPrice],
                // order:[ orderAlfa],
                // order:[orderDate],
                include:[{association:"categorys"},{association:"marcas"},{association:"talles"}]
            })
            Promise.all([promProducts, promCategorys, promMarcas])
            .then(([products, allCategorys, allMarcas])=>{
                res.render('products/products',{ products, allCategorys, allMarcas});
            })
            .catch(error => res.send(error))
        

        },

    //---------------------------------ADMINS / CRUD-----------------------------------------------
//---------------------------- Products----------------------------------
        //crear Prodcuto
        create: (req, res) => {
            let promCategorys = categorys.findAll()
            let promMarcas = marcas.findAll()
            let promTalles = talles.findAll()
            Promise.all([promCategorys, promMarcas, promTalles])
            .then(([allCategorys, allMarcas, allTalles, products])=>{
                res.render('products/product-create', {allCategorys, allMarcas, allTalles, title: 'CrearProducto', estilo: estilos.crearProducto})
            }) .catch(error => res.send(error))
          },

        store:(req, res) => {
            //---Precio Final -----
            let price = req.body.price;
            let discount = req.body.discount;
            let finalPrice = price;
            if(discount != 0){ finalPrice = (price-(price*discount/100))}
            //----- imagen------
            let imagen = req.file.filename;
            // promesas
            products.create({
                name: req.body.name,
                category_id: req.body.category_id,
                price: req.body.price, 
                discount: req.body.discount, 
                finalPrice: finalPrice ,
                description: req.body.description,
                talle_id: req.body.talle_id,
                marca_id: req.body.marca_id,
                stock: req.body.stock,
                image: imagen,
                //create_at: now Date
            })  
            .then((product)=>{
                res.redirect("/");
            })
                },
            //editar productos
            edit: (req, res) => {
                let promProduct = products.findByPk(req.params.id,{include:[{association:"categorys"},{association:"marcas"},{association:"talles"}]})
                let promCategorys = categorys.findAll()
                let promMarcas = marcas.findAll()
                // let promTalles = talles.findAll()
                Promise.all([promProduct,promCategorys, promMarcas])
                .then(([ product, allCategorys, allMarcas])=>{
                    res.render('products/product-edit', { product, allCategorys, allMarcas});
                })
            .catch(error => res.send(error))
            },

            update:(req, res) => {
                //---Precio Final -----
                let price = req.body.price;
                let discount = req.body.discount;
                let finalPrice = price;
                if(discount != 0){ finalPrice = (price-(price*discount/100))}
                // -----Imagen----
                let editProduct =  {
                    name: req.body.name,
                    category_id: req.body.category_id,
                    price: req.body.price, 
                    discount: req.body.discount,
                    description: req.body.description,
                    talle_id: req.body.talle_id,
                    marca_id: req.body.marca_id,
                    stock: req.body.stock,
                    finalPrice: finalPrice
                    // updated_at: req.body.updated_at   
                }
                if (req.file){editProduct.image = req.file.filename}
                  // promesas
                products.update(
                   editProduct
                ,{
                where:{
                    id: req.params.id
                }})  
                .then((product)=>{
                    res.redirect('../../products/detail/'+ req.params.id)
                })
            },
            
            //borrar productos
            delete: (req, res) => {
                products.findByPk(req.params.id)
                .then((product)=>{
                    console.log(product);
                    res.render('products/product-delete',{product});
                })
            .catch(error => res.send(error))
            },
            destroy: (req, res) => {
                products.destroy({
                    where: { id: req.params.id }
                });
                res.redirect('/products');
            },
      //---------------------------- Category----------------------------------
        
    // createCategory: (req, res) => {
    //         categorys.findAll()
    //         .then(allCategorys)=>{
    //             res.render('products/product-category-create', {allCategorys})
    //         }) .catch(error => res.send(error))
    //       },

    //     storeCategory:(req, res) => {

    //         products.create({
    //             nombre: req.body.nombre,
    //            //create_at: now Date
    //         })  
    //         .then((product)=>{
    //             res.redirect("/");
    //         })
    //             },
            
    // //editar categoria
    //         editCategory: (req, res) => {
    //         categorys.findAll()
    //         .then(allCategorys)=>{
    //                 res.render('products/product-category-edit', { allCategorys});
    //             })
    //         .catch(error => res.send(error))
    //         },

    //         updateCategory:(req, res) => {
             
    //             let editCategory =  {
    //                 nombre: req.body.nombre,
    //                // updated_at: req.body.updated_at   
    //             }
    //               // promesas
    //             categorys.update(
    //                editCategory
    //             ,{
    //             where:{
    //                 id: req.params.id
    //             }})  
    //             .then((category)=>{
    //                 res.redirect('../../products/categorys")
    //             })
    //         },
            
    //         //borrar productos
    //         deleteCategory: (req, res) => {
    //             categorys.findByPk(req.params.id)
    //             .then((category)=>{
                    
    //                 res.render('products/product-categorys-delete',{category});
    //             })
    //         .catch(error => res.send(error))
    //         },
    //         destroyCategory: (req, res) => {
    //             categorys.destroy({
    //                 where: { id: req.params.id }
    //             });
    //             res.redirect('/products/categorys');
    //         },
                
    //             //---------------------------- Marcas----------------------------------
                 
    //             createMarca: (req, res) => {
    //         marcass.findAll()
    //         .then(allMarcas)=>{
    //             res.render('products/product-marca-create', {allMarcas})
    //         }) .catch(error => res.send(error))
    //       },

    //     storeMarca:(req, res) => {

    //         marcas.create({
    //             nombre: req.body.nombre,
    //            //create_at: now Date
    //         })  
    //         .then((product)=>{
    //             res.redirect("/");
    //         })
    //             },
            
    // //editar marcas
    //         editMarca: (req, res) => {       
    //         marcas.findAll()
    //         .then(allMarcas)=>{
    //                 res.render('products/product-category-edit', { allMarcas});
    //             })
    //         .catch(error => res.send(error))
    //         },

    //         updateMarca:(req, res) => {
             
    //             let editMarca =  {
    //                 nombre: req.body.nombre,
    //                // updated_at: req.body.updated_at   
    //             }
                
    //               // promesas
    //             marcas.update(
    //                editMarca
    //             ,{
    //             where:{
    //                 id: req.params.id
    //             }})  
    //             .then((marca)=>{
    //                 res.redirect('../../products/marcas")
    //             })
    //         },
            
    //         //borrar marcas
    //         deleteMarca: (req, res) => {
    //             marcas.findByPk(req.params.id)
    //             .then((marca)=>{
                    
    //                 res.render('products/product-marcas-delete',{marca});
    //             })
    //         .catch(error => res.send(error))
    //         },
                
    //         destroyMarca: (req, res) => {
    //           marcas.destroy({
    //                 where: { id: req.params.id }
    //             });
    //             res.redirect('/products/marcas');
    //         },
}


module.exports = controller;
