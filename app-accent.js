process.setMaxListeners(0);//annoying.
var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesAccent = require('./routes/accent/routesAccent.js');

var app = module.exports = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: true });
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
app.get('/login', routesAccent.login);
app.get('/logout', routesCommon.logout);

app.get('/manage', routesAccent.manageMedia);

// user
app.get('/api/user/courses', routesCommon.userCourses); // gets a list of all the users courses
app.get('/api/user/:id', routesCommon.user); // get user by id
app.post('/api/users/', routesCommon.userQuery); // get a list of users based on a custom query
app.put('/api/user/setPreferedName', routesCommon.userPreferredName); // update users prefered name

//userprofile
app.get("/api/user/:id/profile",routesCommon.userProfile); //get user profile by id
app.put("/api/user/:id/profile",routesCommon.userProfile); //update user profile by id

// course
app.get('/api/course/:id', routesCommon.course); // get course by id
app.post('/api/courses/', routesCommon.courseQuery); // get a list of courses based on a custom query
app.get('/api/course/:id/instructor', routesCommon.courseInstructor); // get the instructor of a course

//TODO: need update this into document
app.get('/api/course/:id/members', routesCommon.courseMembers);//get a list of members of a course

// follower
//TODO: need update this into document
app.put("/api/question/:uid/follow", routesAccent.followQuestion); // a follower follows a question
//TODO: need update this into document
app.put("/api/question/:uid/unfollow", routesAccent.unfollowQuestion); // a follower follows a question

// questions
//TODO: need update this into document
app.post("/api/question", routesAccent.question); // post a new question by user id stored in seesion
//TODO: need update this into document
app.get("/api/questions/page/:page", routesAccent.questions); //P, get all questions
app.get("/api/questions/mediafile/:id", routesAccent.getQuestionsByMedia); // get all questions related to a mediafile

app.get("/api/question/:uid", routesAccent.question); // get question by id
app.put("/api/question/:uid", routesAccent.question); // update question by id
app.delete("/api/question/:uid", routesAccent.question); // update question by id
app.get("/api/user/:uid/questions/page/:page", routesAccent.questionsByUser); // get all questions for a user. TODO:sort desc


app.put("/api/question/:uid/follow/:follower", routesAccent.followQuestion); // a follower follows a question
app.put("/api/question/:uid/status", routesAccent.questionStatus); // updates a questions status
app.post("/api/search/page/:page", routesAccent.search); // search based on a query

// comments
//TODO: need update this into document
app.post("/api/comment",routesAccent.comment); // post a new comment by user id stored in seesion object

//TODO: need update this into document
app.get("/api/comments", routesAccent.comments); // get all comments

app.get("/api/comment/:uid", routesAccent.comment); // get a comment by id
app.put("/api/comment/:uid", routesAccent.comment); // updates a question by id
app.delete("/api/comment/:uid", routesAccent.comment); //deletes a comment by id

app.put("/api/comment/:uid/vote/:dir", routesAccent.commentVote); // votes on a comment
app.put("/api/comment/:uid/answered", routesAccent.commentAnswered); // updates a comments status to answered
app.get("/api/question/:uid/comments/page/:page", routesAccent.commentsByQuestion); // P get all of the comments for a question


// Tags REST
app.post("/api/tag", routesAccent.tag); // create a new tag
app.get("/api/tag/last-watched", routesAccent.lastWatched); // Update users last-watched media tag
app.put("/api/tag/last-watched", routesAccent.lastWatched); // Update users last-watched media tag
app.get("/api/tag/:id", routesAccent.tag); // get a tag by id
app.put("/api/tag/:id", routesAccent.tag); // update a tag by id
app.delete("/api/tag/:id", routesAccent.tag); // delete a tag by id
app.get("/api/tag/mediafile/:id", routesAccent.userTagsByMedia); // get all user tags for specific media file


// MediaFiles REST
app.post("/mediafile/:id/update", routesAccent.updateMediaFile); // create a new mediafile
app.post("/api/mediafile", routesAccent.mediafile); // create a new mediafile
app.get("/api/mediafile/:id/conversations", routesAccent.getConversationsByMedia); // get all questions by media
app.get("/api/mediafile/:id", routesAccent.mediafile); // get a mediafile by id
app.put("/api/mediafile/:id", routesAccent.mediafile); // update a mediafile by id
app.delete("/api/mediafile/:id", routesAccent.mediafile); // delete a mediafile by id


app.get("/api/mediafile/:tid/tags", routesAccent.mediafileTag); // get all tags by mediafile id
app.get("/api/mediafiles/course/:id", routesAccent.courseMediaFiles);// get all media files for a course
app.post("/api/mediafiles/course", routesAccent.courseMediaFiles);
//to be deprecated, use Get API for each Model instead
app.get("/api/mediafile/:uid/user", routesAccent.mediafileUser); // get a mediafile user

app.get("/api/mediafile/:uid/section", routesCommon.getResourceSection); // get the section title of the resource

//non-REST calls
app.get('/', routesAccent.index);
app.get('/video/:mediaID', routesAccent.viewMediaPage);
app.get('/demo', routesAccent.demoPage); //this will login you with a demo user

/***NEW ROUTES */
app.post("/api/questions/search/page/:page", routesAccent.searchQuestionsRoute);
app.post("/api/section/course", routesCommon.sectionsInCourse);

// notification
app.get("/api/user/notification/:uid", routesAccent.getUserNotifications);
app.delete("/api/user/notification/:uid/comment/:qid", routesAccent.removeCommentNotifier);
app.put("/api/user/notification", routesAccent.updateUserNotifications);
