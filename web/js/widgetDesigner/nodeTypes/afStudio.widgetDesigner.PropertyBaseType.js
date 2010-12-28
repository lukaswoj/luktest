/**
 * This class wraps creation of Ext.data.Record objects
 */
(function(){
	afStudio.widgetDesigner.PropertyBaseType = function(fieldId, fieldLabel){
		this.id = fieldId;
        this.label = fieldLabel;
	};
})();

Ext.apply(afStudio.widgetDesigner.PropertyBaseType.prototype, {
	/**
	 * @var {Mixed} value
	 * Property value
	 */
	value: undefined,
    /**
     * Used when value was not set. This should be set by class implementing concrete type
     */
    defaultValue: '',
    id: undefined,
    label: undefined,
    type: 'string',
	
	/**
	 * @var {Boolean} required
	 * Is field required
	 */
	required: false,
	 	
	setRequired: function(){
		this.required = true;
		return this;
	},
	
	setValue: function(v){
		this.value = v;
		return this;
	},
    create: function(){
        var recordConstructor = Ext.data.Record.create(
            {
                name:'name',
                type:'string'
            },
            {
                name:'value',
                type:this.type
            },
            'required'
        );
        
        var r = new recordConstructor({
            name: this.label,
            //TODO: will not work for boolean type! because if current value == false you will return defaultValue instead of original
            value: this.value || this.defaultValue,
            required: this.required ? "Mandatory" : 'Optional'
        }, this.label);

        //Set type of record
        r.type = this.type;
        r.originalStore = this.store;
        
        return r;
    }
});