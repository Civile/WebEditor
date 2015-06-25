<?php 
	function echovar($n) {
		if(!isset($_GET[$n]) && !isset($_POST[$n]))
			return null;
		else {
			echo (isset($_GET[$n]) ? $_GET[$n] : $_POST[$n]);
		}
	}
?>

<script type="text/javascript" src="assets/js/html5editor/parser_rules/advanced.js"></script>
<script type="text/javascript" src="assets/js/html5editor/dist/wysihtml5-0.3.0.min.js"></script>

<div id="modal-cont" class="html-modal">
	<div class="header">
		<div><h3>EDITA IL CONTENUTO</h3></div>
		<div><span class="info-text">Modifica direttamente i contenuti di questo elemento</span></div>
	</div>
	<div class="body">
		<div>
			<label class="blue-label">Anello: <?php print echovar("chainid") ?></label>
			<div id="_wysihtml5-toolbar" style="display: none;">
			  <a data-wysihtml5-command="bold"><i class="fa fa-bold"></i></a>
			  <a data-wysihtml5-command="italic"><i class="fa fa-italic"></i></a>

			  <!-- Some wysihtml5 commands require extra parameters -->
			  <a data-wysihtml5-command="foreColor"><i class="fa fa-html5"></i></a>

			  <!-- Some wysihtml5 commands like 'createLink' require extra paramaters specified by the user (eg. href) -->
			  <a data-wysihtml5-command="createLink"><i class="fa fa-link"></i></a>
			  <a data-wysihtml5-command="change_view"><i class="fa fa-html5"></i></a>
			  <div data-wysihtml5-dialog="createLink" class="_createLink" style="display: none;">
			    <label>
			      <input data-wysihtml5-dialog-field="href" type="text" value="http://" class="text">
			    </label>
			    <a data-wysihtml5-dialog-action="save">OK</a> <a data-wysihtml5-dialog-action="cancel">Cancel</a>
			  </div>
			</div>
			<textarea id="_wysihtml5-textarea" style="height:350px;width:100%;">
			</textarea>
			<span class="input-info"></span>
		</div>
	</div>
	<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal _close-modal-tiny" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault _mod-content">MODIFICA</a>
			</div>
		</div>
</div>


<script type="text/javascript">

	/*
	 * Init
	*/
	var editor = new wysihtml5.Editor("_wysihtml5-textarea", { // id of textarea element
  		toolbar:      "_wysihtml5-toolbar", // id of toolbar element
 	 	parserRules:  wysihtml5ParserRules, // defined in parser rules set
  		stylesheets: ["css/reset.css", "css/editor.css"]
	});

	editor.on("load", function() {
   		editor.focus();
   		editor.composer.commands.exec("insertHTML", '<?php print echovar('content') ?>');
	});

	/*
	 * Cancel
	*/
	$("._close-modal-tiny").off().on("click", function() {
		TwigGen.CloseModal();
	});

	/*
	 * Mod
	*/
	$("._mod-content").off().on("click", function() {
		var el = "[_chain-id='<?php print echovar("chainid") ?>']";
		$(el).html(editor.getValue());
		TwigGen.UpdateChainID("body");
		TwigGen.CloseModal();
	})

</script>