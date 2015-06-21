<?php

    /*
        Class to add ids to all tags in xml document.
        
        
        Example of use :
        
        
        include 'XMLIdAdder.class.php';
        $x = new XMLIdAdder();
        $x->addIdsToXML('file.xml', 'youPrefix', 'yourSuffix','continue' 'all', 0);
        
        It will generate id attributes to all tags : youPrefixNByourSuffix, with NB an incremented number.
        Use 'leaves' as targets argument if you only want to add ids to the leaves (tags having no child).
        
        
    
    */




    class XMLIdAdder{
    
        private $id = 0; //the id will be iterated over all tags
        private $prefix='id';
        private $suffix='';
        private $targets='all';
        private $mode = 'continue';
        
        /* Ids will be of the form : 'prefixNBsuffix' where NB is a number
        mode : 'continue' : highest number used in the file as id with prefix and suffix is fetched, and new ids are added with numbers higher than this highest id.
        'restart' : remove all ids, and add new ones.
        targets : if 'all' : add ids to all tags; if 'leaves' only add ids to leaves. Default is 'all'.
        firstNumber is the first numeric value to use for the ids.
        
        */
        public function addIdsToXML($filename, $prefix = 'id', $suffix='' ,$mode = 'continue',  $targets = 'all', $firstNumber=0){
            //$doc  = new DOMDocument();
            //$doc->load($filename);
            
            $this->prefix=$prefix;
            $this->suffix=$suffix;
            $this->targets=$targets;
            $this->id=$firstNumber;
            $this->mode = $mode;
            $root = new SimpleXMLElement($filename, NULL, TRUE);
            
            if($mode=='continue'){//search for the highest id and set current id to this value
                $maxId = $this->searchHighestId($root);
                $this->id = $maxId + 1;
            }
            
            $this->addIdToElemAndChildren($root);
            
            $root->saveXML($filename);
            
        }   
            /*
            If tag doesn't already have one : add id.
            Then go recursively through the children.
            */
        private function addIdToElemAndChildren($elem){
            //If mode is restart, first remove the id.
            if($this->mode == 'restart'){
                unset($elem['id']);
            }
            //add an id if all tags must have one, or this element is a leaf; and doesn't already have an id. 
            if(($this->targets=='all' || $elem->count() == 0) && !isset($elem['id'])){
                $elem->addAttribute('id', ''.$this->prefix.$this->id.$this->suffix);
                $this->id++;
            }
            foreach($elem->children() as $child){
                $this->addIdToElemAndChildren($child);
            }
        
        }
        //this function finds the highest number used in ids with the given prefix and suffix
        private function searchHighestId($elem){
            $maxId = 0;
            if(isset($elem['id'])){//element has an id : search for the number, eg remove suffix and prefix
                $id = $elem['id'];
                $id = str_replace(array($this->suffix, $this->prefix), '', $id);
                $id = intval($id);
                $maxId = $id;
            }
            foreach($elem->children() as $child){
                $m = $this->searchHighestId($child);
                if($m > $maxId){
                    $maxId = $m;
                }
            }
            return $maxId;
        }
    
    }
    
?>