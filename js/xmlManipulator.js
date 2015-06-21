/*
Script used to display in web browser the values contained in an XML file. Modification is possible in mode = "modify"

In mode 'select', "leafValueReading" events will be triggered, containing the id of the xml leaf concerned, and the value it contains.
*/






//mode : 'modify' (to modify the leaves  and attributes values in the file), 'selectWithValues' (used to enable the user to select elements in the tree, and sending events to the reader to enable treatment), 'selectWithoutValues' (same, but leaves values aren't displayed)
//container : the id of the container of the displayed XML, for example : '#MyXMLContainer'. Used as a sort of namespace for data manipulation in case of using several times this function in the same page (see xml[container] or selectors to define events).
//reader : "leafValueReading" events will be triggered when user clicks on elements names, and reader will be your own element (on your web page) that will trigger these events, and then treat them (for example to display the content on which the user clicked).
//scales : json with information about the indicators. WARNING : scalesDisplayers have to be loaded before.
//scaleContainer : the html element you want the scale to be displayed
//filenameContainer : if elements in your page display the name of the file, give their selector in order to have name changed if the user renames his file.
function manipulateXML(filepath, container, mode, reader, scales, scaleContainer, filenameContainer){
    scales = typeof scales !== 'undefined' ? scales : '';
    scaleContainer = typeof scaleContainer !== 'undefined' ? scaleContainer : '';
    filenameContainer = typeof filenameContainer !== 'undefined' ? filenameContainer : '';
    
    
    return $.ajax({
		type: "GET",
		url: filepath,
		success: function(data){//get the xml document
			var xml = [];
			xml[container]=$(data);//load xml tree
			
			
			//going recursively through the xml, and displaying its content in the form of lists (corresponding exactly to the structure of the tree)
			$(container).append($('<div>').addClass('XMLContainer').addClass(filepath.split('.').join("")).append(displayAndChildren($(xml[container]).children().first()[0], mode, scales, scaleContainer) ));
			
			//for elements having children below them : toggle visibility of this elements list when clicking on the element
			$(container +' .reducer').click(function(event){
				var toToggle = $(event.target).next().next();
                if(toToggle[0].nodeName != 'ul' && toToggle[0].nodeName != 'UL'){//in case there is the information icon, go one step further to find the list to hide.
                    toToggle = $(toToggle).next()
                }
                if(toToggle[0].nodeName != 'ul' && toToggle[0].nodeName != 'UL'){//in case there is a value, go one step further to find the list to hide.
                    toToggle = $(toToggle).next()
                }
					$(toToggle).toggle(300);
					
					//just changing the glyphicon
					if($(event.target).hasClass('glyphicon-plus')){
						$(event.target).addClass('glyphicon-minus');
						$(event.target).removeClass('glyphicon-plus');
					}
					else{
						$(event.target).addClass('glyphicon-plus');
						$(event.target).removeClass('glyphicon-minus');
					}
				
				return false;
			});
			
			
			//If element can be modified :
			//-on click : replace it by input containing the value
			//-when enter is pressed on the input : replace input by simple text with the new value, and store the value in the xml tree
			$(container +' .value').click(function(event){
				var elem = event.target;
				var value = $(elem).html();
				
				if(mode == 'modify'){
				//the target can be 2 things : the span (thus check if it doesn't already contain an input), or the input (thus don't try to add a new input into this)
					if($(elem).children('input').length === 0 && $(elem).prop('tagName')!='INPUT'){//we have to add an input
						input=$('<input>').attr("type", "text").attr('value', value);
						if(value == '&nbsp;'){//if the value is just the space we use to always hae span with a min-width : don't display the entity of the space
							$(input).attr('value', '');
						}
						$(elem).html(input);
						$(input).select();
						
						$(input).keyup(function (event) {//event when submiting content of input : replace by plain text and modify xml tree, using id to find the element.
							if (event.keyCode == 13) {
								//replacing input by plain text
								var input = event.target;
								var value = $(input).prop('value');
								var id;
								if($(input).parent().hasClass('attribute')){
									//finding the right element having this attribute
									var data = $(input).parent().parent().attr('id').split('--');
									id = data[0];
									var attribute = data[1];
									var valueToDisplay;
									if(value === ''){//never let a span empty, otherwise it won't be possible to click on it
										valueToDisplay = '&nbsp';
									}
									else valueToDisplay = value;
									$(input).parent().html(valueToDisplay);
									$(xml[container]).find('[id="' + id + '"]').attr(attribute, value);
								}
								
								else{//replace the value of an element
									id = $(input).parent().parent().attr("id");//corresponding id in the xml tree
									
									var valueToDisplay;
									if(value === ''){//never let a span empty, otherwise it won't be possible to click on it
										valueToDisplay = '&nbsp';
									}
									else valueToDisplay = value;
									
									$(input).parent().html(valueToDisplay);
									
									//modifying value in XML tree
									$(xml[container]).find('[id="' + id + '"]').text(value);
								}
							}
						});
					}
				}
				
				return false;
			});                   
            
            //when an element name is clicked on in the html : an event is triggered, giving informations about the element that was clicked on.
            $(container +' .elementName').click(function(event){
				var elem = event.target;
                var id = $(event.target).parent().attr('id');
                var value = $($(event.target).parent().find('.value')[0]).html();
                
                $(reader).trigger("leafValueReading",  [value, id, container]);
            });
            
            
            //in case of modification, enable the user to change the name of the file with an input. Also display button to save the file
			if(mode=='modify'){
                var filename = filepath.replace(/^.*(\\|\/|\:)/, '');//just the name of the file
                var repo = filepath.replace('/'+filename, '');//the name of the dossier where the file is situated
                
                var filenameInputContainer = $('<span>').append(_('Name: ')).addClass('filenameInput');
				var filenameInput = $('<input>').attr('type', 'text').attr('value', filename);//input to enable user to change the name of file
                $(filenameInputContainer).append(filenameInput);
                $(container).prepend(filenameInputContainer);
                $(container).prepend($('<button>').addClass('btn btn-info').attr('id', "XMLSaveButton").append($('<span>').addClass('glyphicon glyphicon-floppy-disk')).append(_("Save modifications")));
			
			
			
                //using ajax to store the xml on the server when clicking on the save button.
                $(container +' #XMLSaveButton').click(function(){
                    var xmlS = (new XMLSerializer()).serializeToString(xml[container][0]);
                    $.post('phphelpers/saveXMLDocument.php', { file: '../'+repo+$(filenameInput).val() , data: xmlS, formerFile: '../'+repo+filename}, 
                        function(data, txt, jqXHR){
                            if(txt=="success"){
                                if(data.message == 'RENAMEERROR'){
                                    alert('File not saved: a file with this name already exists');
                                }
                               else{                            
                                    alert('Your data have been successfully saved');
                                    filename = $(filenameInput).val();//updating the filename, in case the user renames it one more time
                                    $(filenameContainer).text(filename);
                                }
                            }
                        }
                    );
                });
            }
		},
		cache: false
	});
    
    
}        
        
    //this function takes a XML node as argument, and returns an element <li> containing his Name, and:
    //-if it has children: the list of its children
    //-if it has no child: display  its value
function displayAndChildren(xmlNode, mode, scales, scaleContainer){
    //for each node : add it as an item to the list of its parent's elements (except for first element)
    var idText='';
    //uncomment next line to display the id
    //var idText=' (' + $(xmlNode).attr('id') + ') ';
    var nodeName = xmlNode.nodeName;
    var untranslatedNodeName = nodeName;
    if(typeof window._ != "undefined"){//if translation object is set, translate the nodeName
        nodeName = _(nodeName);
    }
    
    var elementNameContainer = $('<span>').append(nodeName + idText).addClass('elementName');
    if(mode != 'modify'){
        $(elementNameContainer).addClass('elementNameClickable');
    }
    
    var result = $('<li>').attr('id', $(xmlNode).attr('id')).append(elementNameContainer);
    
    if(scales !== ''){//if we want to display the scales (eg scales were passed in argument).
        var popoverTitleInfo = 'Click for more information'
        if(typeof window._ != "undefined"){//if translation object is set, translate the nodeName
            popoverTitleInfo = _(popoverTitleInfo);
        }
        //when hovering the information glyphicon, display the sccalesContainer div with the relevant information
        var commentPopover = $('<span>').addClass('glyphicon glyphicon-info-sign commentPopover').attr('title', popoverTitleInfo);
        $(commentPopover).hover(function(){
            $(scaleContainer).empty();
            displayIndicatorScale(untranslatedNodeName, scaleContainer, $(xmlNode).attr('id'), scales, false);
            $(scaleContainer).show();
        },
        function(){
            $(scaleContainer).hide();
        });
        if(scales[untranslatedNodeName]){
            if(scales[untranslatedNodeName].documentation){
                $(commentPopover).click(function(){
                    alert(scales[untranslatedNodeName].documentation);
                });
            }
            $(result).append(commentPopover);
        }
    }
    
    
    //if the node has children : display the list of these children.
    //reducer class enables to toggle visibility of children (particular case is: node has an attribute, this attribute is 'fixed', which is not displayed
    //other classes are used for style
    if($(xmlNode).children().length>0 || (xmlNode.attributes.length > 1 && !(xmlNode.attributes.length == 2 && ($(xmlNode).attr('fixed') ==='true')))){
    
        $(result).addClass('hasChild');
        $(result).prepend($('<span>').addClass('glyphicon glyphicon-minus').addClass('reducer'));
        
        if($(xmlNode).children().length === 0){//if it has attributes, but no child : its text value has to be displayed
            if(mode != 'selectWithoutValues'){ //TODO  : REFACT, same operation made 3 times in this code
                var nodeValue = $(xmlNode).html()
                if(nodeValue === ''){
					nodeValue = '&nbsp;';
				}
                var valueContainer = $('<span>').append(nodeValue);
                if(mode == 'modify'){
                    //check if it has no attribute fixed set to true
                    if($(xmlNode).attr('fixed') != 'true'){
                        $(valueContainer).addClass("value");
                    }
                }
                result.append(': ').append(valueContainer);
            }
        }
        
        //variable containing the texts returned by the call of the function on the children (in a html list)
        var chs = $('<ul>');
        
        $.each(xmlNode.attributes, function(i, attrib){//going through the attibutes to display it
            var attributesToIgnore = ["id", "xmlns:xsi", "xsi:noNamespaceSchemaLocation", "fixed", "attrfixed"];
            if(attributesToIgnore.indexOf(attrib.name) == -1){
                
                var idText='';//uncomment next line to display the id
                //var idText=' (' + $(xmlNode).attr('id') +'--'+ attrib.name + '): ';
                var attribName = attrib.name;
                if(typeof window._ != "undefined"){//if translation object is set, translate the nodeName
                    attribName = _(attribName);
                }
				var attributeValue = attrib.value;
				if(attributeValue === ''){
					attributeValue = '&nbsp;';
				}
				//display the element name (or more precisely the attribute name ... but for the user everything will be like an element)
                var elementNameContainer = $('<span>').addClass('elementName').text(attribName + idText)
                if(mode != 'modify'){
                    $(elementNameContainer).addClass('elementNameClickable');
                }
                var txt = $('<li>').attr('id', $(xmlNode).attr('id') +'--'+ attrib.name ).append(elementNameContainer).append(': ');
                
                //if the value also has to be displayed
                if(mode != 'selectWithoutValues'){
                    var valueContainer = $('<span>').append(attrib.value).addClass('attribute')
                    if(mode == 'modify'){
                        if($(xmlNode).attr('attrfixed') != 'true'){
                        //if attribute is not fixed : add 'value' class, which will then enable to then the value
                            $(valueContainer).addClass("value");
                        }
                    }
                
                    $(txt).append(valueContainer);
                }
                
                
                
                $(chs).append(txt);
            }
        });
        
        $(xmlNode).children().each(function(){
            $(chs).append(displayAndChildren(this, mode, scales, scaleContainer));
        });
        
        result.append(chs);
    
    }
    
    else if(mode != 'selectWithoutValues'){
    //if no child: display the node value, with class indicating you can modify it (if mode = modify)
		
		var valueContainer = $('<span>');
		if($(xmlNode).html() === ''){
			$(valueContainer).append('&nbsp;');
		}
		else{
			$(valueContainer).append($(xmlNode).html());
		}
		//if modification mode and attribute is not fixed : add the class that will then enable to change the value.
		if(mode == 'modify'){
            if($(xmlNode).attr('fixed') != 'true'){
                $(valueContainer).addClass("value");
            }
		}
        result.append(': ').append(valueContainer);
        
    }
    return result;
}