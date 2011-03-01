Ext.namespace('afStudio.layoutDesigner');

//TODO should be cleaned & rewritten

/**
 * @class afStudio.layoutDesigner.DesignerPanel
 * @extends Ext.Panel
 * @author Nikolai
 */
afStudio.layoutDesigner.DesignerPanel = Ext.extend(Ext.Panel, {
	/**
	 * @cfg {Object} layoutMeta required
	 * Layout meta data 
	 */

	/**
	 * @cfg {String} layoutApp required
	 */

	/**
	 * @cfg {String} layoutPage required
	 * Page's name 
	 */	
	
	/**
	 * @cfg {String} widgetMetaUrl (defaults to 'afsLayoutBuilder/getWidget')
	 */
	widgetMetaUrl : 'afsLayoutBuilder/getWidget'	


	/**
	 * @cfg {String} saveLayoutUrl (defaults to 'afsLayoutBuilder/save')
	 */
	,saveLayoutUrl : 'afsLayoutBuilder/save'	
	
	
	/**
	 * @property {afStudio.layoutDesigner.WidgetSelectorWindow} widgetSelectorWindow  
	 */
	
	/**
	 * @property {afStudio.layoutDesigner.view.Page} layoutView
	 * Layout page view
	 */
	
	/**
	 * Runs action 
	 * 
	 * @param {Object} action contains:
	 *   {String} url The action URL
	 * 	 {Function} run required The action function to be run on success
	 * 		accepts result (response) object 
	 *   {Object} actionParams optional
	 *   {String} loadingMessage optional
	 *   {Object} scope
	 */
	,executeAction : function(action) {		
		afStudio.vp.mask({
			msg: action.loadingMessage 
				 ? action.loadingMessage 
				 : 'Loading...', 
			region: 'center'
		});
		
		Ext.Ajax.request({
		   url: action.url,
		   params: action.params,
		   success: function(xhr, opt) {
			   afStudio.vp.unmask('center');
			   var response = Ext.decode(xhr.responseText);
			   if (response.success) {
			   	   Ext.util.Functions.createDelegate(
		   			 action.run, 
		   			 action.scope ? action.scope : this, 
		   			 [response], 
		   			 false
			   	   )();			       				   	
			   } else {
			   	   Ext.Msg.alert('Error', response.content);
			   }
		   }, 
		   failure: function(xhr, opt) {
		   	   afStudio.vp.unmask('center');
		       Ext.Msg.alert('Error', String.format('Status code: {0}, message: {1}', xhr.status, xhr.statusText));
		   }
		});
	}//eo executeAction
	
	/**
	 * Checks if <b>content</b> view of {@link #layoutView} is tabbed
	 * @return {Boolean} true if tabbed otherwise false
	 */
	,isLayoutTabbed : function() {
		var view = this.layoutView.getContentView(),
			  vm = view.viewMeta;
		
		return this.isViewTabbed(vm);
	}//eo isLayoutTabbed
	
	/**
	 * Returns specified <u>Format</u> menu item 
	 * @param {Ext.menu.Item} item The specified menu item
	 * @return {Ext.menu.Item} menu item
	 */
	,getFormatMenuItem : function(item) {
 		var formatM = this.getTopToolbar().getComponent('formatMenu').menu; 			  
 		return formatM.getComponent(item);
	}//eo getFormatMenuItem
	
	/**
	 * Returns specified <u>Format</u>-><u>Type</u> menu item
	 * @param {Ext.menu.Item} item The specified menu item
	 * @return {Ext.menu.Item} menu item
	 */
	,getFormatTypeMenuItem : function(item) {
		var typeM = this.getFormatMenuItem('typeItem').menu;
 		return typeM.getComponent(item);
	}//eo getFormatTypeMenuItem

	/**
	 * Returns specified <u>Format</u>-><u>Columns</u> menu item
	 * @param {Ext.menu.Item} item The specified menu item
	 * @return {Ext.menu.Item} menu item
	 */	
	,getFormatLayoutMenuItem : function(item) {
		var typeM = this.getFormatMenuItem('layoutItem').menu;
 		return typeM.getComponent(item);
	}
	
	/**
	 * Updates state of designer control panel's items
	 * depending on layout type.
	 */
	,updateDesignerPanelControls : function() {
		var addNewTabMi = this.getFormatMenuItem('addNewTab');
		
		//Sets Format->Type menu in the proper state depending on layout type (normal/tabbed)
		if (this.isLayoutTabbed()) {
			this.getFormatTypeMenuItem('tabbedView').setChecked(true, true);
			addNewTabMi.enable();
		} else {
			this.getFormatTypeMenuItem('normalView').setChecked(true, true);
			addNewTabMi.disable();
		}	
	}//eo updateDesignerPanelControls	
	
	/**
	 * Updates designer view.   
	 * @param {afStudio.layoutDesigner.view.Page} view The new view 
	 */
	,updateLayoutView : function(view) {
		this.removeAll(true);
		this.layoutView = this.add(view);
		this.doLayout();		
	}//eo updateLayoutView
	
	/**
	 * Initializes component
	 * @private
	 * @return {Object} The configuration object 
	 */
	,_beforeInitComponent : function() {
		var _this = this;
		
		var tb = new Ext.Toolbar({
	        items: [
	        {
	        	text: 'Save',
	        	itemId : 'saveLayoutBtn',
	        	iconCls: 'icon-save'	        	
	        },'-',{
	        	text: 'Add Widget',
	        	itemId : 'addWidgetBtn',
	        	iconCls: 'icon-add'	        	
	        },'-',{
	        	text: 'Format', 
	        	itemId : 'formatMenu',
	        	iconCls: 'icon-format', 
	        	menu: {
	        		ignoreParentClicks: true,
					items: [
					{
						text: 'Type',
						itemId: 'typeItem',
						menu: {							
							defaults: {
								xtype: 'menucheckitem',								
								group: 'layoutType'
							},
							items: [
							{	
								itemId: 'normalView',
								type: 'normal',
								text: 'Normal' 
							},{
								itemId: 'tabbedView',
								type: 'tabbed',
								text: 'Tabbed'
							}]
						}
					},{
						text: 'Columns',
						itemId: 'layoutItem',
						menu: {
							items: [
	    					{
								xtype: 'combo',
								itemId: 'layoutStructure',
								triggerAction: 'all', 
								mode: 'local', 
								emptyText: 'Select an item...',
								store: [
									[1, '1 column'], 
									[2, '2 columns'], 
									[3, '3 columns'], 
									[4, '4 columns']
								]
							}]
						}
					},{
						text: 'Re-size',
						handler: _this.resizeItems, 
						scope: _this
					},{
						text: 'Auto-Adjust', 
						handler: _this.autoAdjust, 
						scope: _this
					},{
						itemId: 'addNewTab',
						text: 'Add new Tab' 
					}]
	        	}	        	
	        },'-',{
	        	text: 'Preview', 
	        	iconCls: 'icon-preview', 
	        	handler: this.preview
	        }]			
		});		
		
		return {
			title: 'Layout Designer',
			layout: 'fit',
			tbar: tb,
			items: {
				xtype: 'afStudio.layoutDesigner.view.page',				
				pageMeta: _this.layoutMeta,
				ref: 'layoutView'
			}
		}
	}//eo _beforeInitComponent
	
	/**
	 * Template method
	 * @private
	 */
	,initComponent : function() {
		Ext.apply(this, 
			Ext.apply(this.initialConfig, this._beforeInitComponent())
		);				
		afStudio.layoutDesigner.DesignerPanel.superclass.initComponent.apply(this, arguments);
		this._afterInitComponent();
	}
	
	/**
	 * Initializes events & does post configuration
	 * @private
	 */	
	,_afterInitComponent : function() {
		var _this = this,
			 tbar = _this.getTopToolbar(),
			 saveBtn = tbar.getComponent('saveLayoutBtn'),
		newWidgetBtn = tbar.getComponent('addWidgetBtn');
		
		_this.addEvents(
			/**
			 * @event layouttypechanged Fires after view layout was changed
			 * @param {String} layoutType The new view layout type (normal/tabbed)
			 */
			'layouttypechanged'
		);
		
		saveBtn.on('click', _this.onSaveDesignerLayout, _this);
		
		newWidgetBtn.on('click', _this.onClickNewWidget, _this);
		
		_this.getFormatLayoutMenuItem('layoutStructure').on({
			select: _this.onSelectDesignerColumnsNumber, 
			scope: _this	
		});
		
		_this.getFormatMenuItem('typeItem').menu.on({
			itemclick: _this.onLayoutTypeChanged,
			scope: _this
		});
		
		_this.on('afterrender', _this.initDesignerPanel, _this);
	}//eo _afterInitComponent
	
	/**
	 * This designer panel <u>afterrender</u> event listener
	 * Executes init actions
	 */
	,initDesignerPanel : function() {		
		this.updateDesignerPanelControls();
	}	
	
	/**
	 * 
	 * @param {} item The selected menu item
	 * @param {} e The event object
	 */
	,onLayoutTypeChanged : function(item, e) {		
		var _this = this,
			   vt =	item.type,
			   vm = _this.layoutView.getContentView().viewMeta,
			   pm = _this.layoutView.pageMeta;
		
			var isTabbed = _this.isViewTabbed(vm);
		
		switch (vt) {
			case 'normal':
				if (isTabbed) {
					var meta = _this.changeContentViewMetaData('normal', pm);
					_this.updateLayoutView(new afStudio.layoutDesigner.view.Page({pageMeta: meta}));			
				}
			break;
			
			case 'tabbed':
				if (!isTabbed) {
					var meta = _this.changeContentViewMetaData('tabbed', pm);
					_this.updateLayoutView(new afStudio.layoutDesigner.view.Page({pageMeta: meta}));
				}
			break;
		}
		
		this.fireEvent('layouttypechanged', item.type);
		
		this.updateDesignerPanelControls();
	}//eo onLayoutTypeChanged
	
	/**
	 * Format->Columns <u>select</u> event listener
	 * For more detailed information look at {@link Ext.form.ComboBox#select}
	 */
	,onSelectDesignerColumnsNumber : function(combo, record, index) {
		var colNum = combo.getValue();
		this.columnsNumber = colNum;
		this.refreshDesignerPanel();
	}//onSelectDesignerColumnsNumber
	
	/**
	 * New Widget button <u>click</u> event listener
	 * Creates widget selector window if it is not exist or show it otherwise.
	 * Widget selector window helps to select new widget to be added listing all modules and their widgets
	 */
	,onClickNewWidget : function() {		
		if (!this.widgetSelectorWindow) {
			this.widgetSelectorWindow = new afStudio.layoutDesigner.WidgetSelectorWindow();			
			this.widgetSelectorWindow.on('widgetselect', this.onAddWidget, this);
		}
		this.widgetSelectorWindow.show();		
	}//eo f.getFieldValues()
	
	/**
	 * Creates and adds widget 
	 * widgetSelectorWindow <u>widgetselect</u> event listener
	 * @param {Object} widgetParam
	 */
	,onAddWidget : function(widgetParam) {
		var _this = this,
				p = _this.layoutView;
		
		_this.executeAction({
			url: _this.widgetMetaUrl,			  
			params: {
		       module_name: widgetParam.module,
		       action_name: widgetParam.widget
		    }, 
		    run: function(response) {
		       p.addWidgetComponentToContentView(
		       	 Ext.apply(widgetParam, {meta: response.content})
		       );
		    },
		    loadingMessage: 'Add Widget...'			
		});		
	}//eo onAddWidget	
 
	/**
	 * Handles <i>save</i> button <u>click</u> event listener
	 * Saves layout
	 */
	,onSaveDesignerLayout : function() {
		var _this = this,		
		 pageMeta = _this.layoutView.getPageMetaData(); 
		 
		_this.executeAction({			
			url: _this.saveLayoutUrl,
			params: {
	            app: _this.layoutApp,
	            page: _this.layoutPage,
	            definition: Ext.encode(pageMeta)
		    },
		    scope: _this,
		    run: function(response) {
		    	//response.content success message here
		   		this.fireEvent("logmessage", this, "layout saved"); 	
		    },
		    loadingMessage: 'Saving...'
		});
		
	}//eo onSaveDesignerLayout
	
	/**
	 * function resizeItems
	 * Resize button handler
	 */
	//TODO rewrite 
	,resizeItems : function() {
    	var detailp = this;
    	var columns = detailp.columnsNumber;    	
    	detailp.resizer = [];
    		
    	for (var i = 0; i < columns; i++) {    		
    		var resizer = new Ext.Resizable('portal-column-' + i, {
    			 width: 200,
                 minWidth: 100,
                 minHeight: 50,
                 listeners: {
                	 beforeresize: function(resizer, e) {
                		 var el = Ext.fly(resizer.el);
                		 resizer._width = Ext.fly(el).getWidth();
                	 },
                	 resize: function(resizer, width, height, e) {
                		 detailp.resizerHandler(resizer, width, height, e);
                	 }
                 }
    		});
    		detailp.resizer.push(resizer);
    	}
	}//eo resizeItems

	/**
	 * Auto-Adjust button handler 
	 */
	,autoAdjust : function() {
		var els = Ext.DomQuery.select('div[class*="x-portlet"]', this.designerPortal.el);
		
		for (var i = 0, l = els.length; i < l; i++) {
			var cmp = Ext.getCmp(els[i].id);
			var colW = cmp.ownerCt.getWidth();
			
			cmp.setWidth(colW);
			Ext.get(els[i]).setWidth(colW);
			
			cmp.doLayout();
			cmp.ownerCt.doLayout();
		}
	}//eo autoAdjust	
	
	/**
	 * Function preview
	 * Show preview window with real widget
	 */
	//TODO rewrite 
	,preview: function() {		
		//TODO: if user clicks on the "Preview" button in the LayoutDesigner widget panel. not sure if this is the better solution
		try {
			var wp = this.ownerCt.ownerCt.widgetParams;
			
			var iconCls = wp.iconCls;
			var title = wp.title;
		} catch (e) {
			var iconCls = 'icon-bug-add';
			var title = "Edit profile";
		}
		
		afApp.widgetPopup("/afGuardUserProfile/edit", title, null, "iconCls:\'" +iconCls+ "\',width:800,height:600,maximizable: false", afStudio);
	}
	
	/**
	 * Function runWidgetDesigner
	 * Create widget Designer 
	 */
	//TODO rewrite make it working with real data
	,runWidgetDesigner : function() {
        var actionPath = "\/var\/www\/web4\/apps\/frontend\/modules\/afGuardUserProfile\/actions\/actions.class.php";
        var securityPath = "\/var\/www\/web4\/apps\/frontend\/modules\/afGuardUserProfile\/config\/security.yml";
        var widgetUri = 'afGuardUserProfile/edit';

		var mask = new Ext.LoadMask(afStudio.vp.layout.center.panel.body, {msg: 'Loading, please Wait...', removeMask:true});
		mask.show();
		
		afStudio.vp.addToPortal({
			title: 'Widget Designer', 
			layout: 'fit',
			collapsible: false, 
			draggable: false,
			items: [{
				xtype: 'afStudio.widgetDesigner', 
				actionPath: actionPath, 
				securityPath: securityPath, 
				widgetUri: widgetUri, 
				mask: mask
			}]
		}, true);		
	}
	
});

/**
 * @type 'afStudio.layoutDesigner.designerPanel'
 */
Ext.reg('afStudio.layoutDesigner.designerPanel', afStudio.layoutDesigner.DesignerPanel);

/**
 * Mixin MetaData Class is added to DesignerPanel to increase its functionality
 */
Ext.apply(afStudio.layoutDesigner.DesignerPanel.prototype, afStudio.layoutDesigner.view.MetaDataProcessor);