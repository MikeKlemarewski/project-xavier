//Just a test file to demo how to use core.api.js



$(document).ready(function(){

	var rqra = new coreApi.Presenter();
	rqra.getAllQuestions(function(data){
		if(data){
			$('#questions').empty();
			if(data.errorcode === 0 && data.questions.length > 0){

				$.each(data.questions, function(index,item){
					console.log(item);
					var content ='<li>'
						+ '<p>'+ item._id + '</p>'
						+ '<p>'+ item._source.body + '</p>'
						+ '<p>'+ item._source.category + '</p>'
						+ '<p>'+ item._source.status + '</p>'
						+ '<p>'+ item._source.timestamp + '</p>'
						+ '<p>'+ item._source.title + '</p>'
						+ '<p>'+ item._source.user + '</p>'
						+'</li>';
					$('#questions').append(content);
				});
			}
			else{
				$('#error').text(data.message);
			}

		}
		else{
			$('#error').text('CANNOT CONNECT TO DATABASE');
		}
	});


	$("#getQuestionById").click(function(event){
		var question_id = $('#question_id').val();
		if (question_id){
			rqra.getQuestionById(question_id,function(data){
				if(data){
					if(data.errorcode === 0){
						$('#question_title').val(data.question.title);
						$('#question_body').val(data.question.body);
					}
					else{
						$('#error').text(data.message);
					}
				}
				else{
					$('#error').text('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else{
			$('#error').text('CANNOT BE EMPTY ID');
		}
	})


	$("#updateQuestionById").click(function(event){
		var question_id = $('#question_id').val();
		var new_title = $('#question_title').val();
		var new_body = $('#question_body').val();
		if(question_id && new_title && new_body){
			//rqra.updateQuestionById('pJfzndwdadddQuOicWWAjx7F00', "i have no clue!!!" ,function(data){
			rqra.updateQuestionById(question_id, new_title, new_body ,function(data){
				if(data){
					console.log(data);
					if(data.errorcode === 0){

						$('#error').text("COOL, NOW REFRESH ALL QUESTIONS.");
					}
					else{
						$('#error').text(data.message);
					}

				}
				else{
					$('#error').text('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else{
			$('#error').text('CANNOT HAVE EMPTY FILED');
		}
	})

	$('#deleteQuestionById').click(function(){
		var question_id = $('#question_id').val();
		if(question_id){

			rqra.deleteQuestionById(question_id,function(data){

				if(data){
					console.log(data);
					if(data.errorcode === 0){

						$('#error').text("COOL, NOW REFRESH ALL QUESTIONS.");
					}
					else{
						$('#error').text(data.message);
					}

				}
				else{
					$('#error').text('CANNOT CONNECT TO DATABASE');
				}



			})


		}

		else{
			$('#error').text('CANNOT HAVE EMPTY FILED');
		}
	})

	$("#getALLQuestions").click(function(event){

		rqra.getAllQuestions(function(data){
			 if(data){
				 $('#questions').empty();
				 if(data.errorcode === 0 && data.questions.length > 0){

					$.each(data.questions, function(index,item){
						console.log(item);
						var content ='<li>'
							+ '<p>'+ item._id + '</p>'
							+ '<p>'+ item._source.body + '</p>'
							+ '<p>'+ item._source.category + '</p>'
							+ '<p>'+ item._source.status + '</p>'
							+ '<p>'+ item._source.timestamp + '</p>'
							+ '<p>'+ item._source.title + '</p>'
							+ '<p>'+ item._source.user + '</p>'
							+'</li>';
						$('#questions').append(content);
					});
				 }
				 else{

				 }

			 }


		});

	});


	$('#createQuestion').click(function(event){
		var user_id = $('#new_question_user').val();
		var title = $('#new_question_title').val();
		var body = $('#new_question_body').val();
		if (user_id && title && body){
			rqra.createQuestion(user_id, title, body, function(data){
				if (data){
					if (data.errorcode === 0){
						$('#error').text('OK OK REFRESH NOW');
					}

				}

				else{
					$('#error').text('CANNOT CONNECT TO DATABASE');


				}

			})



		}

	})

	$('#getQuestionsByUserId').click(function(event){
		var user_id = $("#user_id").val();
		if (user_id){
			rqra.getQuestionsByUserId(user_id,function(data){
				if(data){
					console.log("!!!!");
					console.log(data);
					$('#user_questions').empty();
					if(data.errorcode === 0 && data.questions.length > 0){

						$.each(data.questions, function(index,item){
							console.log(item);
							var content ='<li>'
								+ '<p>'+ item._id + '</p>'
								+ '<p>'+ item._source.body + '</p>'
								+ '<p>'+ item._source.category + '</p>'
								+ '<p>'+ item._source.status + '</p>'
								+ '<p>'+ item._source.timestamp + '</p>'
								+ '<p>'+ item._source.title + '</p>'
								+ '<p>'+ item._source.user + '</p>'
								+'</li>';
							$('#user_questions').append(content);
						});
					}
					else{
						$('#error').text(data.message);
					}

				}
				else{
					$('#error').text('CANNOT CONNECT TO DATABASE');
				}
			});
		}
		else{
			$('#error').text('CANNOT BE EMPTY FILED');
		}


	});



});