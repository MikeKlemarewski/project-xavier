var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesAccent = require('./routes/accent/routesAccent.js');
var routesPresenter = require('./routes/rqra/routesPresenter.js');

var app = module.exports = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: "keyboard cat",
			store: express.session.MemoryStore({ reapInterval: 60000 })
		}));
	//app.use(express.csrf());
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

app.dynamicHelpers({
	token: function(request, response) {
		return request.session._csrf;
	}
});

// routing
app.get('/', routesCommon.index);
app.get('/login', routesCommon.login);

// user
app.get('/api/user/:id', routesCommon.user); // get user by id
app.post('/api/user/', routesCommon.userQuery); // get a list of users based on a custom query

// course
app.get('/api/course/:id', routesCommon.course); // get course by id
app.post('/api/course/', routesCommon.courseQuery); // get a list of courses based on a custom query

// follower
//TODO: need update this into document
app.put("/api/question/:uid/follow", routesAccent.followQuestion); // a follower follows a question
//TODO: need update this into document
app.put("/api/question/:uid/unfollow", routesAccent.unfollowQuestion); // a follower follows a question

// questions
//TODO: need update this into document
app.post("/api/question", routesAccent.question); // post a new question by user id stored in seesion
//TODO: need update this into document
app.get("/api/questions", routesAccent.questions); // get all questions

app.get("/api/question/:uid", routesAccent.question); // get question by id
app.put("/api/question/:uid", routesAccent.question); // update question by id
app.delete("/api/question/:uid", routesAccent.question); // update question by id
app.get("/api/user/:uid/questions", routesAccent.questionsByUser); // get all questions for a user

//deprecated
//app.post("/api/user/:uid/questions", routesAccent.questionsByUser); // user posts a new question
app.put("/api/question/:uid/follow/:follower", routesAccent.followQuestion); // a follower follows a question

app.put("/api/question/:uid/status", routesAccent.questionStatus); // updates a questions status

app.post("/api/search/", routesAccent.search); // search based on a query

// comments
//TODO: need update this into document
app.post("/api/comment",routesAccent.comment); // post a new comment by user id stored in seesion object

//TODO: need update this into document
app.get("/api/comments", routesAccent.comments); // get all comments

app.get("/api/comment/:uid", routesAccent.comment); // get a comment by id
app.put("/api/comment/:uid", routesAccent.comment); // updates a question by id
app.delete("/api/comment/:uid", routesAccent.comment); //deletes a comment by id
app.get("/api/user/:uid/comments", routesAccent.commentsByUser); // gets a list of comments posted by a user

//deprecated
//app.post("/api/user/:uid/comments", routesAccent.commentsByUser); // user posts a comment

app.post("/api/comment/:uid/vote/:dir", routesAccent.commentVote); // votes on a comment
app.put("/api/comment/:uid/answered", routesAccent.commentAnswered); // updates a comments status to answered
app.get("/api/question/:uid/comments", routesAccent.commentsByQuestion); // get all of the comments for a question