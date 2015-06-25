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


<div id="modal-cont" class="class-modal">
	<div class="header">
		<div><h3>CLASSI ELEMENTO: <?php print $obj->alias ?>, tag: <?php print $obj->tag ?>, chain-id: <?php print echovar("chainid") ?></h3></div>
		<div><span class="info-text">Migliora la manutenzione di questo elemento</span></div>
	</div>
	<div class="body">
		<div>
			<label class="blue-label">Classi: inserisci le classi separate da uno spazio</label>
			<input type="text" name="classes" rules="no_" value="<?php print echovar('classes') ?>" class="input-maxwidth classes-list" /> 
			<span class="input-info"></span>
			<script>$(".class-modal input[name='classes']").focus();$(".class-modal input[name='classes']").val($(".class-modal input[name='classes']").val());</script>
		</div>
		<div>
			<label class="blue-label">ID: id elemento</label>
			<input type="text" name="id" rules="no_" value="<?php print echovar('id') ?>" class="input-maxwidth classes-list" /> 
			<span class="input-info"></span>
		</div>
	</div>
	<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault add-class">AGGIUNGI</a>
			</div>
		</div>
</div>
<script>
	
(function() {

	/*
	 * Init
	*/
	var act = {
		item: JSON.parse(<?php print(json_encode(echovar('item'))) ?>),
		uid: <?php print echovar("uid") ?>
	}

	/*
	 * AddClick
	*/
	$(".class-modal a.add-class").on("click", function() {

		//Add id
		var id = $(".class-modal input[name='id']").val();
		if(id.replace(/\s/g, "") !== "")
			$("[_uid='"+act.uid+"']").attr("id", id);

		//Get classes
		var cs = $(".class-modal input[name='classes']").val();
		if(cs.split(/\s/g, "") == "") 
			TwigGen.CloseModal();

		var $_el = $("[_uid='"+act.uid+"']");
		var _pclasses = TwigGen.GetPrivateClasses($_el);

		cs = cs.split(" ");
		//Empy classes
		$_el.attr("class", "");
		for(var i in cs) {
			if(cs[i][0] === "_") cs[i][0] = "";
			if(TwigGen.Validator.IsHTML(cs[i])) continue;
				$_el.addClass(cs[i]);
		} 
		
		//Re-add private classes
		TwigGen.AddClasses(_pclasses, $_el);
		TwigGen.CloseModal();
	})

})();

</script>