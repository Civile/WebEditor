<?php

function echovar($n) {
	if(!isset($_GET[$n]) && !isset($_POST[$n]))
		return null;
	else {
		return (isset($_GET[$n]) ? $_GET[$n] : $_POST[$n]);
	}
}

	$obj = json_decode(echovar("item"));

?>


<div id="modal-cont" class="_zoom-modal">
	<div class="header">
		<div><h3>ZOOM ELEMENTO: <?php print $obj->alias ?>, tag: <?php print $obj->tag ?>, chain-id: <?php print echovar("chainid") ?></h3></div>
		<div><span class="info-text">Migliora la manutenzione di questo elemento</span></div>
	</div>

	<div class="_menu-tabs">
		<div class="_button-tab"><a href="#" tab="panorama" class="_active">PANORAMICA</a></div>
		<div class="_button-tab"><a href="#">CSS</a></div>
		<div class="_button-tab"><a href="#">DETTAGLI</a></div>
	</div>

	<!-- tab panorama -->
	<div class="_panorama">
	<div class="_head-section"><label class="blue-label">PANORAMICA DELL'ELEMENTO</label></div>
		<div style="float:right">
			<a href="javascript:void(0)" class="_zoom-in"><i title="zoom in" class="fa fa-search-plus"></i></a>
			<a href="javascript:void(0)" class="_zoom-out"><i title="zoom out" class="fa fa-search-minus"></i></a>
			<span class=".__zoomlevel"></span>
		</div>
		<div class="body _potential _panorama-content" style="zoom:0.5;">
			<?php print echovar('content') ?>
		</div>
	</div>


	<div class="clear"></div>
	<div class="footer">
		<div class="buttons">
			<span class="text-er"></span>
			<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
			<a href="#" class="nodefault add-atts">MEMORIZZA</a>
		</div>
	</div>
</div>
<script>
	
(function() {

	/*
	 * Init
	*/
	var act = {
		item: JSON.parse(<?php print(json_encode(echovar('item'))) ?>)
	}


	/*
	 * Tabs
	*/
	$("._zoom-modal ._menu-tabs a").on("click", function(e) {
		e.preventDefault();
		if(!$(this).hasClass("_active")) {
			$("._menu-tabs").find("._active").removeClass("_active");
			$(this).addClass("_active");
		}
	});


	/*
	 * Zoom
	*/
	$("._zoom-modal a._zoom-in").on("click", function() {
		var z = parseFloat($("._panorama ._panorama-content").css("zoom"));
		$("._panorama ._panorama-content").css("zoom", z + 0.1);
		$(".__zoomlevel").text(z);
	});
	$("._zoom-modal a._zoom-out").on("click", function() {
		var z = parseFloat($("._panorama ._panorama-content").css("zoom"));
		$("._panorama ._panorama-content").css("zoom", z - 0.1);
		$(".__zoomlevel").text(z);
	});


})();

</script>