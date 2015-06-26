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
		<div><h3>ELEMENTO NON RICONOSCIUTO: <?php echovar("element") ?> </h3></div>
		<div><span class="info-text">Configura questo elemento per poterlo riutilizzare in futuro</span></div>
	</div>
	<div class="body">
		<div class="tools"></div>
		<div class="input-area">
		<form id="add-item">
			<div class="left left-area">
				<label class="protocol-label">Data</label>
				<div class="data-input-cont">
					<div class="data-input-group">
						<label>Alias*</label>
						<div class="right-inputs" style="float:left;">
							<input type="text" name="alias" rules="required" value="<?php echovar("element") ?>"/>
							<span class="input-info"></span>
						</div>
						<div class="clear"></div>
					</div>

					<div class="data-input-group">
						<label>HTML tag*</label>
						<div class="right-inputs" style="float:left;">
							<input type="text" name="tag" rules="required" />
							<span class="input-info"></span>
						</div>
						<div class="clear"></div>
					</div>

					<div class="data-input-group">
						<label>Icon</label>
						<div class="right-inputs">
							<input type="text" name="icon" value=""/>
							<span class="input-info"></span>
						</div>
						<div class="clear"></div>
					</div>

					<div class="data-input-group">
						<div class="left" style="width: 110px;">
							<label style="float:left;">Default style</label>
							<p style="font-size:11px; padding-left:10px;">Lo stile di default aiuta a individuare quegli elementi che inizialmente sarebbero invisibili (ex. links, span...)</p>
						</div>
						<div class="right-inputs">
							<textarea name="default_style" class="text-default-style"></textarea>
						</div>
						<div class="clear"></div>
					</div>
				</div>
			</div>
			<div class="left right-area">
				<label class="protocol-label">Protocol* <xmp>(ex: <img src="$resource" title="$title" ... $attributes />)</xmp></label>
				<textarea class="protocol" name="protocol" rules="required"></textarea>
			</div>
		</form>
		</div>
		<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault add-item">AGGIUNGI</a>
			</div>
		</div>
	</div>
</div>

<script>

	/*
	 * Check alias
	*/
	$("form#add-item input[name='alias']").on("keyup", function() {
		var val = $(this).val();
		if(TwigGen.HasItemByAlias(val)) {
			$(this).addClass("error");
			$(this).next("span.input-info").html("Già esistente");
		} else {
			$(this).removeClass("error");
			$(this).next("span.input-info").html("");
		} 
	});

	/*
	 * AddItem
	*/
	$(".add-item").on("click", function(e) {
		e.stopPropagation();
		var o = {};
		
		//Check required fields
		var _e = false;
		$("#add-item").find("[rules='required']").each(function() {
			if($(this).val().replace(/\s/g, '') == '') {
				$(this).css("border", "1px solid red");
				_e = "I campi obbligatori devono essere valorizzati";
			} else $(this).css("border", "1px solid #DDD");
		});
		if(_e) {
			$(".text-er").html(_e);
			return false;
		}

		//Get values
		$('form#add-item').find('input, textarea, button, select').attr('disabled','disabled');
		var name = $("#add-item input[name='alias']").val();
		$("form#add-item input[type='text']").each(function() {
			o[$(this).attr("name")] = $(this).val();
		});
		$("form#add-item textarea").each(function() {
			o[$(this).attr("name")] = $(this).val();
		});

		o["default_style"] = CSSJSON.toJSON(o["default_style"]);
		o["visible"] = true;
		//Add item
		TwigGen.AddItem(name, o, function(d) {
			$('form#add-item').find('input, textarea, button, select').attr('disabled','enabled');
			if(d.error) {
				$(".text-er").html(d.error);
			} else {
				TwigGen.CloseModal()
					.GetState("Main").UseItem( TwigGen.GetItemByAlias(name) )
					.UpdateGraphicInterface();

				cback = "<?php print echovar("callback"); ?>";
				if(cback && TwigGen.Cache.GetData(cback)) {
					TwigGen.Cache.GetData(cback).call(TwigGen);
				}
			}
			
		});
	});
</script>