/*************************************
* Name: server.js                    *
* Version: 1.0.0                     *
* Node Module: hapi, mysql, md5, joi *
* Date:                              *
* By Yoga Cheung                     *
**************************************/

///////////////////////////////////////////////////////////
/* ACCOUNT */
///////////////////////////////////////////////////////////

// Guest Account - add guest
server.route({
  method: 'POST',
  path: '/addguest',
  config:{
  	validate:{
  		payload:{
  			gender: Joi.string().regex(/^[M|F]$/)
  		}
  	}
  },
  handler: function (request, reply){
    var data = request.payload;
    db.addGuestAccount(data, function(err, guest_id){
      if(err == null) reply({"guest_id":guest_id});   
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* APN */
///////////////////////////////////////////////////////////

// Push Notification - Save Devices
server.route({
  method: 'POST',
  path: '/adddevice',
  config:{
    validate:{
      payload:{
        token: Joi.string().required(),
        user_id: Joi.number().min(0)
      }
    }
  },
  handler: function (request, reply){
    var data = request.payload;
    db.addUserDevice(data, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

// Push Notification - Send
server.route({
  method: 'GET',
  path: '/apn/{id*2}',
  handler: function (request, reply){
    var id = request.params.id.split('/');
   
  var message;
  
    switch(id[0]){
      case '1':{
        message = "\u2B50 Find More New Brands!";
        break;
      }
      case '2':{
        db.getCode(id[1], function(err, code){
          if(err == null){
            message = "\uD83D\uDCE7 \u2709 Get Your Promo Code " + code[0].code;
          }else reply(err);
        });
        break;
      }
      case '3':{
        message = "Check Out With Discount Now!";
        break;
      }
      case '4':{
        message = "Update Your Size To Get Accurate Sugguestion.";
        break;
      }
    }

    db.getDevice(function(err, token){
      if(err == null) {
        var options = {
        cert: '/srv/www/app.fiture.net/apn/apn-cert.pem', 
        key: '/srv/www/app.fiture.net/apn/apn-key.pem', 
        passphrase:'pass',
        errorCallback: errorHappened
      }; 
  
      function errorHappened(err, notification){
        // console.log("err " + err);
        reply({"msg": err});
      }
        
        for(i in token){
          var token = token[i].token;
          var myDevice = new apn.Device(token);
          var apnConnection = new apn.Connection(options);

          var note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 1;
          note.sound = "ping.aiff";
          note.alert = message;
          note.payload = {'messageFrom': 'Fiture'};
          note.device = myDevice;

          apnConnection.sendNotification(note);
          apnConnection.shutdown();
        }  
        
        reply({"msg":'Success'});                    
      }else reply(err);
    });

  }
});

///////////////////////////////////////////////////////////
/* BODY SIZE */
///////////////////////////////////////////////////////////

// User Body Size - add user size
server.route({
  method: 'POST',
  path: '/addsize',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        height: Joi.number().min(0).max(299),
        weight: Joi.number().min(0).max(299),
        shoulder: Joi.number().min(0).max(99),
        chest: Joi.number().min(0).max(99),
        waist: Joi.number().min(0).max(99),
        hip: Joi.number().min(0).max(99),
        thigh: Joi.number().min(0).max(99),
        calves: Joi.number().min(0).max(99),
        footwear: Joi.number().min(0).max(99)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    
    db.addUserSize(data, function(err, user_size_id){
      if(err == null) reply({"user_size_id":user_size_id});
      else reply(err);
    });
    
  	}
});

// User Body Size - get user size
server.route({
  method: 'GET',
  path: '/size/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getUserSize(user_id, function(err, size){
      if(err == null) reply(size);
      else reply(err);
    });
    
  }
});

// User Body Size - add user wear size
server.route({
  method: 'POST',
  path: '/addwearsize',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        height: Joi.number().min(0).max(299),
        weight: Joi.number().min(0).max(299),
        shoulder: Joi.number().min(0).max(99),
        chest: Joi.number().min(0).max(99),
        waist: Joi.number().min(0).max(99),
        hip: Joi.number().min(0).max(99),
        thigh: Joi.number().min(0).max(99),
        calves: Joi.number().min(0).max(99),
        footwear: Joi.number().min(0).max(99)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    
    db.addWearSize(data, function(err, wear_size_id){
      if(err) reply({"wear_size_id":wear_size_id});
      else reply(err);
    });
    
    }
});

// User Body Size - get user waer size
server.route({
  method: 'GET',
  path: '/wearsize/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getWearSize(user_id, function(err, wearsize){
      if(err == null ) reply(wearsize);
      else reply(err);
    });
    
  }
});

///////////////////////////////////////////////////////////
/* CLICK RATE */
///////////////////////////////////////////////////////////

// Code Click Rate
server.route({
  method: 'GET',
  path: '/codeclick/{code_id}',
  config:{
    validate:{
      params:{
        code_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var code_id = request.params.code_id;
    db.codeClick(code_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

// Designer Brand Click Rate
server.route({
  method: 'GET',
  path: '/dbrandclick/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^[M|F]\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
   	var brand = request.params.brand_id;
    var gender = brand.charAt(0);
    var brand_id = brand.substring(1);
   	db.DBrandClick(gender, brand_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

// Designer Product Click Rate
server.route({
  method: 'GET',
  path: '/dproductclick/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
	  var product_id = request.params.product_id;
   	dbs.DProductClick(product_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

// Style Reference Source Click Rate
server.route({
  method: 'GET',
  path: '/referencesourceclick/{source_id}',
  config:{
    validate:{
      params:{
        source_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
	  var source_id = request.params.source_id;
   	db.referenceSourceClick(source_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

// Style Click Rate
server.route({
  method: 'GET',
  path: '/styleclick/{style_id}',
  config:{
    validate:{
      params:{
        style_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
	  var style_id = request.params.style_id;
   	db.styleClick(style_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

// Style Reference Click Rate
server.route({
  method: 'GET',
  path: '/stylereferenceclick/{reference_id}',
  config:{
    validate:{
      params:{
        reference_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
	  var reference_id = request.params.reference_id;
   	db.styleReferenceClick(reference_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

// Worldwide Click Rate
server.route({
  method: 'GET',
  path: '/worldwideclick/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^[M|F]\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var brand = request.params.brand_id;
    var gender = brand.charAt(0);
    var brand_id = brand.substring(1);
   	db.worldwideClick(gender, brand_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

// Worldwide Product Click Rate
server.route({
  method: 'GET',
  path: '/wwproductclick/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
	  var product_id = request.params.product_id;
   	db.WWProductClick(product_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
   	});
  }
});

///////////////////////////////////////////////////////////
/* DESIGNER */
///////////////////////////////////////////////////////////

// Get Brand List
server.route({
  method: 'GET',
  path: '/dbrandlist/{gender}',
  config:{
    validate:{
      params:{
        gender: Joi.string().regex(/^[M|F]$/)
      }
    }
  },
  handler: function (request, reply) {
  	var gender = request.params.gender;
    dbs.getDBrandList(gender, function(err, brandList){
      if(err) reply(err);
      else reply(brandList);
    });
  }
});

// Get Product Detail
server.route({
  method: 'GET',
  path: '/dproductdetail/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    dbs.getDProductDetail(product_id, function(err, product){
      if(err) reply(err);
      else reply(product);
    });
  }
});

// Get Product Image
server.route({
  method: 'GET',
  path: '/dproductimage/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    dbs.getDProductImage(product_id, function(err, image){
      if(err) reply(err);
      else reply(image);
    });
  }
});

// Get Product List
server.route({
  method: 'GET',
  path: '/dproductlist/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^[M|F]\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
	var brand = request.params.brand_id;
    var gender = brand.charAt(0);
    var brand_id = brand.substring(1);
    dbs.getDProductList(gender, brand_id, function(err, productList){
      if(err) reply(err);
      else reply(productList);
    });
  }
});

// Get Product Option
server.route({
  method: 'GET',
  path: '/dproductoption/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    dbs.getDProductOption(product_id, function(err, productList){
      if(err) reply(err);
      else reply(productList);
    });
  }
});

// Get Related Product List
server.route({
  method: 'GET',
  path: '/drelatedproductlist/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    dbs.getDRelatedProductData(product_id, function(err, data){
      if(err) reply(err);
      if(data[0] != null){
        switch(data[0].body_part){
          case 1:{
            db.getDRelatedProductList(data[0], 2, 3, function(err, RproductList){
              if(err) reply(err);
              else reply(RproductList);
            });
            break;
          }
          case 2:{
            db.getDRelatedProductList(data[0], 1, 3, function(err, RproductList){
              if(err) reply(err);
              else reply(RproductList);
            });
            break;
          }
          case 3:{
            db.getRelatedProductList(data[0], 1, 2, function(err, RproductList){
              if(err) reply(err);
              else reply(RproductList);
            });
            break;
          }
        } 
      }
    });
  }
});

///////////////////////////////////////////////////////////
/* FAVOURITE */
///////////////////////////////////////////////////////////

// Add User Favourite Colour
server.route({
  method: 'POST',
  path: '/addfavcolour',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        white: Joi.number().min(0).max(1),
        black: Joi.number().min(0).max(1),
        red: Joi.number().min(0).max(1),
        orange: Joi.number().min(0).max(1),
        yellow: Joi.number().min(0).max(1),
        green: Joi.number().min(0).max(1),
        aqua_green: Joi.number().min(0).max(1),
        navy: Joi.number().min(0).max(1),
        violet: Joi.number().min(0).max(1),
        pink: Joi.number().min(0).max(1),
        brown: Joi.number().min(0).max(1),
        ash: Joi.number().min(0).max(1),
        grey: Joi.number().min(0).max(1),
        sky_blue: Joi.number().min(0).max(1)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    
    db.addFavColour(data, function(err, fav_colour_id){
      if(err == null) reply({"fav_colour_id":fav_colour_id});
      else reply(err);
    });

  }
});

// Get User Favourite Colour
server.route({
  method: 'GET',
  path: '/getfavcolour/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getFavColour(user_id, function(err, colour){
      if(err == null ) reply(colour);
      else reply(err);
    });

  }
});

// Add User Favourite Reference
server.route({
  method: 'POST',
  path: '/addfavreference',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        reference_id: Joi.number().min(1).required()
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    
    db.addFavReference(data, function(err, fav_reference_id){
      if(err == null) reply({"fav_reference_id":fav_reference_id});
      else reply(err);
    });

  }
});

// Delete User Favourite Reference
server.route({
  method: 'POST',
  path: '/delfavreference',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        reference_id: Joi.number().min(1).required()
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    
    db.delFavReference(data, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
    
  }
});

// Delete All User Favourite Reference
server.route({
  method: 'POST',
  path: '/delallfavreference/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.delAllFavReference(user_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
    
  }
});

// Get User Favourite Gallery
server.route({
  method: 'GET',
  path: '/favgallery/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getFavGallery(user_id, function(err, favgallery){
      if(err == null) reply(favgallery);
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* SIZE SUGGUESTION */
///////////////////////////////////////////////////////////

// Get Designer Product Size Sugguestion - Body Size
server.route({
  method: 'GET',
  path: '/dsizesugg/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
	
	dbs.getDProductSize(id[0], function(err, productChart){
    if(err != null) reply(err);
		else if(productChart[0] != null){
			db.getDProductSize(productChart[0], function(err, productSizes){
				if(err != null) reply(err);
				if(productSizes[0] != null){
					db.getUserSize(id[1], function(err, userSize){
				        if(err != null) reply(err);
				        else if(userSize[0] != null){
				          var result;

				            switch(productChart[0].body_part){
				              case 1:
				              {
				                var sugSize = [];
				                for(i in productSizes){
				                  if(productSizes[i].body_category_id==3 && productSizes[i].min <= userSize[0].shoulder && userSize[0].shoulder <= productSizes[i].max) sugSize[0] = productSizes[i].size_id;
				                  else if(productSizes[i].body_category_id==4 && productSizes[i].min <= userSize[0].chest && userSize[0].chest <= productSizes[i].max) sugSize[1] = productSizes[i].size_id;
				                       else if(productSizes[i].body_category_id==5 && productSizes[i].min <= userSize[0].waist && userSize[0].waist <= productSizes[i].max) sugSize[2] = productSizes[i].size_id;
				                }

				                if(sugSize.length>1 && sugSize[1]>sugSize[0] && (sugSize[1]-sugSize[0]<2 || sugSize[0]-sugSize[1]<2)) result = sugSize[1];
                        else if(sugSize.length>1 && (sugSize[1]-sugSize[0]>2 || sugSize[0]-sugSize[1]>2)) reply({"name":"-"});
                           else result = sugSize[0];
                        break;
				              }
				              case 2:
				              {
				                for(i in productSizes){
				                  if(productSizes[i].body_category_id==6 && productSizes[i].min <= userSize[0].hip && userSize[0].hip <= productSizes[i].max){
				                    result = productSizes[i].size_id; break;
				                  } 
				                  // else if(productSizes[i].body_category_id==7 && productSizes[i].min <= userSize[0].thigh && userSize[0].thigh <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
				                        // else if(productSizes[i].body_category_id==8 && productSizes[i].min <= userSize[0].calves && userSize[0].calves <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
				                }
				                break;
				              }
				              case 3:
				              {
				                for(i in productSizes){
				                  if(productSizes[i].body_category_id==9 && productSizes[i].min <= userSize[0].footwear && userSize[0].footwear <= productSizes[i].max){
				                    result = productSizes[i].size_id; break;
				                  } 
				                }
				              }
				            }
				          
				          if(result){
				            db.getSugSize(result, function(err, sugResult){
				              if(err == null) reply(sugResult[0]);
                      else reply(err);
				            }); 
				          }else reply({"name":"-"});
				                    
				          
				        }else reply({"name":"?"});
			        });
				}else reply({"name":"/"});
			});
		}else reply({"name":"/"});
		
  	});
  }  
});

// Get Designer Product Size Sugguestion - Wear Size
server.route({
  method: 'GET',
  path: '/dwearsizesugg/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
	
	dbs.getDProductSize(id[0], function(err, productChart){
		if(err != null) reply(err);
		if(productChart[0] != null){
			db.getDProductSize(productChart[0], function(err, productSizes){
				if(err !== null) reply(err);
				if(productSizes[0] != null){
					db.getWearSize(id[1], function(err, userSize){
				        if(err !== null) reply(err);
				        if(userSize[0] != null){
				          var result;

				            switch(productChart[0].body_part){
				              case 1:
				              {
				                var sugSize = [];
				                for(i in productSizes){
				                  if(productSizes[i].body_category_id==3 && productSizes[i].min <= userSize[0].shoulder && userSize[0].shoulder <= productSizes[i].max) sugSize[0] = productSizes[i].size_id;
				                  else if(productSizes[i].body_category_id==4 && productSizes[i].min <= userSize[0].chest && userSize[0].chest <= productSizes[i].max) sugSize[1] = productSizes[i].size_id;
				                       else if(productSizes[i].body_category_id==5 && productSizes[i].min <= userSize[0].waist && userSize[0].waist <= productSizes[i].max) sugSize[2] = productSizes[i].size_id;
				                }

				                if(sugSize.length>1 && sugSize[1]>sugSize[0] && (sugSize[1]-sugSize[0]<2 || sugSize[0]-sugSize[1]<2)) result = sugSize[1];
                  else if(sugSize.length>1 && (sugSize[1]-sugSize[0]>2 || sugSize[0]-sugSize[1]>2)) reply({"name":"-"});
                     else result = sugSize[0];
                  break;
				              }
				              case 2:
				              {
				                for(i in productSizes){
				                  if(productSizes[i].body_category_id==6 && productSizes[i].min <= userSize[0].hip && userSize[0].hip <= productSizes[i].max){
				                    result = productSizes[i].size_id; break;
				                  } 
				                  // else if(productSizes[i].body_category_id==7 && productSizes[i].min <= userSize[0].thigh && userSize[0].thigh <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
				                        // else if(productSizes[i].body_category_id==8 && productSizes[i].min <= userSize[0].calves && userSize[0].calves <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
				                }
				                break;
				              }
				              case 3:
				              {
				                for(i in productSizes){
				                  if(productSizes[i].body_category_id==9 && productSizes[i].min <= userSize[0].footwear && userSize[0].footwear <= productSizes[i].max){
				                    result = productSizes[i].size_id; break;
				                  } 
				                }
				              }
				            }
				          
				          if(result){
				            db.getSugSize(result, function(err, sugResult){
				              if(err == null) reply(sugResult[0]);
                      else reply(err);
				            }); 
				          }else reply({"name":"-"});
				                    
				          
				        }else reply({"name":"?"});
			        });
				}else reply({"name":"/"});
			});
		}else reply({"name":"/"});
		
  	});
  }  
});

// Get Worldwide Product Size Sugguestion - Body Size
server.route({
  method: 'GET',
  path: '/wwsizesugg/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
  
    db.getWWProductSize(id[0], function(err, productSizes){
      if(err != null) reply(err);
      else if(productSizes[0] != null){
        db.getUserSize(id[1], function(err, userSize){
          if(err != null) reply(err);
          else if(userSize[0] != null){
            var result;

              switch(productSizes[0].body_part){
                case 1:
                {
                  var sugSize = [];
                  for(i in productSizes){
                    if(productSizes[i].body_category_id==3 && productSizes[i].min <= userSize[0].shoulder && userSize[0].shoulder <= productSizes[i].max) sugSize[0] = productSizes[i].size_id;
                    else if(productSizes[i].body_category_id==4 && productSizes[i].min <= userSize[0].chest && userSize[0].chest <= productSizes[i].max) sugSize[1] = productSizes[i].size_id;
                         else if(productSizes[i].body_category_id==5 && productSizes[i].min <= userSize[0].waist && userSize[0].waist <= productSizes[i].max) sugSize[2] = productSizes[i].size_id;
                  }

                  if(sugSize.length>1 && sugSize[1]>sugSize[0] && sugSize[1]-sugSize[0]<2) result = sugSize[1];
                  else if(sugSize.length>1 && sugSize[0]-sugSize[1]>2) reply({"name":"-"});
                  	 else result = sugSize[0];
                  break;
                }
                case 2:
                {
                  for(i in productSizes){
                    if(productSizes[i].body_category_id==5 && productSizes[i].min <= userSize[0].waist && userSize[0].waist <= productSizes[i].max){
                      result = productSizes[i].size_id; break;
                    } 
                    // else if(productSizes[i].body_category_id==7 && productSizes[i].min <= userSize[0].thigh && userSize[0].thigh <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
                          // else if(productSizes[i].body_category_id==8 && productSizes[i].min <= userSize[0].calves && userSize[0].calves <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
                  }
                  break;
                }
                case 3:
                {
                  for(i in productSizes){
                    if(productSizes[i].body_category_id==9 && productSizes[i].min <= userSize[0].footwear && userSize[0].footwear <= productSizes[i].max){
                      result = productSizes[i].size_id; break;
                    } 
                  }
                }
              }
            
            if(result){
              db.getSugSize(result, function(err, sugResult){
                if(err == null) reply(sugResult[0]);
                else reply(err);
              }); 
            }else reply({"name":"-"});
                      
          }else reply({"name":"?"});
            
          });
      }else reply({"name":"/"});
    });
  }  
});

// Get Worldwide Product Size Sugguestion - Wear Size
server.route({
  method: 'GET',
  path: '/wwwearsizesugg/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
  
  db.getWWProductSize(id[0], function(err, productSizes){
		if(err) throw err;
    if(productSizes[0] != null){
      db.getWearSize(id[1], function(err, userSize){
        if(err) reply(err);
        if(userSize){
          var result;

            switch(productSizes[0].body_part){
              case 1:
              {
                var sugSize = [];
                for(i in productSizes){
                  if(productSizes[i].body_category_id==3 && productSizes[i].min <= userSize[0].shoulder && userSize[0].shoulder <= productSizes[i].max) sugSize[0] = productSizes[i].size_id;
                  else if(productSizes[i].body_category_id==4 && productSizes[i].min <= userSize[0].chest && userSize[0].chest <= productSizes[i].max) sugSize[1] = productSizes[i].size_id;
                       else if(productSizes[i].body_category_id==5 && productSizes[i].min <= userSize[0].waist && userSize[0].waist <= productSizes[i].max) sugSize[2] = productSizes[i].size_id;
                }

                if(sugSize.length>1 && sugSize[1]>sugSize[0] && (sugSize[1]-sugSize[0]<2 || sugSize[0]-sugSize[1]<2)) result = sugSize[1];
                  else if(sugSize.length>1 && (sugSize[1]-sugSize[0]>2 || sugSize[0]-sugSize[1]>2)) reply({"name":"-"});
                     else result = sugSize[0];
                  break;
              }
              case 2:
              {
                for(i in productSizes){
                  if(productSizes[i].body_category_id==6 && productSizes[i].min <= userSize[0].hip && userSize[0].hip <= productSizes[i].max){
                    result = productSizes[i].size_id; break;
                  } 
                  // else if(productSizes[i].body_category_id==7 && productSizes[i].min <= userSize[0].thigh && userSize[0].thigh <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
                        // else if(productSizes[i].body_category_id==8 && productSizes[i].min <= userSize[0].calves && userSize[0].calves <= productSizes[i].max) sugSize.push(productSizes[i].size_id);
                }
                break;
              }
              case 3:
              {
                for(i in productSizes){
                  if(productSizes[i].body_category_id==9 && productSizes[i].min <= userSize[0].footwear && userSize[0].footwear <= productSizes[i].max){
                    result = productSizes[i].size_id; break;
                  } 
                }
              }
            }
          
          if(result){
            db.getSugSize(result, function(err, sugResult){
              if(err == null) reply(sugResult[0]);
              else reply(err);
            }); 
          }else reply({"name":"-"});
                    
          
        }else reply({"name":"?"});
      });
    }else reply({"name":"/"});
		
  });
  }  
});

///////////////////////////////////////////////////////////
/* STYLE */
///////////////////////////////////////////////////////////

// Get Style List
server.route({
  method: 'GET',
  path: '/stylelist/{gender}',
  config:{
    validate:{
      params:{
        gender: Joi.string().regex(/^[M|F|m|f]$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var gender = request.params.gender;
   	db.getStyleList(gender, function(err, styleList){
	   	if(err == null) reply(styleList);
	   	else reply(err);
   	});
  }
});

// Get Style Gallery
server.route({
  method: 'GET',
  path: '/gallery/{style_id}',
  config:{
    validate:{
      params:{
        style_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
  	var style_id = request.params.style_id;
   	db.getGallery(style_id, function(err, gallery){
   		if(err == null) reply(gallery);
      else reply(err);
   	});
  }
});

// Get Style Reference Detail
server.route({
  method: 'GET',
  path: '/referencedetail/{reference_id}',
  config:{
    validate:{
      params:{
        reference_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var reference_id = request.params.reference_id;
    db.getReferenceDetail(reference_id, function(err, referenceDetail){
      if(err == null) reply(referenceDetail);
      else reply(err);
    });
  }
});

// Get Style Reference Related Product List
server.route({
  method: 'GET',
  path: '/stylerelatedproductlist/{reference_id}',
  config:{
    validate:{
      params:{
        reference_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var reference_id = request.params.reference_id;
    db.getStyleRelatedProductList(reference_id, function(err, productList){
      if(err == null) reply(productList);
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* USER ACTIVITIES */
///////////////////////////////////////////////////////////
server.route({
  method: 'POST',
  path: '/activity',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        product_id: Joi.number().min(1).required()
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
     
    db.addActivities(data, function(err, activity_id){
     if(err == null) reply(activity_id);
     else reply(err);
    });
 
  }
});

///////////////////////////////////////////////////////////
/* Testing User Option */
///////////////////////////////////////////////////////////

// Testing - cart click
server.route({
  method: 'GET',
  path: '/cartclick/{id*2}',
  handler: function (request, reply) {
    var id = request.params.id.split('/');
    db.cartClick(id[0], id[1], function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* WORLDWIDE */
///////////////////////////////////////////////////////////

// Get Brand List
server.route({
  method: 'GET',
  path: '/wwbrandlist/{gender}',
  config:{
  	validate:{
  		params:{
  			gender: Joi.string().regex(/^[M|F|m|f]$/)
  		}
  	}
  },
  handler: function (request, reply) {
  	var gender = request.params.gender;
    db.getWWBrandList(gender, function(err, brandList){
      if(err == null) reply(brandList);
      else reply(err);
    });
  }
});

// Get Product Detail
server.route({
  method: 'GET',
  path: '/wwproductdetail/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.getWWProductDetail(product_id, function(err, product){
      if(err == null) reply(product);
      else reply(err);
    });
  }
});

// Get Product List
server.route({
  method: 'GET',
  path: '/wwproductlist/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^[M|F|]\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var brand = request.params.brand_id;
    var gender = brand.charAt(0);
    var brand_id = brand.substring(1);
    db.getWWProductList(gender, brand_id, function(err, productList){
      if(err == null) reply(productList);
      else reply(err);
    });
  }
});

// Get Related Product List
server.route({
  method: 'GET',
  path: '/wwrelatedproductlist/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.getWWRelatedProductData(product_id, function(err, data){
      if(err) reply(err);
      if(data[0] != null){
        switch(data[0].body_part){
          case 1:{
            db.getWWRelatedProductList(data[0], 2, 3, function(err, RproductList){
              if(err == null) reply(RproductList);
              else reply(err);
            });
            break;
          }
          case 2:{
            db.getWWRelatedProductList(data[0], 1, 3, function(err, RproductList){
              if(err == null) reply(RproductList);
              else reply(err);
            });
            break;
          }
          case 3:{
            db.getWWRelatedProductList(data[0], 1, 2, function(err, RproductList){
              if(err == null) reply(RproductList);
              else reply(err);
            });
            break;
          }
        } 
      }
    });
  }
});

// Delete Expired Product
server.route({
  method: 'GET',
  path: '/wwproductexpired/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.WWProductExpired(product_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

//------------------------ END --------------------------//