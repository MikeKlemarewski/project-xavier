var http      = require('http');
var express   = require('express');
var fs        = require('fs');
var config    = require('./../../config.json');
var question  = require('./../../models/question.js');
var comment   = require('./../../models/comment.js');
var server    = require('./../../app-rqra.js');
var queries   = require(__dirname + '/../../database/db-queries');
var Direction = { Down: 0, Up: 1 };
var dataFile  = 'tests/engage/testing-data.json';
var testData  = JSON.parse(fs.readFileSync(dataFile));

// question variables
var questionUUID = "pJfznhheQuOicWWAjx7F00";
var commentUUID  = "qJfznhheQuOicWWAjx7F05";
var commentTitle = "Here's my number";
var commentBody  = "call me maybe?";

module.exports = {

	commentTest:{
		setUp: function(callback) {
			var that = this;
			this.requestOptions = {
				host:config.engageServer.host,
				headers: {
					"content-type": "application/json"
				}
			}

			queries.dropDB(config.mysqlDatabase['db-name'], function(){
				queries.createDB(config.mysqlDatabase["db-name"], function(){
				
					queries.insertData(
						dataFile,
						config.mysqlDatabase["db-name"],
						config.mysqlDatabase["user"],
						config.mysqlDatabase["password"],
						config.mysqlDatabase["host"],
						function(){
							that.user     = testData.users[0];
							that.server   = express.createServer();
							that.server.use(function(req, res, next) {
								req.session = {
									user: that.user
								}
								next();
							})
							that.server.use(server);
							that.server.listen(function() {
								that.requestOptions.port = this.address().port;
								callback();
							});
						}
					);
				});
			});
		},
		tearDown: function(callback){
			this.server.close();
			callback();
		},
		
		// create a comment for some user
		createComment: function(test) {
			
			var newComment = {
				target_uuid: questionUUID,
				objectType: 1,
				title: commentTitle,
				body: commentBody
			}
			
			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/comment";


			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.comment);
					test.done();
				});
			});
			request.write(JSON.stringify({ comment: newComment }));
			request.end();
		},
		
		// get the details of a comment
		getComment: function(test) {
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/comment/" + commentUUID;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.comment.body &&
						body.comment.user);
					test.done();
				});
			});
		},
		
		// update a comment
		updateComment: function(test) {
			this.requestOptions.method = "PUT";
			this.requestOptions.path   = "/api/comment/" + commentUUID;

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify({ commentBody: commentBody }));
			request.end();
		},

		
		// delete a comment
		deleteComment: function(test) {
			this.requestOptions.method = "DELETE";
			this.requestOptions.path   = "/api/comment/" + commentUUID;
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.result._id === commentUUID);
					test.done();
				});
			});
			request.end();
		},
	}
}