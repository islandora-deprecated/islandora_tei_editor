// Top of file

function TEIEditor()
{   
    // Define Elements Id's
    var editorId = "tei-editor"; 
    var contentId = "tei-content";
    var tbarId = "tei-toolbar";
    var tbarMenuId = "tei-toolbar-menu";
    var srcIconId = "button-tei-source-view";
    var insrtIconId = "button-tei-insert";
    var remIconId = "button-tei-remove";
    var editIconId = "button-tei-edit";
    var savIconId = "button-tei-save";
    var contextId = "tei-context-menu";
    var modalMsgId = "tei-modal-msg";
    var modalFormId = "tei-modal-form";
    var toolTipId = "tei-tool-tip";

    // Initialize data associated with the TEI standard. Storing a list of TEI defined Elements, and Attribute Class as array's of strings.
    var tei = new TEI(); TEI = undefined; // Removes TEI from the global namespace.
    var elements = (function() { var a = new Array; for(var i in tei.element) a.push(i); return a; })().toString();
    var attrClasses = (function() { var a = new Array; for(var i in tei.att) a.push(i); return a; })();

    //--------------------------------------------------------------------------
    // Create Static elements, contentId is not static as it changes from a 
    // <div> to <textarea>, and thus needs to be re-assigned when changed.
    //--------------------------------------------------------------------------
    
    // Editor
    var editorQuery = $('#'+editorId); // Assumption is that this exists in the html and does not need to be created.

    // ToolBar, contains buttons for viewing src, inserting, removing, editing, and saving
    var tbarQuery = $('<div id="'+tbarId+'"/>').prependTo(editorQuery);

    // Create Content Area    
    var contentQuery = $('#'+contentId)//$('<span id="'+contentId+'" contentEditable="true"/>').appendTo(editorQuery);

    // Widget 
    var buildWidget = function(id, title, selectable)
    {
	return $('<div id="'+id+'"class="ui-widget ui-widget-content ui-corner-all '+((selectable)? 'ui-selectable':'')+'">'
		 +'<div class="ui-widget-header">'+((title)? title : '')+'<br/></div></div>');	
    };
    
    //
    var hideToolBarMenu = function()
    {
	if(tbarMenuQuery.is(':visible'))
	    tbarMenuQuery.hide();
    }

    // Create Toolbar Menu, used for listing and selecting insert, remove, or edit actions.
    var tbarMenuQuery = buildWidget(tbarMenuId, "", true).hide().appendTo(tbarQuery).data('hide', hideToolBarMenu);

    // Create Tool Tip.
    var tipQuery = buildWidget(toolTipId).append('<dl/>').hide().appendTo('#'+editorId);

    // Hide rightclick menu.
    var hideContextMenu = function()
    {
	if(contextQuery.is(':visible'))
	    contextQuery.hide();
    };

    // Create Right Click Context Menu
    var contextQuery = buildWidget(contextId, "", true).hide().appendTo('#'+editorId);

    // Create placeholders for Submenu's
    var insrtSubMenuQuery = $('<div/>').data('click', function(tag, selection) { selection.surroundContents($('<'+tag+'/>').get(0));});
    var remSubMenuQuery = $('<div/>').data('click', function(node) { $(node).replaceWith($(node).html()); });
    var editSubMenuQuery = $('<div/>').data('click', function(node) { showModalAttForm(node); });

    //--------------------------------------------------------------------------
    // Convenience functions, used to simplify the code by perform a abstract
    // action.
    //--------------------------------------------------------------------------
    
    // Add functions for changing ui-states, in widget elements, may cause conflict with another plugin, look into later...
    /*jQuery.fn.extend({
	activate:   function() { this.each(function() { $(this).removeClass('ui-state-default').addClass('ui-state-active'); })},
	deactivate: function() { this.each(function() { $(this).removeClass('ui-state-active').addClass('ui-state-default'); })},
	isActive:   function() { var active = false; this.each(function() { if($(this).hasClass('ui-state-active')) active = true;}); return active;},
	enable:     function() { this.each(function() { $(this).removeClass('ui-state-disable').addClass('ui-state-default'); })},
	disable:    function() { this.each(function() { $(this).removeClass('ui-state-active, ui-state-default').addClass('ui-state-disable'); })},
	isEnabled:  function() { var enabled = false; this.each(function() { if(!$(this).hasClass('ui-state-disable')) enabled = true; }); return enabled; }, 
	select:     function() { this.each(function() { $(this).addClass('ui-selected'); })},
	unselect:   function() { this.each(function() { $(this).removeClass('ui-selected'); })},
	isSelected: function() { var selected = false; this.each(function() { if($(this).hasClass('ui-selected')) selected = true;}); return selected;}
    });*/
    // Gets the target of the event
    var getEventTarget = function(event)
    {
	var targ;
	if (!event)
	    var event=window.event;
	if (event.target)
	    targ=event.target;
	else if (event.srcElement)
	    targ=event.srcElement;
	if (targ.nodeType==3) // defeat Safari bug
	    targ=targ.parentNode;
	return targ;
    };    
    // True if text is selected within the content area.
    var isTextSelected = function()
    {
	var selection;
	if (window.getSelection) {
	    selection = window.getSelection();
	}
	else if (document.selection) { // should come last; Opera!
	    selection = document.selection.createRange();
	}
	// Text Selection is only for inserting so far and we can only insert if we are not bridgeing tags, ex. in quotes <a> adsf"asd</a><b>as"df</b> 
	var selected = (selection.anchorNode == selection.focusNode && selection.anchorOffset != selection.focusOffset);
	var inContentArea = $(selection.anchorNode).add(selection.focusNode).parents().andSelf().is('#'+contentId);
	return (selected && inContentArea) ? true : false;
    }
    // Adds a selection to a selectable widget
    var addSelection = function(name, icon, to)
    {
	return $('<div class="ui-selectee">'
		 +'<span class="ui-icon '+icon+'" style="margin: 3.5px 3px 0px 1px; float: left;"/>'
		 +'<span style="float: left;">'+name+'</span>'			     
		 +'<br/></div>').appendTo(((typeof to == 'string')? '#'+to : to)).hover(function() { $(this).select(); }, function() { $(this).unselect(); });
    };
    //
    var showModalMsgBox = function(title, html, buttons)
    {
	var msgQuery = $('#'+modalMsgId);
	msgQuery = (msgQuery.length)? msgQuery : $('<div/>').attr('id', modalMsgId).appendTo('body').dialog(
	    {
		autoOpen: false,
		bgiframe: true,
		modal: true,
		closeOnEscape: true,
		draggable: false,
		resizeable: false,		
		hide: 'scale',
		show: 'scale',
		position: 'center'
	    });;
	msgQuery.dialog('option', 'buttons', buttons);
	msgQuery.attr('title', title);
	msgQuery.html(html);
	msgQuery.dialog('open');
    }
    // Populate Attributes
    var showModalAttForm = function(node)
    {	
	// Modal form dialog used to Edit TEI Elements attributes.
	var modalFormQuery = $('#'+modalFormId);
	modalFormQuery = (modalFormQuery.length)? modalFormQuery : $('<div id="'+modalFormId+'"/>').appendTo('#viewer').dialog({
	    title: 'Edit Attributes',
	    autoOpen: false,
	    bgiframe: true,
	    modal: true,
	    closeOnEscape: true,	
	    draggable: false,
	    resizable: false,		
	    width: '75%',
	    height: '600',
	    hide: 'scale'
	});
	// List of Attributes associtated with the selected tei element.
	var list = tei.element[node.nodeName.toLowerCase()].attributes;
	// Add an input for the given attribute
	var addAtt = function(att, parent)
	{
	    $('<span class="tei-att"><label for="'+att.name+'"><abbr title="'+att.doc+'">'+att.name+':</abbr></label><input type="text" name="'+att.name+'"/></span>').appendTo(parent); // Plain Attribute, associated with this class.
	};
	// Add an accordion header for the attribute class...
	var addAttClass = function(attClass, parent)
	{
	    var content = $('<div>').appendTo($('<li><h3><a href="#'+attClass.name+'"><abbr title="'+attClass.doc+'">'+attClass.name+'</abbr></a></h3></li>').appendTo(parent));
	    var att = attClass.attributes;
	    var accord = undefined
	    for(var i in att)
	    {
		if(att[i].attributes) // Another Attribute Class		    
		{
		    accord = (accord)? accord : $('<ul/>').appendTo(content);   // <ul> tags are made to be Accordions.
		    addAttClass(att[i], accord);
		}
		else 		    
		    addAtt(att[i], content);
	    }
	};
	// Clear Previous Attributes
	modalFormQuery.empty();
	var accord = undefined;
	// Build form
	for(var i in list)
	{	    	    
	    if(list[i].attributes) // Attribute Class
	    {
		accord = (accord)? accord : $('<ul/>').appendTo(modalFormQuery);
		addAttClass(list[i], accord); // Attribute Classes of the Same depth use the same Accordion.
	    }
	    else 
		addAtt(list[i], modalFormQuery);		
	}
	// Fill in attributes that already exist
	for(var i=0; i< node.attributes.length; i++)
	{
	    var att = node.attributes.item(i);
	    modalFormQuery.find('input[name='+att.nodeName+']').val(att.nodeValue);
	}
	// Initialize and Display
	modalFormQuery.find('ul').accordion({collapsible: true, clearStyle: true});
	modalFormQuery.find('ul').accordion('activate', false);
	modalFormQuery.dialog('option', 'buttons', { 
	    submit: function() { modalFormQuery.find('input').each(function() { var input = $(this); var val = $(this).val(); if(val != '') node.setAttribute(input.attr('name'), val)}); $(this).dialog('close'); },
	    cancel: function() { $(this).dialog('close'); }
	});
	modalFormQuery.dialog('open');
    };
    // Shows a tool tip
    var showToolTip = function(domNode, x, y)
    {
	// Only show tool tips for TEI elements, or if we are focusing on the tooltip.
	if(!$(domNode).filter(elements).length || domNode.id==toolTipId)
	    return;	
	// Change Header, remove previous contents.
	var attListQuery = tipQuery.children('.ui-widget-header').text(domNode.tagName).end().find('dl').empty();
	var attributes = domNode.attributes;
	// Build list of Attributes	    
	for(var i=0; i<attributes.length; i++)	   
	{
	    var att = attributes.item(i);
	    attListQuery.append('<dt>'+att.nodeName.toLowerCase()+':</dt><dd>'+att.nodeValue+'</dd>');
	}
	// Position and Show
	tipQuery.css({'top': y.toString()+'px','left': x.toString()+'px'}).show();
    };
    // Hide tool tip
    var hideToolTip = function()
    {	
	if(tipQuery.is(':visible'))	
	    tipQuery.hide();
    };                
    // Show right click menu.
    var showContextMenu = function(event)
    {
	contextQuery.children('.ui-selectee').remove();
	var subMenuQuerys = insrtSubMenuQuery.add(remSubMenuQuery).add(editSubMenuQuery);
	var options = ['Insert', 'Remove', 'Edit'];
	var i = 0;
	var show = false;
	subMenuQuerys.each(function() {
	    var query = $(this);
	    if(query.children().length) // Options
	    {
		show = true;
		// Create option and SubMenu.
		var subMenu = $('<div class="ui-widget ui-widget-content ui-corner-all ui-selectable tei-context-sub-menu"/>').append(query.children().clone(true)).hide().data('hide', hideContextMenu);
		var option = addSelection(options[i], '', contextQuery).append(subMenu);
		option.mouseover(function(){
		    var subMenu = $(this).children('.tei-context-sub-menu');
		    if(!subMenu.is(':visible'))
		    {
			var pos = subMenu.parent().position();
			subMenu.css({ top: pos.top, left: pos.left + subMenu.parent().width()}).show(); 
		    }
		});
		option.mouseout(function(){
		    var subMenu = $(this).children('.tei-context-sub-menu');
		    if(subMenu.is(':visible') && !subMenu.children().isSelected() ) 
			subMenu.hide();
		}); 
	    }
	    i++;
	});
	if(show)
	    contextQuery.css({top: event.clientY.toString()+'px', left: event.clientX.toString()+'px'}).show();
    };             
    //
    var toggleSrc = function(event)
    {
	if(contentQuery.is('span'))
	{
	    var width = editorQuery.width()-3; // textarea default left border is 3
	    var height = contentQuery.height()-3;
	    contentQuery.replaceWith('<textarea id="'+contentId+'" style="width: '+width+'px; height: '+height+'px">'+contentQuery.html()+'</textarea>');
	    tbarQuery.children('button').not('#'+srcIconId).toggleClass('ui-state-disable', true).toggleClass('ui-state-default', false);
	    //$(this).disable();
	}
	else
	{
	    var width = editorQuery.width(); // textarea default left border is 3
	    var height = editorQuery.height()-tbarQuery.outerHeight();
	    var value = contentQuery.replaceWith('<span contentEditable="true" id="'+contentId+'" style="width: '+width+'px; height: '+height+'px"/>').val();
	    $('#'+contentId).append(value);
	    tbarQuery.children('button').not('#'+srcIconId).toggleClass('ui-state-disable', false).toggleClass('ui-state-default', true);
	    //arQuery.children('button').not('#'+srcIconId).enable();
	    $(this).deactivate();
	}
	contentQuery = $('#'+contentId);
    };
    //
    var showToolbarMenu = function(p_sMenu)
    {
	return function()
	{
	    var button = $(this);
	    tbarMenuQuery.css(button.position().top + $(this).height());
	    tbarMenuQuery.children().remove('div.ui-selectee'); // Remove Old Options		
	    tbarMenuQuery.find('.ui-widget-header').text(p_sMenu);
	    tbarMenuQuery.append(insrtSubMenuQuery.children().clone(true));
	    tbarMenuQuery.show();
	};
    };
    //
    var createButton = function(p_sId, p_sTitle, p_sIcon, p_fOnClick, p_Parent)
    {
	var button = $('<button id="'+p_sId+'" title="'+p_sTitle+'" class="ui-state-default ui-corner-all"><span class="ui-icon '+p_sIcon+'"/></button>');
	if(p_Parent) button.appendTo(p_Parent);	
	return button.click(function(event)
		     {
			 if(!this.disabled) p_fOnClick(event);
		     });	
    };
    // Create Buttons
    createButton(srcIconId, "View Page Source", 'ui-icon-newwin', toggleSrc, tbarQuery);
    createButton(insrtIconId, "Insert Element", 'ui-icon-plus', showToolbarMenu('Insert'), tbarQuery).attr('disabled', 'disabled'); // Editing buttons should start disabled.
    createButton(remIconId, "Remove Element", 'ui-icon-close', showToolbarMenu('Remove'), tbarQuery).attr('disabled', 'disabled');  // Editing buttons should start disabled.
    createButton(editIconId, "Edit Element Attributes", 'ui-icon-pencil', showToolbarMenu('Edit'), tbarQuery).attr('disabled', 'disabled');  // Editing buttons should start disabled.
    createButton(savIconId, "Save Changes", 'ui-icon-folder-open', function() { TEIEditor.Save(); }, tbarQuery).attr('disabled', 'disabled');  // Saving should be disabled until some content was edited.
    
    //--------------------------------------------------------------------------
    // Deal with Events
    //--------------------------------------------------------------------------

    // Callback for mouseover/mouseout events.
    editorQuery.mouseover(function(event)
			   {			       
			       var targ = getEventTarget(event);
			       hideToolTip();
			       if($(targ).parents('#'+contentId).length)
				   showToolTip(targ, event.clientX, event.clientY);		   
			   });

    editorQuery.mouseout(function(event)
			 {
			     hideToolTip();
			 }
			);

    // Callback for rightclick mouse events.
    editorQuery.get(0).oncontextmenu = function(event)
    {	
	var contentQuery = $('#'+contentId);
	if(contentQuery.is('span'))
	{
	    event.preventDefault();
	    showContextMenu(event);
	}		
    };

    var buildInsertOptions = function()
    {
	if(!$('#'+srcIconId).isActive()) // Content area is not a <textarea>	
	{	
	    // Insert
	    if(isTextSelected()) // belongs somewhere else...
	    {
		insrtSubMenuQuery.empty();
		var selection = window.getSelection().getRangeAt(0);
		var teiTags = $(selection.startContainer).parents().andSelf().filter(elements);
		var hack = function(i) {return function() { 
		    var opt = $(this); 
		    click(i, selection);
		    var hide = opt.parent().data('hide'); 
		    hide();
		};};
		for(var i in tei.element)
		{
		    var tag = tei.element[i];		    
		    if(!tag.CHANGEME || (tag.CHANGEME && teiTags.is(tag.CHANGEME[0]))) // Special Rule for inserting, just a hack at the moment.
		    {
			var opt = addSelection(i, '', insrtSubMenuQuery);
			var click = insrtSubMenuQuery.data('click'); // Adds and action			
			tagName = i;
			opt.click(hack(i));
			$('#'+insrtIconId).enable();
		    }
		}	    
	    }
    	    else
	    {
		insrtSubMenuQuery.empty();
		$('#'+insrtIconId).disable();
	    }
	}
    };
    // Still to come is support for walking over the text with arrow keys.
    var buildRemoveEditOptions = function(event)
    {	
	if(!$('#'+srcIconId).isActive()) // Content area is not a <textarea>	
	{
	    var targ = $(getEventTarget(event));	    
	    var chooseOption = ((targ.is('#'+remIconId) || targ.parents().is('#'+remIconId)) && $('#'+remIconId).isEnabled()) || ( (targ.is('#'+editIconId) || targ.parents().is('#'+editIconId)) && $('#'+editIconId).isEnabled());
	    var testing = targ.children().andSelf().is(elements);
	    if(targ.parents().andSelf().is(elements)) // We've placed our cursor on one or more TEI element's
	    {
		remSubMenuQuery.add(editSubMenuQuery).empty();
		var query = [remSubMenuQuery, editSubMenuQuery];
		for(var i in query)
		{
		    targ.parents().andSelf().filter(elements).each(function(){		    
			var opt = addSelection(this.nodeName, '', query[i]);
			var click = query[i].data('click');
			var node = this;			
			opt.click(function() { 
			    var opt = $(this); 			    
			    click(node); 
			    var hide = opt.parent().data('hide'); 
			    hide(); 
			});
		    });
		}		
		$('#'+remIconId).add('#'+editIconId).enable();
	    }
	    else if(!chooseOption)
	    {
		remSubMenuQuery.add(editSubMenuQuery).empty(); // No options in sub menus.
		$('#'+remIconId).add('#'+editIconId).disable();
	    }
	}
    }
    $(document).mousedown(function(event) {
	buildRemoveEditOptions(event);	
    });
    
    $(document).mouseup(function(event) {
	buildInsertOptions(event);
    });
    $(document).keyup(function(event) {
	buildInsertOptions(event); // Can speed this up with cacheing later.
	buildRemoveEditOptions(event);
    });
        
    // Handles clicks that cancel other stuff...
    $(document).mousedown(function(event)
    {	
	var targ = $(getEventTarget(event));
	
	if(!targ.parents('#'+contextId).length)
	    hideContextMenu();
	if(!targ.parents('#'+tbarMenuId).length)
	    hideToolBarMenu();
    });

    // State determines if the page is loaded, page must be fully loaded to save
    this.LoadPage = function(p_sPid)
    {
	var editor = this;
	editor.pid = p_sPid;
	editor.bPageLoaded = false;	
	// Callback
	var baseURL = location.href.substr(0, location.href.lastIndexOf('/')); // URL minus pid
	jQuery.post(baseURL+"/"+p_sPid+"/getTEI", {}, function(data) {	    
	    editor.teiDoc = data;
	    var tei = $(data).find("div[type='page']");
	    contentQuery.empty();
	    contentQuery.html(tei);
	    editor.bPageLoaded = true;
	}, "json");
    };
    //
    this.Save = function()
    {
	var editor = this;	
	//var tei = this.teiDoc;
  var contentQuery = $('#'+contentId);
	//contentQuery.empty();
	//var tei = contentQuery.val();
  var tei = '<div>test</div>'
	// Callback
	var baseURL = location.href.substr(0, location.href.lastIndexOf('/')); // URL minus pid
	jQuery.post(baseURL+"/"+ this.pid+"/save", { TEI : tei }, function(data) {	    
	    showModalMsgBox("Saving", data.msg);
	}, "json")
    }

    // Final adjustments
    $('#map').add(editorQuery).height(800);
    var contentQuery = $('#tei-content');
    contentQuery.height(800-$('#tei-toolbar').outerHeight());
}; // End of TEIEditor

// For home
$(document).ready(function(){
    // Create Content
    var editorQuery = $('#tei-editor');
    editorQuery.append('<span id="tei-content"/>');

    // Create Editor
    TEIEditor = new TEIEditor();

    // Create toolbar, drupal module version only... 
    var toolbarQuery = $('#toolbar');	
    var selectQuery = $('#pageSelection');    
    
    // 
    var setPage = function(pid)
    {
	var loadImage = function(pid)
	{
	    var iframe = $('iframe[name="map"]');
	    if(iframe.length==0)
		return;
	    var src = iframe.attr('src');
	    src = src.substr(0, src.lastIndexOf('=')+1);
	    src = src+pid;
	    iframe.attr('src', src);
	};
	var options = selectQuery.children();
	index = options.index(options.filter('[value="'+pid+'"]'));
	selectQuery.get(0).selectedIndex = index;
	loadImage(pid);
	TEIEditor.LoadPage(pid);
    };
    //
    var nextPage = function()
    {
	var select = selectQuery.get(0); 
	var index = select.selectedIndex + 1;
	if(index<select.length)
	    setPage(select.options[index].value)
    };
    //
    var prevPage = function()
    {	   
	var select = selectQuery.get(0); 
	var index = select.selectedIndex - 1;
	if(index>=0)
	    setPage(select.options[index].value);
    };    
    $('#buttonPrevious').click(prevPage);
    $('#buttonNext').click(nextPage);
    selectQuery.change(function(event)
		       {
			   setPage(this.value);
		       });
    // If this doesn't work we are in trouble    
    //setPage(selectQuery.get(0).options[selectQuery.get(0).selectedIndex].value);
    setPage(0);
});