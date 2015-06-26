<?php

function echovar($n) {
	if(!isset($_GET[$n]) && !isset($_POST[$n]))
		return null;
	else {
		return (isset($_GET[$n]) ? $_GET[$n] : $_POST[$n]);
	}
}

//Get object
$obj = json_decode(echovar("item"));
if(!$obj) {
	return print_r("Undefined object");
}
?>

<div id="modal-cont" class="css-modal">
	<div class="header">
		<div><h3>STILE: <?php print $obj->alias ?>, tag: <?php print $obj->tag ?>, chain-id: <?php print echovar("chainid") ?></h3></div>
		<div><span class="info-text">Gestisci lo stile di questo progetto</span></div>
	</div>
	<div class="body">
		<div>
			<label class="blue-label">CSS:</label>
			<textarea id="_source" class="__css-editor jush language-css"></textarea>
		</div>
	</div>
	<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault add-style">MODIFICA</a>
			</div>
		</div>
</div>


<script type="text/javascript" src="assets/js/jush-textarea.js"></script>
<script>
	$(function() {
			
		
    	/*
	     * Preload the project's CSS
    	*/
		$(".css-modal textarea#_source").text(TwigGen.GetProjectStyle("project-style"));
		

		/*
	     * JUSH initialization
		*/
		
		jush.textarea(document.getElementById('_source'));



		/*
	     * Save style
		*/
		$(".css-modal .add-style").on("click", function() {
			//Check valid parentheses
			var text = $("pre.jush").text();
			var openg = TwigGen.CountOccurrences(text, "{");
			var closeg = TwigGen.CountOccurrences(text, "}");
	 		if(openg != closeg) 
	 			return $(".text-er").text("Il css non è valido. Controlla i caratteri di apertura e chiusura");
			//Bugged : toJSON: if the css isn't right (example .page {  missing closing bracket ) everything crash
			TwigGen.AppendStyleFromJSON( CSSJSON.toJSON(text) , "project-style")
				.CloseModal();
		});

  	});
</script>
