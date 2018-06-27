/*************************************
* Name: config.js                    *
* Version: 1.0.0                     *
* Node Module: HapiJS 16, MYSQL      *
* Date:                              *
* By Yoga Cheung                     *
**************************************/

///////////////////////////////////////////////////////////
/* DEFINE */
///////////////////////////////////////////////////////////
var log = console.log.bind(console);
var Hapi = require('hapi');
var md5 = require('md5');
var Joi = require('joi');
var db = require('mysql.js');
var server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([require('vision'), require('inert'), { register: require('lout') }], function(err) {
});

server.start(function () {
    console.log('Server is running at:', server.info.uri);
});

//------------------------ END --------------------------//