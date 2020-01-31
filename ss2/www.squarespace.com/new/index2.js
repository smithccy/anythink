$("#main_slide").carousel()
$("#win-slide").carousel()
function getTop(el) {
	var mtop = el.offsetTop
	var stop = $(window).scrollTop();
	return mtop-stop;
}

function getAllEl() {
	var elements=[];
	for(var i=0; i<12; i++){
		elements = elements.concat(Array.prototype.slice.call($(".col-md-"+(i+1))));
		
	}
	elements = elements.concat(Array.prototype.slice.call($(".col-sm-6")));
	return elements;
}
var elements = getAllEl();

var headerFixed = false;
$(document).on("scroll", function(){
	if($(window).scrollTop()>100 && headerFixed===false){
		headerFixed = true;
		$("header").css({position: "fixed", top: "-70px"})
		$("header .get_started a").css("color", "#fff")
		$("header .get_started").css("background", "#000")
		$("header").animate({top: "0"})
		
	}else if($(window).scrollTop()<100 && headerFixed===true){
		$("header").css({position: "static"})
		$("header .get_started a").css("color", "#000")
		$("header .get_started").css("background", "#fff")
		headerFixed = false;
	}
})

$(document).on("scroll", function(e){
	for(var i=0; i<elements.length; i++) {
		var el = elements[i]
		var height = $(el).height()
		
		var top = getTop(el);
		
		if (top<620) {
			$(el).css({top: 0, opacity: 1})
		}else{
			$(el).css({top: 80, opacity: 0})
		}
		
	}
})


$($("button.toggle-details")[0]).on("click", function(){
	$(this).addClass("show-details")
	setTimeout(function(){
		$($(".all-details")[0]).slideToggle();
		$('htm, body').animate({'scrollTop':$(".all-details")[0].offsetTop+'px'}, "slow")
	}, 400)
})
$($("button.toggle-details")[1]).on("click", function(){
	$(this).addClass("show-details")
	setTimeout(function(){
		$($(".all-details")[1]).slideToggle();
		$('htm, body').animate({'scrollTop':($(".all-details")[1].offsetTop+380)+'px'}, "slow")
	}, 400)
})

$($(".hide-details")[0]).on("click", function(){
	$($("button.toggle-details")[0]).removeClass("show-details")
	$($(".all-details")[0]).slideUp()
	$('htm, body').animate({'scrollTop':$(".winning")[0].offsetTop+'px'}, "slow") 
})
$($(".hide-details")[1]).on("click", function(){
	$($("button.toggle-details")[1]).removeClass("show-details")
	$($(".all-details")[1]).slideUp();
	$('htm, body').animate({'scrollTop':$(".stores")[0].offsetTop+'px'}, "slow")
})






$("#win-slide").carousel()

//0:black background; 1:white background
var main_bg = [0, 1, 0, 1, 0, 0, 1, 1]
var pannel_color = [0, 1, 0, 1, 0, 1, 1, 0]

$("#main_slide").on("slid.bs.carousel", function(){
	var index = getActiveIndex()
	modifyColor(index)
})
$(".carousel-control.left").on("click", function(){
	var index = getActiveIndex("left")
	modifyColor(index)
})
$(".carousel-control.right").on("click", function(){
	var index = getActiveIndex("right")
	modifyColor(index)
})


function getActiveIndex(type){
	var items = $(".item");
	var active = $(".item.active");

	var index = items.index(active);
	if( type === 'left') {
		index--;
		index = index<0?7:index;
	}else if(type === 'right'){
		index++;
		index = index>7?0:index;
	}
	
	return index;
}

function modifyColor(index){
	//black
	if(main_bg[index]){
		$(".fixed-text").addClass("white-bg")
		$(".fade-block .introduce").addClass("text-black")
	}else{
		$(".fixed-text").removeClass("white-bg")
		$(".fade-block .introduce").removeClass("text-black")
	}
	if(pannel_color[index]){
		$(".fade-block .pannel").addClass("white-pannel");
	}else{
		$(".fade-block .pannel").removeClass("white-pannel")
	}
	$(".fade-block.show").removeClass("show")

	$($(".fade-block")[index]).addClass("show")
}
