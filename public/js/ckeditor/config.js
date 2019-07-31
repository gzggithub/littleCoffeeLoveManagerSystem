/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	var sss = "123456789";
	config.height = 180;
	config.filebrowserUploadUrl = '/file/ckeditorUpload?token='+sss;
    // config.filebrowserUploadUrl="file/uploadImage";
	// editorIndicates whether the contents to be edited are being input as a full HTML page.
    // A full page includes the <html>, <head>, and <body> elements. 
    // The final output will also reflect this setting, including the <body> contents only if this setting is disabled.
    config.fullPage= true;

    // set editor html no display auto filter
    config.allowedContent= true;
};
