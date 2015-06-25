<?php

include_once("htmLawed.php");
include_once("simple_html_dom.php");


/*
 * AddItem
*/
$cmd = null;
$app = null;
if(isset($_POST["cmd"])) {
	$cmd = $_POST["cmd"];
	$app = new App;
	if(method_exists ( $app, $cmd )) {
		if(is_callable(array($app, $cmd))) { 
			echo $app->$cmd();
		} else {
    		echo json_encode(["error" => "Uncallable method: ".$cmd]);
		}
	} else {
		echo json_encode(["error" => "Inexistent method: ".$cmd]);
	}
	exit();
}


/*
 * App
*/
class App {



	/*
	 * Constructor
	*/
	public function __construct() {

	}

	/*
	 * GetVar
	*/
	private function getVar($n) {
		if(!isset($_GET[$n]) && !isset($_POST[$n]))
			return null;
		else {
			return (isset($_GET[$n]) ? $_GET[$n] : $_POST[$n]);
		}
	}


	/*
	 * SaveItemsList
	*/
	public function saveItemsList() {

		try {

			$list = $this->beautifyJSON($this->getVar("items"));
			if(!$list) {
				return json_encode(["error" => "Undefined items list"]);
			} else {
				if (get_magic_quotes_gpc())
					$list = stripcslashes($list);

				//Files
				$_tmpfile = "../system/resources/tmp.json";
				$_final   = "../system/resources/items.json";

				if(file_put_contents($_tmpfile, $list)) {
					chmod($_tmpfile, 0777);
					if(copy($_tmpfile, $_final)) { // o rename?
						unlink($_tmpfile);
						return json_encode(["message" => "Items list correctly updated"]);
					} else {
						return json_encode(["error" => "ER.2: Operation failed"]); 
					}
				} else {
					return json_encode(["error" => "ER.1: Operation failed"]); 
				}
			}
		} catch(Exception $e) {
			return json_encode(["error" => $e->getMessage]); 
		}
	 	exit();
	}	

	/*
	 * ProjectExists
	*/
	public function projectExists($name) {
		return 1;
	}


	/*
	 * LoadLayout
	 * Return css and html
	*/
	public function loadLayout() {
		
		$pname = $this->getVar("project");
		$page  = $this->getVar("page");

		if(!$this->projectExists($pname)) {
			return json_encode(["error" => "Unrecognized project ".$pname]);
		} else {
			
			$data = array();

			//Get html content
			$html = file_get_contents("projects/".$pname."/".$page);
			if($html) 
				$data["html"] = $html;

			try {
				
				$parser = file_get_html("projects/".$pname."/".$page);

				//Get stylesheets
				$data["css"] = array();
				foreach($parser->find('link') as $element) {
					if($element->rel == "stylesheet") {
						$data["css"][] = $element->href;
					}
				}

				//Get scripts
				$data["scripts"] = array();
				foreach($parser->find('script') as $element) {
					if($element->type == "text/javascript") {
						$data["scripts"][] = $element->src;
					}
				}

				//Get body
				$data["body"] = $parser->find('body')[0]->innertext;
				if(!$data["body"]) {
					return json_encode(["error" => "No body: corrupt file"]);
				}

				//Get head
				$data["head"] = $parser->find('head')[0]->innertext;
				
			}
			catch(Exception $e) {
				return json_encode(["error" => $e->getMessage()]);
				exit();
			}


			return json_encode($data);
		}

		exit();
	}


	/*
	 * SaveLayout
	*/
	public function saveLayout() {
		$tree = $this->getVar("tree");
		if(!$tree) {
			return json_encode(["error" => "No tree"]);
		} else {

			$name = $this->getVar("name");
			if(!$name) {
				return json_encode(["error" => "Undefined name"]);
			} else { //Save

				$where = ($this->getVar("where") ? $this->getVar("where") : "projects/");

				try {
					//Init project path
					$path = $this->_initProjectDir($name, $where);
					//Get HTML
					$head = $this->getVar("head");
					$meta = $this->getVar("meta");
					$html = $tree; 
					//TODO
					$data = array(
						"meta" => $meta,
						"css" => 1
					);

					$out = $this->composeHead($name, $data)."<body>".htmLawed($html, array('tidy'=>50))."</body>";

					//...save it
					$_tmpfile = $path."/index.html";
					if(file_put_contents($_tmpfile, $out)) { 
						chmod($_tmpfile, 0777);
						return json_encode(["message" => "Saved successfully"]);
					} else {
						return json_encode(["error" => "Can't save the content"]);
					}

				} 
				catch(Exception $e) {
					return json_encode(["error" => $e->getMessage()]);
				}
			}
		}
		exit();
	}


	

	/*
	 * InitProjectDir
	*/
	private function _initProjectDir($prname, $path) {
		
		//Projects dir
		if(!file_exists($path)) {
			$mask=umask(0);
			mkdir($path, 0777);
			umask($mask);
		}

		//This project dir
		if(!file_exists($path.$prname)) {
			$mask=umask(0);
			mkdir($path.$prname, 0777);
			umask($mask);
		}

		//Assets dir
		if(!file_exists($path.$prname."/assets")) {
			$mask=umask(0);
			mkdir($path.$prname."/assets", 0777);
			umask($mask);
		}

		//Assets - js - css dir
		if(!file_exists($path.$prname."/assets/css")) {
			$mask=umask(0);
			mkdir($path.$prname."/assets/css", 0777);
			umask($mask);
		}
		if(!file_exists($path.$prname."/assets/js")) {
			$mask=umask(0);
			mkdir($path.$prname."/assets/js", 0777);
			umask($mask);
		}

		//$root = (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/';
		if(copy("_shared-resources/bootstrap.min.css", $path.$prname."/assets/css/bootstrap.min.css"))
			chmod( $path.$prname."/assets/css/bootstrap.min.css", 0777);
		if(copy("_shared-resources/bootstrap.min.js", $path.$prname."/assets/js/bootstrap.min.js"))
			chmod($path.$prname."/assets/js/bootstrap.min.js", 0777);

		return $path.$prname;
	}


	/*
	 * GetStandardHeadLinks
	*/
	private function getStandardHeadLinks() {
		return array(
			'<link sys rel="stylesheet" href="assets/css/bootstrap.min.css">',
			'<script sys type="text/javascript" src="assets/js/bootstrap.min.js"></script>'
		);
	}


	/*
	 * ComposeHead
	*/
	private function composeHead($prname, $data) {
		$head = '<head><title>'.$prname.'</title>';
		
		$headl = $this->getStandardHeadLinks();
		foreach($headl as $link) 
			$head .= $link;

	 	if(isset($data["css"])) {
	 		$head .= '<link related rel="stylesheet" href="assets/css/'.$prname.'.css">';
	 	}

		$head .= '</head>';
		return $head;
	}



	/*
	 * BeautifyJSON
	*/
	private function beautifyJSON($json) {
		$result = '';
	    $level = 0;
	    $in_quotes = false;
	    $in_escape = false;
	    $ends_line_level = NULL;
	    $json_length = strlen( $json );

	    for( $i = 0; $i < $json_length; $i++ ) {
	        $char = $json[$i];
	        $new_line_level = NULL;
	        $post = "";
	        if( $ends_line_level !== NULL ) {
	            $new_line_level = $ends_line_level;
	            $ends_line_level = NULL;
	        }
	        if ( $in_escape ) {
	            $in_escape = false;
	        } else if( $char === '"' ) {
	            $in_quotes = !$in_quotes;
	        } else if( ! $in_quotes ) {
	            switch( $char ) {
	                case '}': case ']':
	                    $level--;
	                    $ends_line_level = NULL;
	                    $new_line_level = $level;
	                    break;

	                case '{': case '[':
	                    $level++;
	                case ',':
	                    $ends_line_level = $level;
	                    break;

	                case ':':
	                    $post = " ";
	                    break;

	                case " ": case "\t": case "\n": case "\r":
	                    $char = "";
	                    $ends_line_level = $new_line_level;
	                    $new_line_level = NULL;
	                    break;
	            }
	        } else if ( $char === '\\' ) {
	            $in_escape = true;
	        }
	        if( $new_line_level !== NULL ) {
	            $result .= "\n".str_repeat( "\t", $new_line_level );
	        }
	        $result .= $char.$post;
	    }
	    return $result;
	}





}

?>