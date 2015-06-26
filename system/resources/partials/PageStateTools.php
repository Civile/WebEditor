<div class="portion _pge-tools">
    	<label class="main-label">Pagina</label>
    	<div class="_tools">
    		<div class="_option">
    			<a href="#" class="">
    				<i action="Page.Save" title="Salva questa pagina" class="fa fa-save"></i>
				</a>
    		</div>
    		<div class="_option">
    			<a href="#" class="">
    				<i action="Page.Load" title="Carica una pagina" class="fa fa-upload"></i>
				</a>
    		</div>
    		<div class="_option">
    			<a href="#" class="_remove-captions">
    				<i title="Rimuovi cornici" class="fa fa-toggle-on"></i>
				</a>
    		</div>
            <div class="_option">
                <a href="" target="_blank" class="_preview-link">
                    <i title="Preview" class="fa fa-desktop"></i>
                </a>
            </div>
    	</div>
</div>


<script>

    /*
     * Switch preview mode
    */
    $("a._remove-captions").on("click", function() {
        if($("#_canvas ._caption-chained").length) {
            $("#_canvas *").each(function() {
                $(this).removeClass("_caption-chained");
            });
            TwigGen.PauseAllStates();
            $(this).find("i").removeClass("fa-toggle-on").addClass("fa-toggle-off");
        }
        else {
            $("#_canvas *").each(function() {
                $(this).addClass("_caption-chained");
            });
            TwigGen.ResumeAllStates();
            $(this).find("i").removeClass("fa-toggle-off").addClass("fa-toggle-on");
        }
    });

    /*
     * Preview link
    */
    $("a._preview-link").on("click", function() {
        if($(this).attr("href")) {
            window.open($(this).attr("href"));
        }
    });
</script>