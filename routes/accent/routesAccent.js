var routesCommon = require('./../common/routesCommon.js');
var AccentAction = require("./../../controller/AccentAction.js");
var MediaAction  = require("./../../controller/MediaAction.js");
var TagAction    = require("./../../controller/TagAction.js");
var MediaFile    = require(__dirname + "/../../models/mediafile.js");
var User         = require(__dirname + "/../../models/user");
var Tag          = require(__dirname + "/../../models/tag");
var queryES      = require(__dirname + '/../../controller/queryES.js');

exports.login = function(request, response){
	routesCommon.login(1, request, response);
}

exports.question = function(request, response) {
	routesCommon.questionRoute(1, request, response);
}

exports.questions = function(request, response) {
	routesCommon.questionsRoute(1, request, response);
}

exports.questionsByUser = function(request, response) {	
	routesCommon.questionsByUserRoute(1, request, response);
}

exports.followQuestion = function(request, response) {
	routesCommon.followQuestionRoute(1, request, response);
}

exports.questionStatus = function(request, response) {
	routesCommon.questionStatusRoute(1, request, response);
}



exports.comment = function(request, response) {
	routesCommon.commentRoute(1, request, response);
}

exports.comments = function(request, response) {
	routesCommon.commentsRoute(1, request, response);
}

exports.commentsByUser = function(request, response) {
	routesCommon.commentsByUserRoute(1, request, response);
}

exports.commentVote = function(request, response) {
	routesCommon.commentVoteRoute(1, request, response);
}

exports.commentAnswered = function(request, response) {
	routesCommon.commentAnsweredRoute(1, request, response);
}

exports.commentsByQuestion = function(request, response) {
	routesCommon.commentsByQuestionRoute(1, request, response);
}

exports.search = function(request, response) {
	routesCommon.searchRoute(1, request, response);
}

exports.followQuestion = function(request, response) {
	routesCommon.followQuestionRoute(1, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesCommon.unfollowQuestionRoute(1, request, response);
}

exports.resourcesInSection = function(request, response){
	routesCommon.resourcesInSection(1, request, response);
}

exports.getConversationsByMedia = function(request, response){
	if(request.method === "GET"){
		if(request.session && request.session.user){
			AccentAction.getConversationByMedia(request.session.user.uuid, request.params.id, function(error, media, user){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, mediaQuestions: media, userQuestions: user  }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			})
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
}

// Tag
exports.tag = function(request,response){

	if(request.method === 'POST'){

		if(request.session && request.session.user){
			request.body.user =  request.session.user.uuid;

			TagAction.addTag(request.body, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tag: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
	else if (request.method === 'GET'){
		var uuid = request.params.id;
		TagAction.getTagById({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tag: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
	else if (request.method === 'PUT'){		
		var uuid = request.params.id;
		TagAction.updateTag(uuid, request.body, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tag: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	
	}
	else if (request.method === 'DELETE'){
		var uuid = request.params.id;
		TagAction.deleteTag({'uuid':uuid},function(error,result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tag: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}


}

exports.lastWatched = function(request, response){
	if(request.session && request.session.user){
		if(request.method === "GET"){
			Tag.getLastWatched(request.session.user.uuid, function(error, tag){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tag: tag }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, error: error }));
				}
			});
		}
		else if(request.method === "PUT"){
			Tag.updateLastWatched(request.session.user.uuid, request.body, function(error, tag){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tag: tag }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, error: error }));
				}
			})
		}
	}
	else{
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
	}

}

// MediaFile
exports.mediafile = function(request,response){

	if(request.method === 'POST'){
		if(request.session && request.session.user){
			request.body.user =  request.session.user.uuid;
			MediaAction.addMediaFile(request.body.media, function(error, mediaFile){
				if(!error){
					var args = {
						section: request.body.section,
						material: mediaFile.uuid
					}
					require('../../controller/OrganizationAction.js').addResourceToSection(args, function(err, orgResult){
						if(!err){
							response.writeHead(200, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ errorcode: 0, mediafile: mediaFile }));
						}
						else{
							response.writeHead(200, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ errorcode: 1, message: err }));
						}
					});
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
	else if (request.method === 'GET'){	
		var uuid = request.params.id;
		MediaAction.getMediaFileById({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, mediafile: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
	else if (request.method === 'PUT'){		
		var uuid = request.params.id;
		MediaAction.updateMediaFile({'uuid':uuid}, request.body, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, mediafile: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	
	}
	else if (request.method === 'DELETE'){
		var uuid = request.params.id;
		MediaAction.deleteMediaFile({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, mediafile: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});

	}


}

exports.mediafileTag = function(request,response){	
	if (request.method === 'GET'){
		var targetID = request.params.tid;								
		MediaFile.getMediaFileTags(targetID, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tags: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
}

exports.userTagsByMedia = function(request, response){
	if(request.method === "GET"){
		if(request.session && request.session.user){
			MediaFile.getUserTagsByMedia(request.session.user.uuid, request.params.id, function(error, result){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tags: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			})
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
}

exports.getQuestionsByMedia = function(request, response){
	if(request.method === "GET"){
		TagAction.getQuestionsByMedia(request.params.id, function(error, result){
			if(!error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});
	}
}

exports.courseMediaFiles = function(request, response){
	if(request.method === "GET"){
		var courseID = request.params.id;
		MediaAction.getMediaByCourse(courseID, function(error, result){
			if(!error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, media: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}
}

exports.index = function(req, res){
	if (req.session && req.session.user) {
		console.log(JSON.stringify(req.session.user))	
		res.render("accent/index", { 	title: "SFU Accent",
			user :  req.session.user,
			courses : req.session.courses,
			status : "logged in" }, 
			function(err, rendered){			
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(rendered);

		})
		
	}
	else {
		res.redirect("/demo");		
	}	
};

exports.demoPage = function (req,res){
	var temp_user = {uuid:"jhc20",firstName:"Jihoon",lastName:"Choi",userID:"jhc20",email:"jhc20@sfu.ca"}

	req.session.user= temp_user;
	User.getUserCourses(req.session.user.uuid,function(err,result){
		req.session.courses = result;
		res.redirect('/');

	});
}

/***NEW ROUTES */
exports.searchQuestionsRoute = function(request, response){
	routesCommon.searchQuestionsRoute(1, request, response);
}