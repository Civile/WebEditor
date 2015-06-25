<?php 

	$obj = null;

	function echovar($n) {
		if(!isset($_GET[$n]) && !isset($_POST[$n]))
			return null;
		else {
			return (isset($_GET[$n]) ? $_GET[$n] : $_POST[$n]);
		}
	}

	if(echovar("element") != null) {
		$obj = json_decode(echovar("element"));
		if(!$obj) {
			print("Si è verificato un errore fatale. Impossibile iniziare la modifica");
			exit;
		}
	}

?>

<div id="modal-cont">
	<div class="header">
		<div><h3>MODIFICA PROTOCOLLO: <?php echo $obj->alias ?> </h3></div>
		<div><span class="info-text">Configura questo elemento per poterlo riutilizzare in futuro</span></div>
	</div>
	<div class="body">
		<div class="tools"></div>
		<div class="input-area">
		<form id="mod-item">
			<div class="left left-area">
				<label class="protocol-label">Data</label>
				<div class="data-input-cont">
					<div class="data-input-group">
						<label>Alias*</label>
						<div class="right-inputs" style="float:left;">
							<input type="text" name="alias" rules="required" value="<?php echo $obj->alias ?>"/>
							<span class="input-info"></span>
						</div>
						<div class="clear"></div>
					</div>

					<div class="data-input-group">
						<label>HTML tag*</label>
						<div class="right-inputs" style="float:left;">
							<input type="text" name="tag" rules="required" value="<?php echo $obj->tag ?>"/>
							<span class="input-info"></span>
						</div>
						<div class="clear"></div>
					</div>

					<div class="data-input-group">
						<label>Icon</label>
						<div class="right-inputs">
							<input type="text" name="icon" value="<?php echo $obj->icon ?>"/>
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
				<textarea class="protocol" name="protocol" rules="required"><?php echo $obj->protocol ?></textarea>
			</div>
		</form>
		</div>
		<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault mod-item">MODIFICA</a>
			</div>
		</div>
	</div>
</div>

<script>

(function($) {
	
	/*
	 * Init
	*/
	var __cura = "<?php echo $obj->alias ?>";
	var json = <?php echo json_encode($obj->default_style) ?>;
	if(json !== "{}") {
		var a = CSSJSON.toCSS(json);
		if(a) {
			$("form#mod-item textarea[name='default_style']").val(a);
		}
	}
	
	/*
	 * Check alias overwite error
	*/
	$("form#mod-item input[name='alias']").on("keyup", function() {
		var val = $(this).val();
		if(TwigGen.HasItemByAlias(val) && val !== __cura) {
			$(this).addClass("error");
			$(this).next("span.input-info").html("Già esistente");
		} else {
			$(this).removeClass("error");
			$(this).next("span.input-info").html("");
		} 
	});


	/*
	 * ModItem
	*/
	$(".mod-item").on("click", function(e) {
		e.stopPropagation();
		var o = {};

		//Check required fields/errors
		var _e = false;
		$("#mod-item").find("[rules='required']").each(function() {
			if($(this).val().replace(/\s/g, '') == '') {
				$(this).css("border", "1px solid red");
				_e = "I campi obbligatori devono essere valorizzati";
			} else $(this).css("border", "1px solid #DDD");
		});
		var alias = $("form#mod-item input[name='alias']").val();
		if(TwigGen.HasItemByAlias(alias) && alias !== __cura) {
			_e = "Non puoi sovrascrivere un altro elemento! Controlla l'alias";
		}
		if(_e) {
			$(".text-er").html(_e);
			return false;
		}

		//Get values
		$('form#mod-item').find('input, textarea, button, select').attr('disabled','disabled');
		var name = $("#mod-item input[name='alias']").val();
		
		o.alias = name;
		o.visible = true;
		
		$("form#mod-item input[type='text']").each(function() {
			o[$(this).attr("name")] = $(this).val();
		});
		$("form#mod-item textarea").each(function() {
			o[$(this).attr("name")] = $(this).val();
		});

		o.default_style = CSSJSON.toJSON(o.default_style);


		//Mod item
		TwigGen.ModItem(__cura, o, function(d) {
			$('form#mod-item').find('input, textarea, button, select').attr('disabled','enabled');
			if(d.error) {
				$(".text-er").html(d.error);
			} else {
				var item = TwigGen.GetItemByAlias($("#mod-item input[name='alias']").val());
				TwigGen.CloseModal()
					.GetState("Main").UseItem( item )
					.UpdateGraphicInterface();
			}
		});

	});


})(jQuery);


</script>