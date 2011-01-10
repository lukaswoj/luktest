/**
 * This node can be used as a base node for any XML element that "uses" i:valueType
 * Thanks to custom implementation for some of BaseNode methods it contains custom structure in WI tree
 * So this node contains valueType and valueSource properties and based on their values
 * there is child node created that allows to make further configuration of your i:valueType node
 * This node also needs custom code that sets its initial values from XML and
 * also custom code that dumps its data back to JSON so they can be written back to XML
 *
 * Any class that extends ValueTypeNode and creates custom properties must have
 * static definition. If you try to create it using NodeBuilder - properties won't be
 * initialized properly.
 */
afStudio.widgetDesigner.ValueTypeNode = Ext.extend(afStudio.widgetDesigner.ContainerNode, {
    ValueTypeXMLName: '',
    constructor: function(){
        afStudio.widgetDesigner.ValueTypeNode.superclass.constructor.apply(this, arguments);
        this.propertyChanged();
    },
    createProperties: function(){
       var properties = [
            new afStudio.widgetDesigner.ValueType('valueType', 'Value Type').create(),
            new afStudio.widgetDesigner.ValueSource('valueSource', 'Value Source').create(),
       ];
       for (i=0; i<properties.length;i++){
           this.addProperty(properties[i]);
       }
    },
    dumpDataForWidgetDefinition: function(){
        var widgetData = afStudio.widgetDesigner.ValueTypeNode.superclass.dumpDataForWidgetDefinition.apply(this, arguments);
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
        var XMLData = widgetData[this.ValueTypeXMLName];
        switch (valueSource) {
            case 'source':
                    valueNode['i:source'] = {name: XMLData['name']};
                break;
            case 'classAndMethod':
                    valueNode['i:class'] = XMLData['i:class'];
                    valueNode['i:method'] = {name: XMLData['i:method']};
                break;
            case 'item':
                    valueNode['i:source'] = {name: XMLData['name']};
                break;
            case 'static':
                    valueNode['i:source'] = {name: XMLData['name']};
                break;

        }
        newWidgetData[this.ValueTypeXMLName] = valueNode;

        return newWidgetData;
    },
    propertyChanged: function(property){
        afStudio.widgetDesigner.ValueTypeNode.superclass.propertyChanged.apply(this, arguments);
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
            data[this.ValueTypeXMLName] = childNode.dumpDataForWidgetDefinition();
        }
        return data;
    },
    configureFor: function(widgetData){
        afStudio.widgetDesigner.ValueTypeNode.superclass.configureFor.apply(this, [widgetData]);
        if (widgetData && widgetData[this.ValueTypeXMLName]) {
            var iValueData = widgetData[this.ValueTypeXMLName];
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
    }
});
