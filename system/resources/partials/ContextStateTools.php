<?php

?>

<div class="portion context-tools">
	<div class="input-group">
    	<label class="main-label">Context</label>
    	<div class="_ops-info"><span></span></div>
    </div>
</div>

<script>
	

	/*
	 * InfoComic
	*/
	$("body").append('<div id="_comic" class="abs"></div>');
	$(document).on("mouseover mousemove", "._caption-chained", function(e) {
		var tg = $(e.target).prop("tagName");
		var classes = TwigGen.GetClasses(e.target, ", ");
		
		if(classes) 
			tg += ": ";
		
		if(tg === "INPUT")
			tg += $(e.target).attr("type");
		
		$("._ops-info").html(tg + classes);
	}).on("mouseout", "._caption-chained", function() {
		$("._ops-info").html("");
	});

</script>