<?php
?>

<div id="modal-cont" class="_projects-modal">
	<div class="header">
		<div><h3>SELEZIONA UN DOCUMENTO</h3></div>
		<div><span class="info-text"></span></div>
	</div>
	<div class="body">
		<div>
			<label class="blue-label">Files</label>
			<div class="_edt _prs-container f-left list-cont" style="width:400px;">
				<div class="clear"></div>
			</div>
			<div class="__preview f-left">
				<iframe src="" height="500px" style="border:0px; width:100%;"></iframe>
			</div>
		</div>
	</div>
	<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault load-page">CARICA</a>
			</div>
		</div>
</div>


<script>
	/*
	 * InitExplorer
	*/
	 $('._prs-container').fileTree({ root: "../", script: '/TwigGen/server/jqueryFileTree.php' }, function(file) {
	 	var c = TwigGen.Cache.Get("ExplorerCallback");
	 	if(typeof c === "function") {
	 		c.call(TwigGen.Cache.Get("ExplorerContext"), file);
	 	}
	 	TwigGen.CloseModal();
	 	TwigGen.Cache.DelData("ExplorerCallback").DelData("ExplorerContext");
    });
</script>