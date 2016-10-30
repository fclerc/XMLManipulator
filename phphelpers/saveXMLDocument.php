<?php
// Called in AJAX by POST method to save an xml document.
// If file with same name already exists die with RENAMEERROR.
if($_POST['file'] == $_POST['formerFile'] || !file_exists($_POST['file'])) {
    // Don't risk to erase or create a file in one upper directory.
    if (strpos($_POST['file'], '..') !== false || strpos($_POST['formerFile'], '..') !== false) {
        die('Disallowed characted in the name.');
    }
    // No risk to erase another already existing file -> save the file
    $doc = new DOMDocument('1.0');
    // Disallow the usage of external entities, in order to avoid XXE vulnerabilities.
    libxml_disable_entity_loader(true);
    $doc->loadXML($_POST['data']);
    $doc->save($_POST['file']);
    if($_POST['file'] != $_POST['formerFile'] && $_POST['formerFile'] != '') {
        // If the user has renamed the file, delete the former File
        unlink($_POST['formerFile']);
    }
}
else {
    //the filename already exists, and it is not the currently edited file : abort
    header('HTTP/1.1 200');
    header('Content-Type: application/json; charset=UTF-8');
    die(json_encode(['message' => 'RENAMEERROR')]);
}
