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

<script>
	$.SyntaxHighlighter.init({});
</script>
<div id="modal-cont" class="html-modal">
	<div class="header">
		<div><h3>HTML DELL'ELEMENTO: <?php print $obj->alias ?>, tag: <?php print $obj->tag ?>, chain-id: <?php print echovar("chainid") ?></h3></div>
		<div><span class="info-text">Modifica direttamente l'html di questo elemento</span></div>
	</div>
	<div class="body">
		<div>
			<label class="blue-label">HTML:</label>
			<pre class="code language-html" style="  width: 779px;">
				<?php print htmlspecialchars(echovar('html'), ENT_QUOTES); ?>
			</pre>
			<span class="input-info"></span>
		</div>
	</div>
	<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault add-class">MODIFICA</a>
			</div>
		</div>
</div>
