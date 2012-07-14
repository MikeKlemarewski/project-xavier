var Resource = require(__dirname + "/../../models/resource");
var Star = require(__dirname + "/../../models/star");
var routesPresenter = require("./../rqra/routesPresenter.js");

exports.followQuestion = function(request, response) {
	routesPresenter.followQuestionRoute(2, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesPresenter.unfollowQuestionRoute(2, request, response);
}

exports.createResource = function(request, response){
	if(request.method === 'POST'){
		console.log("POST");

		if(request.session && request.session.user){
			console.log(request.body);
			Resource.createResource(request.session.user.uuid, request.body.resource, function(error, result){
				console.log("RETURNED");
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, resource: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

exports.starredResources = function(request, response){
	if(request.method === 'GET'){
		if(request.session && request.session.user){
			Star.getStarredResources(request.session.user.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, star: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	}
}

//resource uuid = request.body.uuid
exports.starResource = function(request, response){
	if(request.method === 'POST'){
		if(request.session && request.session.user){
			Star.starResource(request.session.user.uuid, request.body.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, star: result }));
				}else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unstarResource = function(request, response){
	if(request.method === 'DELETE'){

		if(request.session && request.session.user){
			Star.unstarResource(request.session.user.uuid, request.body.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, star: result }));
				}else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

