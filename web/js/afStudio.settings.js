afStudio.Settings = Ext.extend(Ext.Window, { 

	dbForm: null,
	tabPanel: null,
	projectForm: null,
	
	initComponent: function(){
		this.initTabPanel();
		var config = {
			title: 'Settings', width: 463,
			height: 250, closable: true,
	        draggable: true, plain:true,
	        modal: true, resizable: false,
	        bodyBorder: false, border: false,
	        layout: 'fit',
	        items: this.tabPanel,
			buttons: [
				{text: 'Save', handler: this.save, scope: this},
				{text: 'Cancel', handler: this.cancel, scope: this}
			],
			buttonAlign: 'center'
		};
				
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		afStudio.Settings.superclass.initComponent.apply(this, arguments);	
	},
	
	initTabPanel: function(){
		this.createTabsUI();
		this.tabPanel = new Ext.TabPanel({
			activeTab: 0,
			items:[
				{xtype: 'panel', title: 'Project', formName: 'projectForm', items: this.projectForm},
				{xtype: 'panel', title: 'Database', formName: 'dbForm', items: this.dbForm}
			]
		});
	},
	
	createTabsUI: function(){
		this.projectForm = new Ext.FormPanel({
			url: window.afStudioWSUrls.getConfigureProjectUrl()+'?type=save',
			bodyStyle: 'padding: 5px;', labelWidth: 140, 
			border: false,
			bodyBorder: false,
			listeners: {
	        	'render': function(cmp){
					cmp.getForm().load({
			            url: window.afStudioWSUrls.getConfigureProjectUrl(),
			
			            failure: function(form, action) {
			                Ext.Msg.alert("Load failed", 'Error while getting data');
			            }
			        });	        		
	        	}, scope: this
	        },
			items:[
				{xtype:'textfield', name: 'name', fieldLabel:'Project Name', anchor:'95%'},
				{xtype:'displayfield', name: 'display_url', fieldLabel:'Url', anchor:'95%', style: 'font-weight:bold;'},
				{xtype:'displayfield', name: 'path', fieldLabel:'Path to Project', anchor:'95%', style: 'font-weight:bold;'},
				{xtype:'label', html: 'Description:', style: 'font: 12px tahoma,arial,helvetica,sans-serif;'},
				{xtype:'textarea', hideLabel: true, anchor: '100%', name: 'description', height: 57, style: 'margin-top: 5px;'},
				{xtype: 'checkbox', hideLabel: true, boxLabel: 'Auto-Deploy on Save', name: 'autodeploy'}
			]
		});
		
		this.dbForm =  new Ext.FormPanel({
			url: window.afStudioWSUrls.getConfigureDatabaseUrl(), defaultType: 'textfield', width: 450,
			bodyStyle: 'padding: 5px;',
			border: false, bodyBorder: false,
	        labelWidth: 100, title: false,
	        listeners: {
	        	'render': function(cmp){
					cmp.getForm().load({
			            url: window.afStudioWSUrls.getLoadDatabaseConnectionSettingsUrl(),
			
			            failure: function(form, action) {
			                Ext.Msg.alert("Load failed", 'Error while getting data');
			            }
			        });	        		
	        	}, scope: this
	        },
			items: [
	        	{xtype:'textfield', fieldLabel: 'Database', anchor: '96%', name: 'database', allowBlank: false},
				{xtype: 'panel', layout: 'column', 
					border: false, bodyBorder: false,
					defaults: {border: false, bodyBorder: false},
					items: [
						{xtype: 'panel', columnWidth: 1, layout: 'form', style: 'margin-right: 5px;',
							
							items: [{xtype: 'textfield', fieldLabel: 'Host', name: 'host', anchor: '92%', allowBlank: false}]
						},
						{xtype: 'panel', width: 100, layout: 'form', labelWidth: 35,
							items: [{xtype: 'textfield', fieldLabel: 'Port', name: 'port', anchor: '82%', allowBlank: true}]
						}
					]
				},
				{xtype:'textfield', fieldLabel: 'Username', anchor: '96%', name: 'username', allowBlank: false},
				{xtype:'textfield', fieldLabel: 'Password', anchor: '96%', name: 'password', allowBlank: false},
				{xtype: 'checkbox', hideLabel: true, boxLabel: 'Persistent', name: 'persistent'},
				{xtype: 'checkbox', hideLabel: true, boxLabel: 'Pooling', name: 'pooling'}
			]
		});
	},
	
	save: function(){
		var activeTab = this.tabPanel.getActiveTab();
		
		switch(activeTab.formName)
		{
			case "projectForm":
				var activeForm = this.projectForm.getForm();
				break;
				
			case "dbForm":
				var activeForm = this.dbForm.getForm();
				break;
		}
			
		if(activeForm.isValid()){
		    activeForm.submit({
		        failure:function(form,action){
		                if(action.result)
		                {
		                    if(action.result.message)
		                    {
		                        Ext.Msg.alert("Failure", action.result.message, function(){
		                                if(action.result.redirect){
		                                        window.location.href=action.result.redirect;
		                                }
		                        });
		                    }
		                }
		        },
		        success:function(form,action){
		                if(action.result)
		                {
		                    if(action.result.message)
		                    {
		                        Ext.Msg.alert("Success", action.result.message, function(){
		                                if(action.result.redirect){
		                                        window.location.href=action.result.redirect;
		                                }
		                        });
		                    }
		                }
		        }
		    });
		}		
	},
	
	cancel:function(){
		this.close();
	}
});