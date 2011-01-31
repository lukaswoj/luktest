/**
 * This node represents i:field node in edit type widget
 * Thanks to custom implementation for some of BaseNode methods it contains custom structure in WI tree
 * So Field node contains valueType and valueSource properties and based on their values
 * there is child node created that allows to make further configuration of i:value node
 * This node also needs custom code that sets its initial values from XML and
 * also custom code that dumps its data back to JSON so they can be written back to XML
 */
afStudio.widgetDesigner.FieldNode = Ext.extend(afStudio.widgetDesigner.ContainerNode, {
    constructor: function(){
        afStudio.widgetDesigner.FieldNode.superclass.constructor.apply(this, arguments);
    },
    updateNodeNameFromPropertyId: 'name',

    getNodeConfig: function(){
        return {
            'text': 'new field',
            'iconCls': 'icon-field'
        };
    },
    createProperties: function(){
       var properties = [
            new afStudio.widgetDesigner.PropertyTypeString('name','Name').setRequired().create(),
            new afStudio.widgetDesigner.PropertyTypeString('label','Label').create(),
            new afStudio.widgetDesigner.PropertyTypeString('type','Type').create(),
            new afStudio.widgetDesigner.ValueType('valueType', 'Value Type').create(),
            new afStudio.widgetDesigner.ValueSource('valueSource', 'Value Source').create(),
            new afStudio.widgetDesigner.PropertyTypeString('state','State').create(),
            new afStudio.widgetDesigner.PropertyTypeString('style','Style').create(),
       ];

       for (i=0; i<properties.length;i++){
           this.addProperty(properties[i]);
       }
    },
    dumpDataForWidgetDefinition: function(){
        var widgetData = afStudio.widgetDesigner.FieldNode.superclass.dumpDataForWidgetDefinition.apply(this, arguments);
        var newWidgetData = {};
        for (i in widgetData) {
            if (i == 'valueType') {
                var valueType = widgetData[i];
            } else if (i == 'valueSource') {
                var valueSource = widgetData[i];
            } else {
                newWidgetData[i] = widgetData[i];
            }
        }

        var valueNode = {};
        if (valueType) {
            valueNode['type'] = valueType;
        } else {
            valueNode['type'] = 'orm';
        }
        switch (valueSource) {
            case 'source':
                    valueNode['i:source'] = {name: widgetData['i:value']['name']};
                break;
            case 'classAndMethod':
                    valueNode['i:class'] = widgetData['i:value']['i:class'];
                    valueNode['i:method'] = widgetData['i:value']['i:method'];
                break;
            case 'item':
                    valueNode['i:source'] = {name: widgetData['i:value']['name']};
                break;
            case 'static':
                    valueNode['i:source'] = {name: widgetData['i:value']['name']};
                break;

        }
        newWidgetData['i:value'] = valueNode;

        return newWidgetData;
    },
    propertyChanged: function(property){
        afStudio.widgetDesigner.FieldNode.superclass.propertyChanged.apply(this, arguments);
        if (property && property.id == 'valueSource') {
            this.valueSourceChanged();
        }
    },
    valueSourceChanged: function(dataForNewNode){
        if (!dataForNewNode) {
            dataForNewNode = {};
        }
        if (this.childNodes.length > 0) {
            var childNode = this.childNodes[0];
            childNode.destroy();
        }

        switch (this.properties['valueSource'].get('value')) {
            case 'source':
                var newNode= new afStudio.widgetDesigner.FieldNodeValueSourceSource();
                if (dataForNewNode['i:source']) {
                    var nodeData = dataForNewNode['i:source'];
                }
                break;
            case 'classAndMethod':
                var newNode= new afStudio.widgetDesigner.FieldNodeValueSourceMethod();
                var nodeData = dataForNewNode;
                break;
            case 'item':
                var newNode= new afStudio.widgetDesigner.FieldNodeValueSourceItem();
                if (dataForNewNode['i:item']) {
                    var nodeData = dataForNewNode['i:item'];
                }
                break;
            case 'static':
                var newNode= new afStudio.widgetDesigner.FieldNodeValueSourceStatic();
                if (dataForNewNode['i:static']) {
                    var nodeData = dataForNewNode['i:static'];
                }
                break;

        }

        if (newNode) {
            if (nodeData) {
                newNode.configureFor(nodeData);
            }
            this.appendChild(newNode);
        }
    },
    dumpChildsData: function(){
        var data = {};
        if (this.childNodes.length > 0) {
            var childNode = this.childNodes[0];
        }
        if (childNode) {
            data['i:value'] = childNode.dumpDataForWidgetDefinition();
        }
        return data;
    },
    configureFor: function(widgetData){
        afStudio.widgetDesigner.FieldNode.superclass.configureFor.apply(this, [widgetData]);
        if (widgetData && widgetData['i:value']) {
            var iValueData = widgetData['i:value'];
            this.configureForValue('valueType', iValueData['type']);
            if (iValueData['i:source']) {
                this.properties['valueSource'].set('value', 'source');
            } else if (iValueData['i:class']) {
                this.properties['valueSource'].set('value', 'classAndMethod');
            } else if (iValueData['i:item']) {
                this.properties['valueSource'].set('value', 'item');
            } else if (iValueData['i:static']) {
                this.properties['valueSource'].set('value', 'static');
            }
            this.valueSourceChanged(iValueData);
        }
    },
    setNameAndLabel: function(name, label) {
        this.properties['name'].set('value', name);
        this.properties['label'].set('value', label);
    }
});
