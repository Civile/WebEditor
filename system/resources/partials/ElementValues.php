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

<div id="modal-cont" class="values-modal">
	<div class="header">
		<div><h3>VALORI ELEMENTO: <?php print $obj->alias ?>, tag: <?php print $obj->tag ?>, chain-id: <?php print echovar("chainid") ?></h3></div>
		<div><span class="info-text">Valorizza l'elemento e aggiungi nuovi attributi</span></div>
	</div>
	<div class="body">
		<div>
			<label class="blue-label">Valori: valorizza i seguenti attributi dell'elemento <?php print $obj->alias ?></label>
			<div class="vals-container">
				<form id="attributes">
					<table id="atts"  style="width:100%;">
						<thead>
							<tr>
								<th style="width:170px;">Attributo</th><th>Valore</th><th style="width:200px;"></th>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
				</form>
			</div>
			<span class="input-info"></span>
		</div>
		<div>
			<label class="blue-label">Aggiungi un attributo</label>
			<div class="vals-container">
				<form id="new-attributes">
					<table id="new-atts"  style="width:100%;">
						<thead>
							<tr>
								<th style="width:170px;">Nuovo attributo*</th><th>Valore*</th><th style="width:200px;"></th>
							</tr>
						</thead>
						<tbody>
						<tr><td><input type="text" name="new-att-name" rules="no_|no-spaces"></td><td><input type="text" rules="no_" name="new-att-value"></td><td><a href="javascript:void(0)" class="modal-button add-attribute">AGGIUNGI</a></td></tr>
						</tbody>
					</table>
				</form>
			</div>
			<span class="input-info"></span>
		</div>
	</div>
	<div class="clear"></div>
		<div class="footer">
			<div class="buttons">
				<span class="text-er"></span>
				<a href="#" class="nodefault close-modal" action="CloseModal:Main.UpdateGraphicInterface">ANNULLA</a>
				<a href="#" class="nodefault add-atts">AGGIUNGI</a>
			</div>
		</div>
</div>
<script>

	/*
	 * GetAttributes
	*/
	var p = TwigGen.GetPublicAttributes($("[_chain-id='<?php print echovar("chainid") ?>']"), "<?php print $obj->alias ?>");
	if(!TwigGen.ObjLength(p)) {
		$("table#atts tbody").append('<tr class="no-atts"><td colspan="3" style="  font-size: 18px;line-height: 100%;">Non ci sono attributi per questo elemento</td></tr>');
		$("table#atts thead").hide();
	} else {
		$("table#atts thead").show();
		for(var i in p) {
			AddAttRow(p[i].alias, i, p[i].val);
		}
	}

	/*
	 * AddAttribute
	*/
	$("a.add-attribute").on("click", function(e) {
		e.stopPropagation(); e.preventDefault();
		var at = $("input[name='new-att-name']").val();
		var va = $("input[name='new-att-value']").val();
		if(at.replace(/\s/g, '') === '' || va.replace(/\s/g, '') === '')
			return;
		if( $(".no-atts").length) 
			$(".no-atts").remove();
		$("table#atts thead").show();
		AddAttRow(at.replace(/\s/g, '-'), at.replace(/\s/g, '-'), va);
		$("form#new-attributes")[0].reset();
	});


	/*
	 * DelAttribute
	*/
	$(document).on("click", ".values-modal table#atts a._remove-att > i", function(e) {
		e.preventDefault();
		$(this).closest("tr").remove();
		if($("#atts").find("tr").length <= 1) {
			$("table#atts tbody").append('<tr class="no-atts"><td colspan="3">Non ci sono attributi per questo elemento</td></tr>');
			$("table#atts thead").hide();
		}
	});


	/*
	 * Save
	*/
	$(".values-modal .add-atts").on("click", function() {
		$("form#attributes").find("input[type='text']").each(function() {
			$("[_chain-id='<?php print echovar("chainid") ?>']").attr($(this).attr("name"), $(this).val());
		});
		TwigGen.CloseModal();
	});

	/*
	 * AddRow
	*/
	function AddAttRow(a, n, v) {
		$("table#atts tbody").append('<tr>\
		<td>'+a+'</td>\
		<td><input type="text" name="'+n+'" value="'+v+'"/></td>\
		<td style="font-size:11px;"><a href="#" class="_remove-att"><i class="fa fa-remove"></i></a></td>\
		</tr>');
	}

	/*
	 * Select resource
	*/
	$(".values-modal input[name='src']").on("click", function() {
		
	});
	/*
		this.App.Cache.SetData("ExplorerCallback", function(file) {
		   	if(this.App.GetState("Page").FileAllowed(file)) {
		   		this.App.LoadProject.call(this.App.GetState("Page"), file.replace("../", '/'), null);
   			} else alert("Loader: file " + file + "not allowed");
		}).SetData("ExplorerContext", this);
		
		//Open file explorer
		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "Explorer.php", null);
	*/

</script>