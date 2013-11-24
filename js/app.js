var APP = APP || {};

(function () {
		
	//Controller Object
	APP.controller = { 
		
		init: function () { 
			
			APP.router.init();	
			APP.interaction.init();	
		}
	};
	
	//Interaction Object
	APP.interaction = { 
		
		init: function () { 
						
			APP.interaction.updateScore();
			APP.interaction.swipePages();
			APP.interaction.backToTop();
		},		
		updateScore: function () { 
		
			var updateBtn = qwery('#update_score')[0]; //Get update button by ID
			
			updateBtn.onclick = function() {  //Onclick
			
				APP.feedback.hide(); //Hide feedback message
			
				var route = APP.router.getCurrentRoute(true); //Get current route
				var gameId = route.substr(route.lastIndexOf('/') + 1); //Get game ID from route
				var team1Score = qwery('#team_1_score')[0].value; //Get team 1 score
				var team2Score = qwery('#team_2_score')[0].value; //Get team 2 score
				var isFinal = qwery('#is_final')[0].checked; //Check if checkbox "is Final" is checked
			
				APP.game.update(gameId, team1Score, team2Score, isFinal); //Update game
			}			
		},		
		swipePages: function () {
						
			var leftTrig = qwery('#left_swipe_trig')[0]; //Get left swipe trigger element
			var rightTrig = qwery('#right_swipe_trig')[0]; //Get right swipe trigger element
										
			Hammer(leftTrig).on("swiperight", function() { //On swipe right
				
				var route = APP.router.getCurrentRoute(false); //Get current route						
				
				switch(route) //Switch route
				{
					case 'schedule': //In case route equals schedule					
						document.location.href='#/ranking'; //Change location to ranking
					break;
					case 'pools': //In case route equals pools	
						document.location.href='#/schedule'; //Change location to schedule
					break;
					case 'ranking': //In case route equals ranking	
						document.location.href='#/pools'; //Change location to pools
					break;
					case 'game': //In case route equals game	
						document.location.href='#/schedule'; //Change location to schedule
					break;
					default: //In case route equals none of the above
						document.location.href='#/ranking';	 //Change location to ranking				
				}
			});		
			Hammer(rightTrig).on("swipeleft", function() {
				
				var route = APP.router.getCurrentRoute(false); //Get current route	
						
				switch(route) //Switch route
				{
					case 'schedule': //In case route equals schedule	
						document.location.href='#/pools'; //Change location to pools	
					break;
					case 'pools': //In case route equals pools	
						document.location.href='#/ranking'; //Change location to ranking	
					break;
					case 'ranking': //In case route equals ranking	
						document.location.href='#/schedule'; //Change location to schedule	
					break;
					case 'game': //In case route equals game	
						document.location.href='#/schedule'; //Change location to schedule	
					break;
					default: //In case route equals none of the above
						document.location.href='#/pools';		
				}				
			});							
		},
		backToTop: function () {
			
			var backToTopBtn = qwery('.back_to_top'); //Get back to top buttons
			
			for(var i = 0; i < backToTopBtn.length; i++) //For each button
			{									
				backToTopBtn[i].onclick = function() { //Onclick
					anim(document.body, { scrollTop: 0 }, 0.5, "lin"); //Chrome back to top
					anim(document.documentElement, { scrollTop: 0 }, 0.5, "lin"); //Firefox back to top
				}
			}
		}
	}

	// Router Object
	APP.router = {
		init: function () {
	  		routie({ //Check for URL
			    '/schedule': function() { //In case URL is schedule
			    	APP.page.render('schedule');
				},
			    '/pools': function() { //In case URL is pools
			    	APP.page.render('pools');
			    },
			    '/ranking': function() { //In case URL is ranking
			    	APP.page.render('ranking');
				},
			    '/game/:id': function(id) { //In case URL is game
			    	APP.page.render('game', id);
			  	},
			    '*': function() { //In case URL is empty
			    	APP.page.render('schedule');
			    }
			});
		},
		change: function () {
						
      		var route = APP.router.getCurrentRoute(false); //Get current route
			
			sections = qwery('section'); //Get all sections
			section = qwery('[data-route=' + route + ']')[0]; //Get section used by route

            if (section) { //If section is not empty
            	for (var i=0; i < sections.length; i++){ //For each section
            		sections[i].classList.remove('active'); //Remove active class
            	}
            	section.classList.add('active'); //Add active 
            }

            if (!route) { //If route is empty
            	sections[0].classList.add('active'); //Add active to the first section
            }
		},
		getCurrentRoute: function (keepId) { //Get current route with or without ID
			
			var route = window.location.hash.slice(2); //Get route	
			
			if(route.lastIndexOf('/') != -1 && keepId == false) //If URL contains ID
			{
				route = route.substr(0, route.lastIndexOf('/')); //Cut ID from URL
			}
			
			return route; //Return route
		}
	};
	
	//Schedule Object	
	APP.schedule = { 
	
		all: function ()
		{
			APP.loading.show(); //Show loading circle
			
			reqwest({
				url: 'https://api.leaguevine.com/v1/games/?tournament_id=19389&order_by=%5Bstart_time%5D&fields=%5Bid%2Cteam_1_score%2Cteam_2_score%2Cteam_1%2Cteam_2%2Cstart_time%2Cpool%2Cwinner_id%5D&limit=200', 
				type: 'json',
				method: 'get',
				success: function(data) { //Json get data
					console.log(data); //Log data in console
					
					var dir = { //Directives to keep html clean
						objects: { 
							team_1_name: {
								text: function() {
									return(this.team_1.name); //Return team 1 name	
								}
							},
							team_2_name: {
								text: function() {
									return(this.team_2.name); //Return 2 teamname	
								}
							},
							score: {
								text: function() {
									return(this.team_1_score + ' - ' + this.team_2_score); //Return score	
								}
							},
							time: {
								text: function() {
									var time = new Date(this.start_time);
									return(time.toFormat('DDD HH:MI P')); //return formatted start time
								}
							},
							link: {
								href: function() {
                  					return('#/game/' + this.id); //Return game link
                				}
							}
						}
					}
					
					APP.loading.hide(); //Hide loading circle
					Transparency.render(qwery('[data-route=schedule]')[0], data, dir); //Render schedule page
				}
			 });
			 
			 APP.router.change(); //Change active section to route
		}		
	}
	
	//Pool Object	
	APP.pool = {
		
		all: function ()
		{
			APP.loading.show();  //Show loading circle
			
			reqwest({
				url: 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=%5Bid%5D', 
				type: 'json',
				method: 'get',
				success: function(data) { //Json get data
					console.log(data); //Log data in console
					
					var dir = { //Directives to keep html clean
						objects: { 
							standings: { 
								team_name: {
									text: function() {
										
										var teamName = this.team.name;
										return(teamName); //Return teamname	
									}
								}
							}
						}
					}	
					
					APP.loading.hide();	//Hide loading circle		
					Transparency.render(qwery('[data-route=pools]')[0], data, dir); //Render pools page
				}
			 });
			 
			 APP.router.change(); //Change active section to route	
		}	
		
	}
	
	//Ranking Object	
	APP.ranking = {
	
		all: function ()
		{
			APP.loading.show(); //Show loading circle
			
			reqwest({
				url: 'https://api.leaguevine.com/v1/stats/ultimate/team_stats_per_tournament/?tournament_ids=%5B19389%5D&order_by=%5B-wins%5D', 
				type: 'json',
				method: 'get',
				success: function(data) { //Json get data
					console.log(data); //Log data in console
					
					var dir = { //Directives to keep html clean
						objects: { 
							plus_minus: {
								text: function() {
									
									var plusMin = this.points_scored - this.points_allowed;
									return(plusMin); //Return plusminus points
								}
							},
							team_name: { 
								text: function() {
									
									var teamName = this.team.name;
									return(teamName); //Return teamname	
								}
							}
						}
					}	
					
					APP.loading.hide(); //Hide loading circle	
					Transparency.render(qwery('[data-route=ranking]')[0], data, dir); //Render ranking page
				}
			 });
			 
			 APP.router.change(); //Change active section to route			
		}		
	};
	
	//Game Object
	APP.game = {
		
		single: function (id) //Game by ID
		{		
			APP.loading.show(); //Show loading Circle
			APP.feedback.hide(); //Hide feedback message
				
			reqwest({
				url: 'https://api.leaguevine.com/v1/games/' + id + '/?tournament_id=19389&order_by=%5Bstart_time%5D&fields=%5Bid%2Cteam_1_score%2Cteam_2_score%2Cteam_1%2Cteam_2%2Cstart_time%2Cpool%2Cwinner_id%5D&limit=200', 
				type: 'json',
				method: 'get',
				success: function(data) { //Get game data by id
					console.log(data); //Log data in console
					
					var dir = { //Directives to keep html clean
						game_title: {
							text: function() {
								
								var title = this.team_1.name + ' vs ' + this.team_2.name + ' (' + this.id + ')';
								return(title); //Return game title
							}
						},
						team_1_name: {
							text: function() {
								return(this.team_1.name); //Return team 1 name
							}
						},
						team_2_name: {
							text: function() {
								return(this.team_2.name); //Return team 2 name
							}
						}
					}
					
											
					APP.loading.hide();	//Hide loading circle					
					Transparency.render(qwery('[data-route=game]')[0], data, dir); //Render game page				
				}
			 });
			 
			 APP.router.change(); //Change active section to route			
		},
		
		update: function (gameId, team1Score, team2Score, isFinal) //Update game by ID, team 1 score, team 2 score, is final
		{
			var postData = JSON.stringify({ //Create post data
				game_id: gameId,
				team_1_score: team1Score,
				team_2_score: team2Score,
				is_final: isFinal,
				what_happened: "Update successful"
		    });
						
			reqwest({				
				url: 'https://api.leaguevine.com/v1/game_scores/',
				type: 'json',
				method: 'post',
				data: postData,
				contentType: 'application/json',
				headers: {
				  'Authorization': 'bearer 82996312dc' //Authorization header
				},
				error: function (err) { //Update error response
					console.log(err); //Log error	
					
					APP.feedback.show("Update failed");				
				},
				success: function (resp) { //Update success response
				 	console.log(resp); //Log success
					
					APP.feedback.show(resp.what_happened); //Show feedback message with response message
				}			
			})
		}
	}

	// Page Object
	APP.page = {
		render: function (route, id) { //Render page by route and ID

			switch(route) //Switch route
			{
				case 'schedule': //In case route equals schedule
					APP.schedule.all(); //Render all
				break;
				case 'pools': //In case route equals pools
					APP.pool.all(); //Render all
				break;
				case 'ranking': //In case route equals ranking
					APP.ranking.all(); //Render all
				break;
				case 'game': //In case route equals game
					APP.game.single(id); //Render single game
				break;
			}
		}
	}
	
	//Loading Object
	APP.loading = {
		show: function() { //Show loading circle
			qwery('#loading')[0].style.display = 'block'; //Display loading circle
	  	}, 
    	hide: function() { //Hide loading circle
     		qwery('#loading')[0].style.display = 'none'; //Hide loading circle
   		}
	};
	
	//Feedback Object
	APP.feedback = { 
		show: function(message) { //Show feedback with message
			qwery('#feedback')[0].style.display = 'block'; //Show feedback message
			qwery('#feedback')[0].innerHTML = message; //Add message to feedback container
		},
		hide: function() { //Hide feedback message
			qwery('#feedback')[0].style.display = 'none'; //Hide feedback message
		}		
	}
	
	// DOM ready
	domready(function () {		
		APP.controller.init();
	});
	
})();