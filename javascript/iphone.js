/** 
 * @projectDescription	iPhone Animation
 * @author 	Matt Hobbs
 * @version 	0.1 
 */
var iPhoneAnimation = function(){
	var initialPosition = null;
	var previousPosition = {};
	var direction = "";
	var width = parseInt($(".content-box:first").width(), 10);
	var thirdWidth = parseInt(width / 3, 10);
	
	return {
		init: function(){
			this.panalIndicators(0);
		},
		moveInfo: function(e){
			var $this = $(this);
			
			//Correct position in current box
			var position = e.pageX - $("#wrapper").offset().left;
			
			//Set our initial position, mouse movement now relates to this point
			if(initialPosition === null){initialPosition = {left: position};}
			
			//Relative mouse point
			var mouseToPoint = initialPosition.left - position;
			
			//Check what direction mouse moved
			if(position > previousPosition.left){
				direction = "right";
			} else if(position < previousPosition.left){
				direction = "left";
			}
			previousPosition = {left: position};
			
			//Move the current container to point
			$this.css({
				marginLeft: -mouseToPoint
			});
		},
		panelAnimate: function($this){
			//Grab margin the panel was pulled too
			var margin = parseInt($this.css("marginLeft"), 10);
			
			//Look see if there is a previous / next element
			var $next = $this.next();
			var $prev = $this.prev();
			
			//Index used in indicators
			var index = $this.index();
			
			//User pulled left
			if(direction === "left"){
				//We have a next element to show
				if($next.length && margin < -thirdWidth){
					$this.animate({
						marginLeft: -width
					}, 550, "easeOutCirc");
					//Animated, now change indicator
					this.panalIndicators(index + 1);
				} else {
					//Spring back
					$this.animate({
						marginLeft: 0
					}, 550, "easeOutCirc");
				}
			}
			
			//User pulled right
			if(direction === "right"){
				//We have a previous element to show
				if($prev.length && margin > thirdWidth){
					$prev.animate({
						marginLeft: 0
					}, 550, "easeOutCirc", function(){
						$this.css({
							marginLeft: 0
						});
					});
					//Animated, now change indicator
					this.panalIndicators(index - 1);
				} else {
					//Spring back
					$this.animate({
						marginLeft: 0
					}, 550, "easeOutCirc");
				}
			}
		},
		panalIndicators: function(index){
			//Create our panal indicators
			if(!$("#panelIndicator").length){
				var indHTML = "<ol id='panelIndicator'>";
				$(".content-box", document.getElementById("fake")).each(function(){
					indHTML += "<li>&bull;</li>";
				});
				indHTML += "</ol>";
				//Modify before hitting the DOM
				var $modified = $(indHTML).find("li:first").addClass("active").end();
				
				//Append to the wrapper
				$("#wrapper").append($modified);
			}
			//Remove active
			$("#panelIndicator").find("li").removeClass("active").end().find("li:eq(" + index + ")").addClass("active");
		},
		resetVars: function(){
			initialPosition = null;
		}
	};
}();

