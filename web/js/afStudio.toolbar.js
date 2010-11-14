afStudio.toolbar = Ext.extend(Ext.Toolbar, { 

	initComponent: function(){
		
		var config = {
			id: "toolbar",
			items: [
				{
					text: "File",
					menu: {
						items: [
							{ 
								text: "Model",
								menu: {
									items: [
										{
											text: "Add",
											handler: function (b,e)
											{
												
											}
										},
										{
											text: "Refresh",
											handler: function (b,e)
											{
												afStudio.vp.layout.west.items[0].root.reload();
											}
										}
									]
								}
							},
							{ 
								text: "Module",
								menu: {
									items: [
										{
											text: "Add",
											handler: function (b,e)
											{
												
											}
										},
										{
											text: "Refresh",
											handler: function (b,e)
											{
												
											}
										}
									]
								}
							}
						]
					}
				},
				{
					text: 'Widget Designer',
					handler: function (b, e) {
						afStudio.vp.addToPortal(
						{
							title: 'Widget Designer',
							collapsible: false,
							draggable: false,
							items: [
								new Ext.TabPanel({								
									height: 400,
									activeTab: 0,
									items: [
									{
										title: 'Widget Designer'
									},{
										title: 'Preview'
									},{
										title: 'CodeEditor'
									}]
								})
							]
						},	
							true
						);	
					}
				},				
				{
					xtype: "tbfill"
				},
				{
					text: "<img src=\"\/images\/famfamfam\/user_go.png\" border=\"0\">",
					handler: function () { window.location.href="/logout"; },
					tooltip: { text: "Click to log out",
					title: "admin" }
				}
			]
		};
		
		// apply config
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		afStudio.toolbar.superclass.initComponent.apply(this, arguments);	
	},	
	init: function ()
	{
		this.render(document.body);
	}
});