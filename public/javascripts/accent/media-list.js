var accent = new coreApi.Accent();
var common = new coreApi.Common();

function getMedia(courseUUID, all){
	
	// Only load media files if on the main page
	if($('#media-list')){
		//alert("UUID " + courseUUID);
		// If the all button was clicked, build up an array of course uuids
		// to feed to getMedia
		if(typeof courseUUID === 'string' && courseUUID.toLowerCase() === 'all'){
			var courseUUIDS = [];
			var courses = $('#Courses').children();
			for(var i = 0; i < courses.length; ++i){
				var uuid = courses[i].querySelector(".UUID");
				if(uuid){
					courseUUIDS.push(uuid.innerHTML.replace(/\t/g, ''));
				}
			}
			retrieveMedia(courseUUIDS, true);
		}
		else{
			retrieveMedia(courseUUID, false);
		}
	}
}

var retrieveMedia = function(courseUUID, all){
	accent.getMediaFiles(courseUUID, function(response){
		$('#media-list').empty();
		var media = response.media;
		for(var i = 0; i < media.length; ++i){

			(function(mediaItem){
				accent.getMediaSection(mediaItem.uuid, function(section){
					var mediaNode = "<div class=\"MediaItem\">" + 
						"<img src=\"" + mediaItem.thumbnail + "\" alt=\"\" width=\"200\"/>" +
						"<h1>" + mediaItem.title + "</h1>" + 
						"<h2>" + section.section + "</h2>" + 
						"<p>" + mediaItem.description + "</p>";
					
					// If getting media for all courses, also get the course 
					// name/number of the media file
					if(all){
						(function(courseUUID){
							common.getCourseById(courseUUID, function(response){
								mediaNode = mediaNode + 
								"<h2>" + response.course.subject + " " +
								response.course.number + "</h2>" +
								"</div>";
								$('#media-list').append(mediaNode);
							})
						})(mediaItem.course);
					}
					else{
						mediaNode = mediaNode + "</div>";
						$('#media-list').append(mediaNode);
					}
				})
			})(media[i])
		}
	})
}

getMedia($('.Selected').text());