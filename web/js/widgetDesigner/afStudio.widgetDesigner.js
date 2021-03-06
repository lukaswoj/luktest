Ext.namespace('afStudio.widgetDesigner');

N = afStudio.widgetDesigner;

/**
 * Widget Designer
 * @class afStudio.widgetDesigner
 * @extends Ext.TabPanel
 */
N.DesignerTabPanel = Ext.extend(Ext.TabPanel, {
	/**
	* paths
	*/
	actionPath: false,
	securityPath: false,
	mask: false,
	/**
	 * ExtJS template method
	 * @private
	 */
	initComponent : function() {
		Ext.apply(this, Ext.apply(this.initialConfig, this._initCmp()));
		afStudio.widgetDesigner.DesignerTabPanel.superclass.initComponent.apply(this, arguments);
		this._initEvents();
	},

	/**
	 * Initialises component
	 * @return {Object} the component initial literal
	 * @private
	 */
	_initCmp : function() {

		var _this = this;
/***		
		this.codeEditorAction = new Ext.ux.CodePress({
			iconCls:'icon-script-edit',
			title:'actions.class.php',
			closable:true,
			path:_this.actionPath,
			tabTip:_this.actionPath,
			file:_this.actionPath,
			tabPanel:_this
		});

		this.codeEditorSecurity = new Ext.ux.CodePress({
			iconCls:'icon-script-edit',
			title:'security.yml',
			closable:true,
			path:_this.securityPath,
			tabTip:_this.securityPath,
			file:_this.securityPath,
			tabPanel:_this
		});
**/		
		return {
			itemId: 'widget-designer',
			id: 'widget-designer-panel',
			activeTab: 0,
			items: [
				{itemId: 'designer', title: 'Widget Designer', layout: 'fit'}
			],
			plugins: new Ext.ux.TabMenu()
		}
	},
	
	/**
	 * Function addCodeEditorTab
	 * @param {String} fileName - File Name
	 * @param {String} path - File Path
	 * @param {String} tabTip - Tab panel tooltip string
	 * @param {String} file - File
	 */
	addCodeEditorTab: function(fileName, path, tabTip, file){
		var codePress = new Ext.ux.CodePress({
			title: fileName, path: path,
			tabTip: tabTip, file: file,
			closable:true, tabPanel:this,
			
			ctCls: 'codeEditorCls'
			

		});
		
        var codeBrowserTree = new Ext.ux.FileTreePanel({
			rootPath:'root', rootVisible:true, rootText:'Home',
			url:window.afStudioWSUrls.getFiletreeUrl(), maxFileSize:524288*2*10,
			topMenu:false, autoScroll:true, 
			enableProgress:false, singleUpload:true
		});
				
		var panel = new Ext.Panel({
			layout: 'hbox',
            layoutConfig: {align: 'stretch'},
            
			iconCls: 'icon-script-edit',
			title: fileName,
			
			filePath: path,
			
			closable: true,
			tbar: [{text: 'Save', iconCls: 'icon-save', handler: onSaveBtnClick,scope:this}],
			items: [
				{xtype: 'panel', flex: 3, style: 'padding: 5px', layout: 'fit',
					
					title: 'Code Editor', frame: true,
					
					items: [
						{xtype: 'panel', items: codePress, layout: 'fit'}
					]
				},
				{
					xtype: 'panel', flex: 1, frame: true, layout: 'fit',
					title: 'Code Browser', style: 'padding: 5px;',
					items: codeBrowserTree
				}
			]
		});
		
		function onSaveBtnClick(){
			var self = this;
	    	//TODO: move to public function and it as ContextMenu "Save" item handler in Ext.ux.TabMenu
	    	Ext.Ajax.request({
	        	url: codePress.fileContentUrl, 
		        method: 'post',
		        params: {
	    	    	'file': codePress.file,
	        		'code': codePress.getCode()			          	
	        	},
	        	success:function(response, options){			
	        		self.fireEvent("logmessage",self,"Widget Designer code Saved");
	        		Ext.Msg.alert("Success","The file was saved !");			            
	        	},
	        	failure: function() {
					Ext.Msg.alert("Failure","The server can't save the file !");
				}
	        });
	    	
		}
		
		/**
			var new_tab = this.add(panel).show();
			(function(){
				panel.doLayout();
				new_tab.doLayout();
			}).defer(100);
		*/
		
		this.add(panel);
	},
	
	_initEvents : function() {

		var _this = this,
			designerTab = _this.getComponent('designer');		
		
		this.on({
			render: function(cmp){
				cmp.addCodeEditorTab('security.yml', _this.securityPath, _this.securityPath, _this.securityPath);
				cmp.addCodeEditorTab('actions.class.php', _this.actionPath, _this.actionPath, _this.actionPath);
			}
		})
		
		designerTab.on({
			beforerender : function(cmp) {
				cmp.add({
					xtype: 'afStudio.widgetDesigner.designer',
                    widgetUri: this.widgetUri,
                    rootNodeEl: this.rootNodeEl,
                    listeners:{
                    	logmessage:function(cmp,message){
                    		this.fireEvent("logmessage",cmp,message);
                    	},
                    	scope:this
                    }
				});
			},
			
            scope: this
		});

		if(this.mask)
		{
			this.mask.hide.defer(1000,this.mask);
		}

        this.on('beforetabchange', function(tabPanel,newTab,oldTab){
            if(oldTab&&oldTab.iframe){
                 oldTab.toggleIframe();
            }
            if(newTab&&newTab.iframe){
                 newTab.toggleIframe();
            }
		}, this);

	}// eo _initEvents

});

Ext.reg('afStudio.widgetDesigner', N.DesignerTabPanel);

delete N;