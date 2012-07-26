var stylePicker = new stylePicker();

jQuery(document).ready(function ($) {

	if ($('html').hasClass('lt-ie8')) {
		window.location="http://www.youtube.com/watch?v=4DbgiOCTQts";
		return;
	}





	initUI();

	var engage = new coreApi.Engage();


	if (window.location.toString().indexOf('starred') != -1) {
		//if starred
		//TODO: change to a better method later

		$('#starred_btn').addClass('active');

		loadStarredArticles(engage);

	}
	else if (window.location.toString().indexOf('instructor') != -1) {
		$('#instructor_btn').addClass('active');
		loadInstructorArticles(engage);

	}
	else if (window.location.toString().indexOf('mine') != -1) {
		$('#contruibutions_btn').addClass('active');
		loadMyArticles(engage);


	}
	else if (window.location.toString().indexOf('design') != -1) {


	}
	else if (window.location.toString().indexOf('profile') != -1) {

		loadProfileArticles(engage);
	}
	else if (window.location.toString().indexOf('article') != -1) {
		loadComments(engage);
		$('.reply_click').live('click',function(){
			$('.reply_box').remove();
			var self = $(this);
			if (self.attr('data-reply-type') === 'super'){
				var target_uuid = $(this).attr('data-target-uuid');
				var reply_to = $('#owner_comment .name').html();//the name of user it replies to
				var new_reply_box = renderReplyBox(reply_to,target_uuid,null);
//
				$(new_reply_box).insertAfter('#owner_comment').slideDown('slow');

			}
		})

		$('#article_options span a::nth-child(3) ').bind('click', function () {
			$("div#article_container .columns:first-child").toggleClass('night');

			return false;
		})

		$('#article_options span a::nth-child(4) ').bind('click', function () {
			$("#article").toggleClass('larger');

			return false;
		})

	}

	else if (window.location.toString().indexOf('course') != -1) {

		$('#all_btn').addClass('active');
		$('#weeks-bar a').removeClass('active');

		var weekNum = (window.location.toString().split('#week'))[1];
		loadCourseArticles(engage, weekNum);

		$(window).bind( 'hashchange', function(e) {
			var weekNum = (window.location.toString().split('#week'))[1];
			loadCourseArticles(engage, weekNum);
		});

		$('#weeks-bar a.passed').bind('click', function () {
			var weekObj = $(this);
			var week = weekObj.attr('data-week');
			if (week) {
				$('#weeks-bar a').removeClass('active');
				weekObj.addClass('active');
				loadCourseArticles(engage, week);
			}


		})


	}
	else {
		$('#all_btn').addClass('active');
		$('#weeks-bar a').removeClass('active');

		var weekNum = (window.location.toString().split('#week'))[1];
		loadAllArticles(engage, weekNum);

		$('.flip_btn').bind('click',function(){
			$('div.cover').toggleClass('flip');
		})

		$('#submitnew form').bind('submit',function(){


			var course = $('#submitnew form option:selected').val();
			var description = $('#article_comment').val();
			var url = $('#article_url').val();
			engage.shareResource({course:course,description:description,url:url},function(data){

						console.log(data);
				if (data){
					if (data.errorcode === 0){
						var new_article = renderArticlePreviewBox(data.resource);
						$('#sharebox').after(new_article);
					}
					else{

					}
				}
				else{

				}
			});
			return false;

		})

		$('#weeks-bar a.passed').bind('click', function () {
			var weekObj = $(this);
			var week = weekObj.attr('data-week');
			if (week) {
				$('#weeks-bar a').removeClass('active');
				weekObj.addClass('active');
				loadAllArticles(engage, week);
			}


		})
	}

	$('span.typicn.star').live('click', function () {
		var self = $(this);
		var resource_uuid = $(this).parent().parent().attr('data-id');
		if (resource_uuid) {
			engage.starResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {
					self.addClass('starred');
				}


			})
		}

	})

	$('span.typicn.star.starred').live('click', function () {
		var self = $(this);
		var resource_uuid = $(this).parent().parent().attr('data-id');
		if (resource_uuid) {
			engage.unstarResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {
					self.removeClass('starred');
					if (window.location.toString().indexOf('starred') != -1) {
						self.parent().parent().parent().fadeOut('slow', function () {
							$(this).remove();
						});
					}
				}

			})
		}

	})

	$('.articlebox span.like_btn.disliked').live('click',function(){

		var self = $(this);
		var resource_uuid = $(this).parent().parent().attr('data-id');
		if (resource_uuid){
			engage.likeResource(resource_uuid,function(data){
				console.log(data);
				if (data && data.errorcode === 0) {
					self.addClass('liked');
					self.removeClass('disliked');

					var num = parseInt(self.children().html()) + 1;
					self.children().html(num);

				}
				else if (data.errorcode === 1){
					//if already liked
					engage.dislikeResource(resource_uuid,function(data){
						if (data && data.errorcode === 0) {
							var num = parseInt(self.children().html()) - 1;
							self.children().html(num)
						}

					})

				}

			})

		}

	})

	$('.articlebox span.like_btn.liked').live('click',function(){

			var self = $(this);
		var resource_uuid = $(this).parent().parent().attr('data-id');
		if (resource_uuid){
			engage.dislikeResource(resource_uuid,function(data){
				if (data && data.errorcode === 0) {
					self.removeClass('liked');
					self.addClass('disliked');

					var num = parseInt(self.children().html()) - 1;

					self.children().html(num);

				}

			})

		}

	})





});

function initUI() {
	$('dl.tabs dd a').on('click.fndtn', function (event) {
		activateTab($(this).parent('dd'));
	});

	if (window.location.hash) {
		activateTab($('a[href="' + window.location.hash + '"]'));
		$.foundation.customForms.appendCustomMarkup();
	}

	/* ALERT BOXES ------------ */
	$(".alert-box").delegate("a.close", "click", function (event) {
		event.preventDefault();
		$(this).closest(".alert-box").fadeOut(function (event) {
			$(this).remove();
		});
	});

	/* PLACEHOLDER FOR FORMS ------------- */
	/* Remove this and jquery.placeholder.min.js if you don't need :) */
	$('input, textarea').placeholder();

	/* TOOLTIPS ------------ */
	$(this).tooltips();

	/* UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE6/7/8 SUPPORT AND ARE USING .block-grids */
	//  $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'left'});
	//  $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'left'});
	//  $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'left'});
	//  $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'left'});


	/* DROPDOWN NAV ------------- */

	var lockNavBar = false;
	/* Windows Phone, sadly, does not register touch events :( */
	if (Modernizr.touch || navigator.userAgent.match(/Windows Phone/i)) {
		$('.nav-bar a.flyout-toggle').on('click.fndtn touchstart.fndtn', function (e) {
			e.preventDefault();
			var flyout = $(this).siblings('.flyout').first();
			if (lockNavBar === false) {
				$('.nav-bar .flyout').not(flyout).slideUp(500);
				flyout.slideToggle(500, function () {
					lockNavBar = false;
				});
			}
			lockNavBar = true;
		});
		$('.nav-bar>li.has-flyout').addClass('is-touch');
	} else {
		$('.nav-bar>li.has-flyout').hover(function () {
			$(this).children('.flyout').show();
		}, function () {
			$(this).children('.flyout').hide();
		});
	}

	/* DISABLED BUTTONS ------------- */
	/* Gives elements with a class of 'disabled' a return: false; */

	/* SPLIT BUTTONS/DROPDOWNS */
	$('.button.dropdown > ul').addClass('no-hover');

	$('.button.dropdown').on('click.fndtn touchstart.fndtn', function (e) {
		e.stopPropagation();
	});
	$('.button.dropdown.split span').on('click.fndtn touchstart.fndtn', function (e) {
		e.preventDefault();
		$('.button.dropdown').not($(this).parent()).children('ul').removeClass('show-dropdown');
		$(this).siblings('ul').toggleClass('show-dropdown');
	});
	$('.button.dropdown').not('.split').on('click.fndtn touchstart.fndtn', function (e) {
		e.preventDefault();
		$('.button.dropdown').not(this).children('ul').removeClass('show-dropdown');
		$(this).children('ul').toggleClass('show-dropdown');
	});
	$('body, html').on('click.fndtn touchstart.fndtn', function () {
		$('.button.dropdown ul').removeClass('show-dropdown');
	});

	// Positioning the Flyout List
	var normalButtonHeight = $('.button.dropdown:not(.large):not(.small):not(.tiny)').outerHeight() - 1,
		largeButtonHeight = $('.button.large.dropdown').outerHeight() - 1,
		smallButtonHeight = $('.button.small.dropdown').outerHeight() - 1,
		tinyButtonHeight = $('.button.tiny.dropdown').outerHeight() - 1;

	$('.button.dropdown:not(.large):not(.small):not(.tiny) > ul').css('top', normalButtonHeight);
	$('.button.dropdown.large > ul').css('top', largeButtonHeight);
	$('.button.dropdown.small > ul').css('top', smallButtonHeight);
	$('.button.dropdown.tiny > ul').css('top', tinyButtonHeight);


}

function renderCommentBox(item){
	function renderBox(item){
		return '<span class="name">' + item.user.firstName + ' ' + item.user.lastName
			+ '</span><p>' + item.body
			+ '</p><span class="post_time">' + formartDate(item.createdAt)
			+ '</span><span class="like_reply"><a>like (' + item.like + ')'
		+ '</a><a class="reply_click"> reply <span class="typicn forward"></span> </a></span></div>';
	}


   var html = '<div class="comment">'+ renderBox(item);

	if (item.replies && item.replies.length > 0){
		$.each(item.replies, function (index, reply) {

			html += '<div class="replies">'+ renderBox(reply);
		});

	}

	return html;
}

function loadComments(engage){
	var id = $('#hidden-info').attr('data-resource-id');
	if(id){
		engage.getCommentsByResourceId(id,function(data){
			if (data){
				if (data.errorcode === 0){
					console.log(data);
					$.each(data.comments, function (index, item) {

						console.log(item);
						comment = renderCommentBox(item);


						$('#comments').append(comment);
					});
				}
				else{

				}
			}
			else{

			}

		})
	}

}

function loadInstructorArticles(engage) {


	engage.getResourcesByCourseUUIDs(function (data) {

		if (data) {


			if (data.errorcode == 0) {

				$('.articlebox').remove();
				//$('#contents').empty();
				console.log(data);
				$.each(data.resources, function (index, item) {

					console.log(item);
					if (item.user.type === 1) {
						article = renderArticlePreviewBox(item);
						$('#contents').append(article);
					}

				});

			}

			else {

			}
		}
		else {

		}


	})
}


function loadMyArticles(engage) {

	engage.getResourcesByCurrentUserId(function (data) {
		if (data) {

			if (data.errorcode == 0) {

				$('.articlebox').remove();
				//$('#contents').empty();
				console.log(data);
				$.each(data.resources, function (index, item) {

					console.log(item);
					article = renderArticlePreviewBox(item);


					$('#contents').append(article);
				});

			}

			else {

			}
		}
		else {

		}


	})
}

function loadProfileArticles(engage){
	var id = $('#hidden-info').attr('data-user-id');

	if (id){
		engage.getResourcesByUserId(id, function (data) {
			if (data) {

				if (data.errorcode == 0) {

					$('.articlebox').remove();
					//$('#contents').empty();
					console.log(data);
					$.each(data.resources, function (index, item) {

						console.log(item);
						article = renderArticlePreviewBox(item);


						$('#contents').append(article);
					});

				}

				else {

				}
			}
			else {

			}


		})
	}
}

function loadCourseArticles(engage, week) {
	var id = $('#hidden-info').attr('data-course-id');

	if (id) {
		if (week) {

			engage.getWeekInfoByCourseIdAndWeekNum(id,week,function(data){
				if (data){
					if (data.errorcode ===0){
						var weekbox = renderWeekInfoBox(data.week);
						$('.weekbox').remove();
						$('#contents').append(weekbox);
					}
					else{

					}
				}
				else{

				}


			})




			engage.getResourcesByCourseUUIDAndWeek(id, week, function (data) {
				if (data) {
					if (data.errorcode === 0) {

						$('.articlebox').remove();
;
						console.log(data);
						$.each(data.resources, function (index, item) {

							console.log(item);
							var article = renderArticlePreviewBox(item);


							$('#contents').append(article);
						});

					}

					else {

					}
				}
				else {

				}
			})
		}
		else {
			engage.getResourcesByCourseUUID(id, function (data) {
				if (data) {

					if (data.errorcode == 0) {

						$('.articlebox').remove();
						//$('#contents').empty();
						console.log(data);
						$.each(data.resources, function (index, item) {

							console.log(item);
							article = renderArticlePreviewBox(item);


							$('#contents').append(article);
						});

					}

					else {

					}
				}
				else {

				}


			})
		}


	}


}


function loadAllArticles(engage, week) {

	if (week) {
		engage.getResourcesByCourseUUIDsAndWeek(week, function (data) {
			if (data) {
				if (data.errorcode == 0) {

					$('.articlebox').remove();
					//$('#contents').empty();
					console.log(data);
					$.each(data.resources, function (index, item) {

						console.log(item);
						article = renderArticlePreviewBox(item);


						$('#contents').append(article);
					});

				}

				else {

				}
			}
			else {

			}
		})

	}
	else {
		engage.getResourcesByCourseUUIDs(function (data) {
			if (data) {
				if (data.errorcode == 0) {

					$('.articlebox').remove();
					//$('#contents').empty();
					console.log(data);
					$.each(data.resources, function (index, item) {

						console.log(item);
						article = renderArticlePreviewBox(item);


						$('#contents').append(article);
					});

				}

				else {

				}
			}
			else {

			}


		})
	}

}

function loadStarredArticles(engage) {


	engage.getStarredResources(function (data) {
//	engage.getResourcesByCourseUUIDs(function(data){
		if (data) {
			if (data.errorcode == 0) {

				$('.articlebox').remove();
				//$('#contents').empty();
				console.log(data);
				$.each(data.resources, function (index, item) {

					console.log(item);
					article = renderArticlePreviewBox(item);


					$('#contents').append(article);
				});

			}

			else {

			}
		}
		else {

		}


	})
}

function renderWeekInfoBox(item){
	var weekBox =
		'<div class="three columns weekbox"><div id="week-info" class="innercontents"><h4>Week ' +
			item.week +
			'</h4><p>' +
			(item.topic) +
			'</p></div></div>'

	return weekBox;
}

function renderArticlePreviewBox(item) {

	var article =
		'<div class="three columns articlebox">'
			+ '<div class="innercontents ' + stylePicker.getStyle(item.course.subject) + '" data-id="' + item.uuid + '" id="' + item.uuid + '">'
			+ '<img src="' + 'https://secure.gravatar.com/avatar/aa50677b765abddd31f3fd1c279f75e0?s=140' + '" class="avatar"/>'


			+ '<div class="post_details"> '
			+ '<span><a href="/profile/'+ item.user.uuid +'">' + item.user.firstName + " " + item.user.lastName + '</a></span>'
			+ isProf(item.user.type) //return nothing if not

			+ '<p>Posted '
			+ '<span class="post_time"> ' + formartDate(item.createdAt) + '</span>'
			+ ' in '
			+ '<span class="coursename">' + '<a class="'+stylePicker.getStyle(item.course.subject)+'" href="/course/' + item.course.subject + '-' + item.course.number + '-' + item.course.section + '#week' + item.week + '">' + item.course.subject + " " + item.course.number
			+ '</a>'
			+ '</span>'

			+ '</p>'
			+ '</div>'

			//end of post_details

			+ renderPreviewImage(item)
			//end of innerwrap

			+ '<h5>'
			+ '<a href="/article/' + item.uuid + '" style="font-size:'+  renderTitleFontSize(item)   +'px">' + item.title + '</a></h5>'

			+ '<div class="articlepreview">' + '<p>' + renderExcerpt(item.excerpt) + '</p>'
			+ '</div>'
			+ '<div class="likescomments">'
			+ renderStar(item.starred)

			+ '<span class="like_btn disliked"> Like (<em>' + item.likes + '</em>) </span>'
			+ '<span> Comments (' + item.totalComments + ') </span>'
			+ '</div>'
			+ '</div>'
			+ '</div>';
	return article;

}


function activateTab($tab) {
	var $activeTab = $tab.closest('dl').find('dd.active'),
		contentLocation = $tab.children('a').attr("href") + 'Tab';

	// Strip off the current url that IE adds
	contentLocation = contentLocation.replace(/^.+#/, '#');

	// Strip off the current url that IE adds
	contentLocation = contentLocation.replace(/^.+#/, '#');

	//Make Tab Active
	$activeTab.removeClass('active');
	$tab.addClass('active');

	//Show Tab Content
	$(contentLocation).closest('.tabs-content').children('li').hide();
	$(contentLocation).css('display', 'block');
}


function formartDate(old_date) {
	var now = new Date();
	var post_time = new Date(Date.parse(old_date));
	var prettytime = formatAgo(post_time, null, now);
	return prettytime;
}


function isProf(user_type) {
	if (user_type === 1) {
		return '<span id="prof" title="instructor" class="typicn tick"></span>'
	}
	else {
		return '';
	}
}

function renderStar(starred) {
	if (starred) {
		return '<span class="typicn star starred"></span>';
	}
	else {
		return '<span class="typicn star"></span>'
	}
}


function renderPreviewImage(item) {

	var previewImage = '<div class="innerwrap" style=\''
		//IE
		+'background-image: url("'
		+ (item.thumbnail ? item.thumbnail : 'http://www.blog.spoongraphics.co.uk/wp-content/uploads/2011/great-britain/great-britain-sm.jpg')+ '");'
		//CHROME SAFARI
		+'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0.62)), color-stop(27%,rgba(0,0,0,0.12)), color-stop(41%,rgba(0,0,0,0.01)), color-stop(53%,rgba(0,0,0,0.06)), color-stop(100%,rgba(0,0,0,0.48))), url("'
		+ (item.thumbnail ? item.thumbnail : 'http://www.blog.spoongraphics.co.uk/wp-content/uploads/2011/great-britain/great-britain-sm.jpg')+ '");'

		//FIREFOX
		+'background-image: -moz-linear-gradient(top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 27%, rgba(0,0,0,0.01) 42%, rgba(0,0,0,0.06) 53%, rgba(0,0,0,0.48) 100%), url("'
		+ (item.thumbnail ? item.thumbnail : 'http://www.blog.spoongraphics.co.uk/wp-content/uploads/2011/great-britain/great-britain-sm.jpg')+ '");'
//		+ 'http://www.smashinglists.com/wp-content/uploads/2010/02/persian.jpg'
		 + '\'>'
		+ '</div>'



//	var previewImage = '<div class="innerwrap" >'
//		+ '<img src = "'
//		+ (item.thumbnail ? item.thumbnail : 'http://www.blog.spoongraphics.co.uk/wp-content/uploads/2011/great-britain/great-britain-sm.jpg')
//		+ '" alt= "'+item.title+'" title="'+item.title+'"/>'
//		+ '<h5>'
//		+ '<a href="/article/' + item.uuid + '">' + item.title + '</a></h5>'
//		+ '</div>'

	return  previewImage


}

//ajust text font size according to length
function renderTitleFontSize(item){
	var len =  item.title.length;
	if (len <= 27) return 30;
	if (len <= 45 ) return 28;
	else return 25;
}

function renderExcerpt(excerpt) {
	if (excerpt) {

		return excerpt;
	}
	else {
		return 'Australia\'s Prime Minister Julia Gillard and New Zealand\'s Foreign Minister Murray McCully give their reaction (whaling footage courtesy of';
	}
}


// a class that choose unique box color style for given subject
// if the subject is new, give a new color, otherwise use the old one;

function stylePicker() {
	var available_styles = ['color-1', 'color-2','color-3', 'color-4','color-5', 'color-6'];
	var subjects = {};

	this.getStyle = function (subject) {

		if (subjects[subject]) {
			return subjects[subject]

		}
		else {
			var result = available_styles.shift();
			if (!result) {
				result = "box-style-1";
			}
			subjects[subject] = result;
			return result;
		}

	}


}

//2012-07-21T00:00:24.000Z
function weekConverter(post_date, semester_start_date) {

	Date.prototype.getWeek = function () {
		var onejan = new Date(this.getFullYear(), 0, 1);
		return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
	}

	var one_week = 7 * 24 * 60 * 60 * 1000;
	var post_date = new Date(Date.parse(post_date));
	var semester_start_date = new Date(Date.parse(semester_start_date));
	return post_date.getWeek() - semester_start_date.getWeek() + 1;


}

function renderReplyBox (reply_to, comment_target, comment_parent){
	var html = '<div style="display:none" class="reply_box"><span>replying to ' + reply_to + '</span><form name="add_comment"><input  type="text" id="reply_conent" placeholder="Type in a comment"><input type="submit" value="Post"> <input type="hidden" id="comment_target" value="'
		+ comment_target
		+ '"><input type="hidden" id="comment_target" value="'
		+ comment_parent
		'"></form></div>'

	return html;
}