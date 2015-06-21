<?php
//called in AJAX by POST method to save an xml document.
//if file with same name already exists : die(json_encode(array('message' => 'RENAMEERROR')));
if($_POST['file'] == $_POST['formerFile'] || !(file_exists($_POST['file']))){//no risk to erase another already existing file -> save the file
    $doc = new DOMDocument('1.0');
    $doc->loadXML($_POST['data']);
    $doc->save($_POST['file']);
    if($_POST['file'] != $_POST['formerFile'] && $_POST['formerFile']!=''){//if the user has renamed the file, delete the former File
        unlink($_POST['formerFile']);
    }
    
    //in case this is the file containing the resources, add the ids and re-generate the docs about resources
    if($doc->getElementsByTagName('resourcesStructure')->length > 0){
        //adding ids to new elements
        include 'idAdderRunner.php';
        $x->addIdsToXML($_POST['file'], 'R', '','continue', 'all');
        
        //updating data about the resources
        include 'getDataFromResourceStructure.php';
        $t->generateJSONFromDoc($_POST['file'], '../data/infos/resourcesData.json');
    }
}
else{//the filename already exists, and it is not the currently edited file : abort
        header('HTTP/1.1 200');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode(array('message' => 'RENAMEERROR')));

}
    

?>