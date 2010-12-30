afStudio.widgetDesigner.ListNode = Ext.extend(afStudio.widgetDesigner.ObjectRootNode, {
	getNodeConfig: function(){
        var node = {
            text: 'New list widget'
        };
        return node;
	},
	addRequiredChilds: function(){
        this.appendChild(new afStudio.widgetDesigner.ActionsNode());
        this.appendChild(new afStudio.widgetDesigner.RowActionsNode());
        this.appendChild(new afStudio.widgetDesigner.MoreActionsNode());
        this.appendChild(new afStudio.widgetDesigner.DatasourceNode());
        this.appendChild(new afStudio.widgetDesigner.FieldsNode());
	},
    createProperties: function(){
        this.addProperty(new afStudio.widgetDesigner.PropertyBaseType('i:title','Title').create());
        this.addProperty(new afStudio.widgetDesigner.PropertyTypeBoolean('i:description','Description').create());
    }
});