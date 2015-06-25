<?php 
	function echovar($n) {
		if(!isset($_GET[$n]) && !isset($_POST[$n]))
			return null;
		else {
			echo (isset($_GET[$n]) ? $_GET[$n] : $_POST[$n]);
		}
	}
?>

<div class="_edt" id="modal-cont">
	<div class="header">
		<div><h3>SALVA IL LAYOUT </h3></div>
		<div><span class="info-text">Salva il layout in un documento html</span></div>
	</div>
	<div class="body">
		<div class="tools"></div>
		<div class="input-area">
		<form id="save-layout">
			<div class="left left-area">
				<label class="protocol-label">Informazioni</label>
				<div class="data-input-cont">
					<div class="data-input-group">
						<label>Nome</label>
						<div class="right-inputs" style="float:left;">
							<input type="text" name="nome" rules="required" value="<?php print echovar('pageName'); ?>"/>
							<span class="input-info"></span>
						</div>
						<div class="clear"></div>
					</div>
				</div>
			</div>
			<div class="left right-area">
				<label class="css-label">CSS</label>
				<textarea class="protocol" name="css" rules="required"></textarea>
			</div>
		</form>
		</div>
		<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault save-layout">SALVA</a>
			</div>
		</div>
	</div>
</div>

<script>
	$("a.save-layout").on("click", function() {
		TwigGen.GetState("Page").SaveLayout($("#save-layout input[name='nome']").val(), function(d) {
			d = JSON.parse(d);
			if(d.error) {
				$(".text-er").html(d.error);
			} else { 
				$(".text-er").html(d.message);
				TwigGen.CloseModal();
			}
		}, function(e) { //error
			console.log(e);
		});
	});
</script>