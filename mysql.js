/*************************************
* Name: mysql                        *
* Version: 1.0.0                     *
* Node Module: hapi, mysql, md5, joi *
* Date:                              *
* By Yoga Cheung                     *
**************************************/

///////////////////////////////////////////////////////////
/* DEFINE */
///////////////////////////////////////////////////////////

var mysql = require('mysql');
var log = console.log.bind(console);

var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'name',
  password: 'password',
  database: 'dbname'
});

exports.query = pool.query.bind(pool);

///////////////////////////////////////////////////////////
/* DESIGNER */
///////////////////////////////////////////////////////////

// Get Brand List
exports.getDBrandList = function(gender, callback) {
  var stmt = "SELECT CONCAT(?, sf_category_description.category_id) AS brand_id, sf_category_description.name AS brand_name, sf_category_description.meta_title AS designer, CONCAT('https://img.fiture.net/designer/', sf_category_description.meta_description) AS imgurl, sf_category_description.description FROM sf_category, sf_category_description WHERE sf_category.category_id = sf_category_description.category_id AND sf_category.parent_id = 3 AND status = 1 AND (sf_category_description.meta_keyword = ? OR sf_category_description.meta_keyword = 'U') ORDER BY sort_order DESC;";
  pool.query(stmt, [gender, gender], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product getDProductDetail
exports.getDProductDetail = function(product_id, callback) {
  var stmt = "SELECT sf_product.model AS name, sf_product.price, CONCAT('https://shop.fiture.net/image/',sf_product.image) AS imgurl, sf_product_description.description FROM sf_product,sf_product_description WHERE sf_product.product_id = sf_product_description.product_id AND sf_product.status = 1 AND sf_product.product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product Image
exports.getDProductImage = function(product_id, callback) {
  var stmt = "SELECT product_image_id, CONCAT('https://shop.fiture.net/image/',image) AS imgurl FROM sf_product_image WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product List
exports.getDProductList = function(gender, brand_id, callback) {
  var stmt = "SELECT sf_product.product_id, sf_product.model AS name, sf_product.price, 'USD' AS currency, CONCAT('https://shop.fiture.net/image/',sf_product.image) AS imgurl FROM sf_product, sf_product_to_category WHERE sf_product_to_category.product_id = sf_product.product_id AND sf_product.status = 1 AND sku = ? AND sf_product_to_category.category_id = ?;";
  pool.query(stmt, [gender, brand_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product Option
exports.getDProductOption = function(product_id, callback) {
  var stmt = "SELECT sf_product_option_value.option_value_id, sf_option_value_description.name, sf_product_option_value.quantity FROM sf_product_option_value, sf_option_value_description WHERE sf_product_option_value.option_value_id = sf_option_value_description.option_value_id AND sf_product_option_value.product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Related Product List
exports.getDRelatedProductList = function(data, body_part_1, body_part_2, callback) {
  var stmt = "(SELECT related.product_id AS related_product_id, related.model AS name, related.price, CONCAT('https://shop.fiture.net/image/', related.image) AS imgurl FROM sf_product related WHERE related.product_id IN (SELECT product.product_id FROM sf_product product , sf_product_to_category WHERE sf_product_to_category.product_id = sf_product.product_id AND sf_product_to_category.category_id = ? AND product.sku = ? AND product.ean = ?) ORDER BY RAND() LIMIT 3) UNION ALL(SELECT related.product_id AS related_product_id, related.model AS name, related.price, CONCAT('https://shop.fiture.net/image/', related.image) AS imgurl FROM sf_product related WHERE related.product_id IN (SELECT product.product_id FROM sf_product product , sf_product_to_category WHERE sf_product_to_category.product_id = sf_product.product_id AND sf_product_to_category.category_id = ? AND product.sku = ? AND product.ean = ?) ORDER BY RAND() LIMIT 3);";
  pool.query(stmt, [data.brand_id, data.prefix, body_part_1, data.brand_id, data.prefix, body_part_2], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* CLICK RATE */
///////////////////////////////////////////////////////////

// Designer Product Click Rate
exports.DProductClick = function(product_id, callback) {
  var stmt = "UPDATE sf_product SET viewed = viewed + 1 WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* SIZE SUGGUESTION */
///////////////////////////////////////////////////////////

// Get Designer Product Size
exports.getDProductSize = function(product_id, callback) {
  var stmt = "SELECT upc AS chart_id, ean AS body_part FROM sf_product WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

//------------------------ END --------------------------//