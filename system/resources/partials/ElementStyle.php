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
		<div><h3>STILE DELL'ELEMENTO: <?php print $obj->alias ?>, tag: <?php print $obj->tag ?>, chain-id: <?php print echovar("chainid") ?></h3></div>
		<div><span class="info-text">Modifica direttamente l'html di questo elemento</span></div>
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

<script type="text/javascript" src="assets/js/jush.js"></script>
<script type="text/javascript" src="assets/js/jush-textarea.js"></script>

<script>

	$(function() {
    	$( ".simplemodal-container" ).draggable();
		
		jush.style('assets/css/jush.css');
		jush.textarea(document.getElementById('_source'));

    	
		$("pre.jush").text(TwigGen.GetProjectStyle("project-style"));
		

    	/***********************************************************
	     * Real time style
    	*/
    	var temp = {
    		style: null
    	};

    	/*
	 	 * Style keyup event | css preview
		*/
		$("pre.jush").off().on("keyup", function(e) {
			var key = e.keyCode || e.which;
			if(key === 186 || key === 187)
				return;

			var json = CSSJSON.toJSON($(this).text());
			for(var i in json.attributes) {
				var att = json.attributes[i];
				$("[_chain-id='<?php print echovar("chainid") ?>']").css(i, att);
			}

			temp.style = json;
		});


		/*
	     * Close modal
		*/
		$(".css-modal .close-modal").on("click", function() {
			//Remove style
			if(!temp.style) return;
			for(var i in temp.style.attributes) {
				$("[_chain-id='<?php print echovar("chainid") ?>']").css(i, '');
			}
		});


		/*
	     * Save style
		*/
		$(".css-modal .add-style").on("click", function() {
			TwigGen.AppendStyleFromJSON(temp.style, "project-style")
				.CloseModal();
		});

  	});
</script>
