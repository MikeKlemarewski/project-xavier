var es = require('com.izaakschroeder.elasticsearch'),
	db = es.connect('localhost'),
	indice = ['presenter', 'accent', 'engage'],
	mappings = ['questions', 'comments'],
	index = db.index('presenter'),
	mapping = index.mapping('questions'),
	UUID = require('com.izaakschroeder.uuid'),
	NotificationAction = require('./NotificationAction.js'),
	async = require('async'),
	user = require('../models/user.js'),
	userProfile = require('../models/userProfile.js'),
	sizeOfResult = 7;

var QueryES = function() {
}

// change the index to whatever you want
var switchIndex = function(appType) {
	var indexType = indice[appType];
	index = db.index(indexType);
	return indexType;
}

// change the mapping to whatever you want
var switchMapping = function(appType) {
	var mappingType = mappings[appType];
	mapping = index.mapping(mappingType);
	return mappingType;
}

//page converter
var paging = function(pageNum){
	var pageBeg = pageNum * sizeOfResult;
	return pageBeg;
}

//add many user objects to result
//data: ES query data
var addUsersToData = function(data, callback){
	var results = {};
	results.total = data.hits.total;
	results.hits = [];

	async.forEachSeries(data.hits.hits, function(item, done){
		addUserToData(item, function(err, result){
			if(err)
				return callback(err)

			results.hits.push(result);
			done();
		})
	}, function(err){
		callback(err, results);
	});
}

//add a single user object to result
//data: ES query data
var addUserToData = function(data, callback){
	user.selectUser({"uuid":data._source.user}, function(error, user){
		if(error)
			return callback(error);

		if(user){
			data.user = user;
		}

		userProfile.getUserProfile(data._source.user, function(err, profile){
			if(err)
				return callback(err)


			if(profile)
				data.profile = profile.profilePicture;

			callback(null, data);
		})
	});
}

QueryES.prototype.getAllQuestionsByUuids = function(questionUuids, appType, callback){
	var self = this;
	var questions = [];

	async.forEach(questionUuids, function(questionUuid, callback){
		self.getQuestion(questionUuid, appType, function(err, data){
			if(data){
				questions.push(data);
			}
			callback();
		})
	}, function(err){
		if(err)
			return callback(err);

		callback(null, questions);
	})
}

QueryES.prototype.questionViewCount = function(questionID, appType, callback){
	var data;
	var link = '/' + switchIndex(appType) + '/questions/' + questionID +'/_update';

	data = {
		'script':'ctx._source.viewCount += viewCount',
		'params':{
			'viewCount':1
		}
	}

	//increment the vote found at commentID
	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//TODO:deprecated
QueryES.prototype.getInstructorQuestion = function(appType, pageNum, callback){
	var data = {
			"query": {
				"term": {
					"isInstructor": true
				}
			},
			"sort": [
				{
					"timestamp": {
						"order": "desc"
					}
				}
			],
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//get a question
QueryES.prototype.getQuestion = function(questionID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID;
	
	db.get(link, {}, function(err, req, data){
		if(err)
			return callback(err);

		addUserToData(data, callback);
	});
}

//get all question
QueryES.prototype.getAllQuestions = function(appType, pageNum, callback){
	var data = {
		query: {
			match_all:{}
		}
	};

	if(pageNum !== '-'){
		data.from = paging(pageNum)
		data.size = sizeOfResult
	}

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if (err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

QueryES.prototype.getAllQuestionByUserID = function(userID, pageNum, appType, callback){
	var data = {
		query: {
			term:{
				user: userID
			}
		}
	};

	if(pageNum !== '-'){
		data.from = paging(pageNum)
		data.size = sizeOfResult
	}

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//TODO:deprecated
QueryES.prototype.getAllUnansweredQuestions = function(appType, pageNum, callback){
	var data = {
		query: {
			term:{
				status:"unanswered"
			}
		},
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			callback(err);

		addUsersToData(data, callback);
	});
}

//TODO:deprecated
QueryES.prototype.getAllNewQuestions = function(appType, pageNum, callback){
	var data = {
		"query": {
			"match_all": {}
		},
		"sort": [
			{
				"created": {
					"order": "desc"
				}
			}
		],
		from: paging(pageNum),
		size: sizeOfResult
	};


	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});

}

QueryES.prototype.getAllRecentlyAnsweredQuestions = function(appType, pageNum, callback){
	var data = {
		"query": {
			"term": {
				"status": "answered"
			}
		},
		"sort": [
			{
				"timestamp": {
					"order": "desc"
				}
			}
		],
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//search based on query
QueryES.prototype.searchAll = function(search, pageNum, appType, callback){

	if(!search){
		callback(undefined);
		return;
	}

	var data = {
		query: {
			flt:{
				"fields":["title", "body"]
				, "like_text":search
			}
		},
		sort:[{"title.untouched":{"order":"asc"}}],
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(0);

	index.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//Add a new question
QueryES.prototype.addQuestion = function(data, appType, callback){
	var document;
	var questionUuid = UUID.generate();
	var args = {};	//used for organizationAction

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(questionUuid);
	data.timestamp = new Date().toISOString();
	data.created = data.timestamp;

	args.section = data.week;	//section uuid
	args.material = questionUuid;	//question uuid

	document.set(data, function(err, req, esResult){
		if(err)
			return callback(err);

		require('./OrganizationAction.js').addResourceToSection(args, function(err){
			if(err)
				return callback(err);

			NotificationAction.createNewQuestion({app:appType, user:data.user, target:questionUuid}, function(err){
				if(err)
					return callback(err);

				callback(null, esResult);
			});
		});
	})
}

//Add a new follower
QueryES.prototype.addFollower = function(questionID, followerID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var data = {
		'script':'ctx._source.followup.contains(followup) ? ctx.op = \"none\"; : ctx._source.followup += followup;',
		'params':{
			'followup':followerID
		}
	}

	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//Remove a new follower
QueryES.prototype.removeFollower = function(questionID, followerID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var data = {
		'script':'ctx._source.followup.contains(followup) ? ctx._source.followup.remove(followup) : ctx.op = \"none\";',
		'params':{
			'followup':followerID
		}
	}

	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//Get questionID by follower
QueryES.prototype.getQuestionByFollowerID = function(followerID, appType, callback){
	var data= {
		"query": {
			"term": {"followup": "newGuy"}
		}
	}

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//update question title and body
QueryES.prototype.updateQuestion = function(questionID, questionTitle, questionBody, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';
	var date = new Date().toISOString();

	var data = {
		'script':'ctx._source.title = title; ctx._source.body = body; ctx._source.timestamp = date;',
		'params':{
			'title':questionTitle,
			'body':questionBody,
			'date':date
		}
	}

	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//delete a uid
QueryES.prototype.deleteQuestion = function(questionID, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(questionID);
	document.delete(function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	});
}


//change the status of a question from unanswered to answered, increments comment count
QueryES.prototype.updateQuestionStatus = function(questionID, isInstructor, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';
	var date = new Date().toISOString();
	var data = {
		'script':'ctx._source.status = status; ctx._source.timestamp = date;ctx._source.commentCount += count;',
		'params':{
			'status':'answered',
			'date':date,
			'count':1,
			'isInstructor': "true"
		}
	}

	//instructor has commented on a question
	if(isInstructor === 1){
		data.script += "ctx._source.isInstructor = isInstructor"
		data.params.isInstructor = "true"
	}

	//add new comment to the document found at uid
	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// Comments
//////////////////////////////////////////////////////////////////////////////////////////////////

//get a comment data based on commentID
QueryES.prototype.getComment = function(commentID, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID;

	db.get(link, {}, function(err, req, data){
		if(err)
			return callback(err);

		addUserToData(data, callback);
	});
}

//get a comment data based on target_uuid
// note: means, get all comments associated with a question
QueryES.prototype.getCommentByTarget_uuid = function(ptarget_uuid, pageNum, appType, callback){
	var data = {
		  query: {
			  term: {
				  target_uuid: ptarget_uuid
			  }
		  },
		"sort": [
			{"upvote": {"order": "desc"}},
			{"downvote": {"order": "desc"}}
		]
	};

	if(pageNum === '-'){
		data.from = 0
		data.size = 1000
	}

	switchIndex(appType);
	switchMapping(1);

	//console.log(JSON.stringify(data))
	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//mark's evil code here
QueryES.prototype.getCommentByResourceUUID = function(target_uuid,callback){
	var data = {
		query: {
			term: {
				target_uuid: target_uuid
			}
		},
		"sort": [
			{"created": {"order": "asc"}}
		]
	};
	data.from = 0
	data.size = 1000

	switchIndex(2);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//get all comments
QueryES.prototype.getAllComments = function(appType, pageNum, callback){
	var data = {
		query: {
			match_all:{}
		},
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

QueryES.prototype.getCommentCount = function(appType, questionUuid, callback){
	var data = {
		query: {
			term: {
				target_uuid: questionUuid
			}
		}
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		callback(null, parseInt(data.hits.total));
	});
}

//get all comment data based on userID for now
QueryES.prototype.getAllCommentByUserID = function(userID, pageNum, appType, callback){
	var data = {
		query: {
			bool:{
				must:[{
					term:{
						user: userID
					}
				}]
			}
		},
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//create a new comment
QueryES.prototype.addComment = function(data, user, appType, callback){
	var commentUuid = UUID.generate();
	var document = mapping.document(commentUuid);

	var args = {
		target:data.target_uuid
		,app:appType
		,origin:data.user
		,description:data.body,
		commentParent: data.commentParent
	};

	switchIndex(appType);
	switchMapping(1);

	data.timestamp = new Date().toISOString();
	data.created = data.timestamp;

	this.updateQuestionStatus(args.target, user.type, appType, function(err){
		if(err && appType !== 2)  //engage doesn't need update status, so who cares about err....mark
			return callback(err);

		document.set(data, function(err, req, esData){
			if(err)
				return callback(err);

			if(appType === 2){
				//engage will return result right way, notification will be created in the background, not blokcing the user.
				callback(null, esData);

			}

			NotificationAction.addCommentUserNotification(args, function(err){
				if(err){
					if (appType !== 2){
						return callback(err);
					}
				}


				args.user =  args.origin;

				NotificationAction.addCommentNotifier(args, function(err){

					if(err){
						if (appType !== 2){
							return callback(err);
						}
					}

					esData._source = data;
					if (appType !== 2){
						callback(null, esData);
					}
				});
			});
		});
	});
}

//update comment body based on commentID
QueryES.prototype.updateComment = function(commentID, commentBody, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';
	var date = new Date().toISOString();

	var data = {
		'script':'ctx._source.body = body; ctx._source.timestamp = date',
		'params':{
			'body':commentBody,
			'date':date
		}
	}

	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//delete a comment
QueryES.prototype.deleteComment = function(commentID, appType, callback){
	var document;
	var args;
	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentID);
	this.getComment(commentID, 0, function(err, result){
		if(err)
			return callback(err);

		document.delete(function(err, req, data){
			if(err)
				return callback(err);

			args = {user:result._source.user, target: result._source.target_uuid, app: appType};

			NotificationAction.removeCommentNotifier( args, function(err, result){
				if(err)
					return callback(err)

				callback(null, data);
			});
		});
	});
}

QueryES.prototype.deleteComments = function(commentList, appType, callback){
	var self = this;
	var successList = [];
	console.log(commentList)
	async.forEach(commentList, function(commentId, done){
		self.deleteComment(commentId, appType, function(err, result){
			if(err)
				console.log('Cannot delete: %s, comment does not exist!', commentId)

			if(result)
				successList.push(result)
			done();
		})
	}, function(err){
		callback(null, successList)
	})
}

//update a comment vote
QueryES.prototype.updateVote = function(commentID, direction, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';
	var data = {};

	if (parseInt(direction) === 0) {
		data = {
			'script':'ctx._source.upvote += upvote',
			'params':{
				'upvote':1
			}
		}
	}else {
		data = {
			'script':'ctx._source.downvote += downvote',
			'params':{
				'downvote':1
			}
		}
	}

	//increment the vote found at commentID
	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//TODO:deprecated
//update a comment isAnswered
QueryES.prototype.updateIsAnswered = function(commentID, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';
	var data = {
		'script':'ctx._source.isInstructor = status',
		'params':{
			'status':'true'
		}
	}

	//set isAnswered to true for the comment found at commentID
	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//JSON searchObj:	{searchType, user, course, week}
//searchObj types: 	{ lastest, replied, instructor, viewed, unanswered, myQuestions, notMyQuestions}
//EXAMPLE:
/*
 {
 "searchQuery" : "",
 "searchType":"viewed",
 "course":"cmpt300",
 "week": "1",
 }
 */
QueryES.prototype.searchQuestionsRoute = function(appType, pageNum, searchObj, callback){
	/// course, week, , searchQuery, searchType
	var data = {
		query: {
			bool:{
				must:[]
			}
		},		
		from: paging(pageNum),
		size: sizeOfResult
	};

	if(searchObj.searchQuery){
		data.query.bool.must.push(
			{
			flt:{
				"fields":["title", "body"]
				, "like_text":searchObj.searchQuery
			}});
	}else{
		data.query.bool.must.push({match_all:{}});
	}

	if(searchObj.course){
		data.query.bool.must.push({"term":{"course": searchObj.course}});
		if(searchObj.week){
			data.query.bool.must.push({"term":{"week": parseInt(searchObj.week)}});
		}
	}

	switch(searchObj.searchType){
		case 'latest':{
			data = latestQuestion(data);
			break;
		}
		case 'instructor':{
			data = instructorQuestion(data);
			break;
		}
		case 'unanswered':{
			data = unansweredQuestion(data);
			break;
		}
		case 'myQuestions':{
			data = myQuestions(data, searchObj);
			break;
		}
		case 'viewed':{
			data = viewed(data);
			break;
		}
		case 'replied':{
			data = replied(data);
			break;
		}
		case 'notMyQuestions':{
			data = notMyQuestions(data, searchObj);
			break;
		}
		default:{}
	}

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//get questions sorted by comment count
var replied = function(data){
	data.sort = [{"commentCount":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];
	return data;
}

//get the latest question sorted by create date
var latestQuestion = function(data){
	data.sort = [{"created":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];
	return data;
}

//get all instructor posted question
var instructorQuestion = function(data){
	data.query.bool.must.push({"term":{"isInstructor": true}});
	//sort
	return data;
}

//get all unanswered question
var unansweredQuestion = function(data){
	data.query.bool.must.push({"term":{"status": "unanswered"}});
	//sort
	return data;
}

//get question sorted by user uuid
var myQuestions = function(data, searchObj){
	data.filter =  { "or":[]};
	data.filter.or.push({"term":{"user": searchObj.uuid}});
	data.filter.or.push({"term":{"followup": searchObj.uuid}});
	return data;
}

var notMyQuestions = function(data, searchObj){
	data.filter =  { "not":{ "filter":{ "or":[]}}};
	data.filter.not.filter.or.push({"term":{"user": searchObj.uuid}});
	data.filter.not.filter.or.push({"term":{"followup": searchObj.uuid}});
	return data;
}

//get questions sorted by view count
var viewed = function(data){
	data.sort = [{"viewCount":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];
	return data;
}

module.exports = new QueryES;