/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	var sss = document.getElementById("a-test");
	config.height = 500;
	config.filebrowserBrowseUrl = '/kcfinder-3.12/browse.php?type=files';  
	config.filebrowserImageBrowseUrl = 'kcfinder-3.12/browse.php?type=images';  
	config.filebrowserFlashBrowseUrl = 'kcfinder-3.12/browse.php?type=flash';  
	config.filebrowserUploadUrl = 'kcfinder-3.12/upload.php?type=files';  
	config.filebrowserImageUploadUrl = 'kcfinder-3.12/upload.php?type=images&tk='+sss;  
	config.filebrowserFlashUploadUrl = 'kcfinder-3.12/upload.php?type=flash&tk='+sss;
};
