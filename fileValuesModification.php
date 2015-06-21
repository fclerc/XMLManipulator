<!DOCTYPE HTML>
<!-- This file uses XMLManipulator in order to enable the user to change the values of the XML file he is using. Name and path of the file are sent by a POST form  -->
<html>
    <head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
        <link href="css/bootstrap.css" type="text/css" rel="stylesheet"/>
        <link href="css/XMLManipulator.css" type="text/css" rel="stylesheet"/>
    </head>
    
    <body>

		<div class="container">
			<h1>XMLManipulator Demo Page</h1>
			<p>This page is a demo of the XMLManipulator tool you can use to edit your XML files directly in your web browser. <a href = "https://github.com/fclerc/XMLManipulator">Code available on my Github</a></p>

			<div id="XMLcontainer"></div>
        </div>
        
        <div id='scalesContainer'></div>
        <script type="text/javascript" src="js/jquery-2.1.1.js"></script>
        <script type="text/javascript" src="js/bootstrap.js"></script>
        <script type="text/javascript" src="js/scaleDisplayers.js"></script>
        <script type="text/javascript" src="js/XMLManipulator.js"></script>
        <script type="text/javascript" src="translation/translate.js"></script>
        <script type="text/javascript" src="translation/icu.js"></script>
        <script type="text/javascript">
        $(function(){    
            
                    //getting the file and corresponding scales, and calling the function to display XML
                    var file = "data/sample.xml"
                    manipulateXML(file,'#XMLcontainer', 'modify','', scales , '#scalesContainer', "#currentFileName");   
                }
            });
        });
        </script>
    </body>
    
</html>