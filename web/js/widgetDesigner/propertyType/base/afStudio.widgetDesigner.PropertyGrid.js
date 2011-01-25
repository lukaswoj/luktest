/**
 * @class afStudio.widgetDesigner.PropertyRecord
 * A specific {@link Ext.data.Record} type that represents a name/value pair and groupField is made to work with the
 * {@link afStudio.widgetDesigner.PropertyGrid}.  
 * @constructor
 * @param {Object} config A data object in the format: {name: [name], value: [value], groupField: [groupField]}.  
 * The specified value's type will be read automatically by the grid to determine the type of editor to use when displaying it.
 */
Ext.ns('afStudio.widgetDesigner');
afStudio.widgetDesigner.PropertyRecord = Ext.data.Record.create([
    {name:'name', type:'string'}, 'value', 'required'
]);

/**
 * @class afStudio.widgetDesigner.PropertyStore
 * @extends Ext.grid.PropertyStore
 * A custom wrapper for the {@link afStudio.widgetDesigner.PropertyGrid}'s {@link Ext.data.Store}. This class handles the mapping
 * between the custom data source objects supported by the grid and the {@link afStudio.widgetDesigner.PropertyStore} format
 * required for compatibility with the underlying store. Generally this class should not need to be used directly --
 * the grid's data should be accessed from the underlying store via the {@link #store} property.
 * @constructor
 * @param {Ext.grid.Grid} grid The grid this store will be bound to
 * @param {Object} source The source data config object
 */
afStudio.widgetDesigner.PropertyStore = Ext.extend(Ext.grid.PropertyStore, {
    
    constructor : function(grid, source){
    	afStudio.widgetDesigner.PropertyStore.superclass.constructor.call(this);
        this.grid = grid;
        this.store = new Ext.data.GroupingStore({
            recordType : afStudio.widgetDesigner.PropertyRecord,
            groupField:'required'
        });
        this.store.on('update', this.onUpdate,  this);
        if(source){
            this.setSource(source);
        }
    },
    
    // protected - should only be called by the grid.  Use grid.setSource instead.
    setSource : function(data){
        this.source = data;
        this.store.removeAll();
        this.store.loadRecords({records: data}, {}, true);
    }
});

/**
 * @class afStudio.widgetDesigner.PropertyColumnModel
 * @extends Ext.grid.PropertyColumnModel
 * A custom column model for the {@link afStudio.widgetDesigner.PropertyGrid}.  Generally it should not need to be used directly.
 * @constructor
 * @param {afStudio.widgetDesigner.PropertyGrid} grid The grid this store will be bound to
 * @param {Object} source The source data config object
 */

afStudio.widgetDesigner.PropertyColumnModel = Ext.extend(Ext.grid.PropertyColumnModel, {
    constructor : function(grid, store){
        var g = Ext.grid,
	        f = Ext.form;
	        
	    this.grid = grid;
	    g.PropertyColumnModel.superclass.constructor.call(this, [
	        {header: this.nameText, width:50, sortable: true, dataIndex:'name', id: 'name', menuDisabled:true},
	        {header: this.valueText, width:50, resizable:false, dataIndex: 'value', id: 'value', menuDisabled:true},
	        {header: 'RequiredHeader', width:50, resizable:false, dataIndex: 'required', id: 'required', menuDisabled:true, hidden: true}
	    ]);
	    this.store = store;
	
	    var bfield = new f.Field({
	        autoCreate: {tag: 'select', children: [
	            {tag: 'option', value: 'true', html: this.trueText},
	            {tag: 'option', value: 'false', html: this.falseText}
	        ]},
	        getValue : function(){
	            return this.el.dom.value == 'true';
	        }
	    });
	    this.editors = {
	        'date' : new g.GridEditor(new f.DateField({selectOnFocus:true})),
	        'string' : new g.GridEditor(new f.TextField({selectOnFocus:true})),
	        'number' : new g.GridEditor(new f.NumberField({selectOnFocus:true, style:'text-align:left;'})),
	        'boolean' : new g.GridEditor(bfield, {
	            autoSize: 'both'
	        })
	    };
	    this.renderCellDelegate = this.renderCell.createDelegate(this);
	    this.renderPropDelegate = this.renderProp.createDelegate(this);
    },
    
    // private
    getCellEditor : function(colIndex, rowIndex){
    	//TODO: Using n = p.id instead of n = p.data.name because,
    	//Because we are using custom records models instead of simple name => value model
    	
        var p = this.store.getProperty(rowIndex),
            n = p.id, 
            val = p.data.value;
        if(this.grid.customEditors[n]){
            return this.grid.customEditors[n];
        }
        if(Ext.isDate(val)){
            return this.editors.date;
        }else if(typeof val == 'number'){
            return this.editors.number;
        }else if(typeof val == 'boolean'){
            return this.editors['boolean'];
        }else{
            return this.editors.string;
        }
    }
    
});

/**
 * @class afStudio.widgetDesigner.PropertyGrid
 * @extends Ext.grid.EditorGridPanel(can't extend from Ext.grid.PropertyGrid because it overrides GroupingStore)
 * A specialized grid implementation intended to mimic the traditional property grid as typically seen in
 * development IDEs.  Each row in the grid represents a property of some object, and the data is stored
 * as a set of name/value pairs with groupField in {@link afStudio.widgetDesigner.PropertyRecord}s.
 * @constructor
 * @param {Object} config The grid config object
 */
afStudio.widgetDesigner.PropertyGrid = Ext.extend(Ext.grid.EditorGridPanel/*Ext.grid.PropertyGrid**/, {
    // private config overrides
    enableColumnMove:false,
    stripeRows:false,
    trackMouseOver: false,
    clicksToEdit:1,
    enableHdMenu : false,
    viewConfig : {
        forceFit:true
    },

    // private
    initComponent : function(){
    	
        this.customRenderers = this.customRenderers || {};
        this.customEditors = this.customEditors || {};
        this.lastEditRow = null;
        var store = new afStudio.widgetDesigner.PropertyStore(this);
        this.propStore = store;
        var cm = new afStudio.widgetDesigner.PropertyColumnModel(this, store);
        store.store.sort('name', 'ASC');
        
        this.addEvents('beforepropertychange', 'propertychange');
        
        this.cm = cm;
        this.ds = store.store;
        afStudio.widgetDesigner.PropertyGrid.superclass.initComponent.call(this);

		this.mon(this.selModel, 'beforecellselect', function(sm, rowIndex, colIndex){
            if(colIndex === 0){
                this.startEditing.defer(200, this, [rowIndex, 1]);
                return false;
            }
        }, this);
        
    },


    // private
    onRender : function(){
        Ext.grid.PropertyGrid.superclass.onRender.apply(this, arguments);
        this.getGridEl().addClass('x-props-grid');
    },

    // private
    afterRender: function(){
        afStudio.widgetDesigner.PropertyGrid.superclass.afterRender.apply(this, arguments);
        if(this.source){
            this.setSource(this.source);
        }
    },
	
	/**
	 * Sets the source data object containing the property data.  See {@link #getSource} for details regarding the
	 * format of the data object. And hides grouping panel for the mandatory fields.
	 * @param {Object} source data object
	 */
    setSource : function(source){
		this.addCustomEditorsAndRenderers(source);
        this.propStore.setSource(source);
		this.hideMandatoryCheckers();
    },
	
	/**
	 * Function addCustomEditorsAndRenderers
	 * Creates additional editors and renderers
	 * @param {Array} source 
	 */
	addCustomEditorsAndRenderers: function(source){
		for(var i = 0, l = source.length; i<l; i++){
			//TODO: maybe we need to create another flag..
			if('choice' == source[i].type){
				if(!this.customEditors[source[i].id]){
					var store = [];
					for(var key in source[i].originalStore){
						store.push([key, source[i].originalStore[key]]);
					}
					
					this.customEditors[source[i].id] = new Ext.grid.GridEditor(new Ext.form.ComboBox({
        				selectOnFocus:true, 
        				value: source[i].get('value'),
        				tpl: '<tpl for="."><div ext:qtip="{field2}" class="x-combo-list-item">{field2}</div></tpl>',
//	        			store: [['1', 'First'], ['2', 'Second'], ['3', 'Third']],
						store: store,
	        			triggerAction: 'all'
    	    		}));
				}
				
				if(!this.customRenderers[source[i].id]){
					this.customRenderers[source[i].id] = function(v, md, r){
		        		return r.originalStore[v];
		        	};
				}
			}
		}
	},
	
	/**
	 * Function hideMandatoryCheckers
	 * Hides checker group
	 */
	hideMandatoryCheckers: function(){
        //Hide mandatory checkers
        var hd = Ext.select('DIV[id*="-gp-required-Mandatory-hd"]');
		if(hd){
			hd.setStyle({display: 'none'});
		}		
	},
	
    /**
     * Gets the source data object containing the property data.  See {@link #setSource} for details regarding the
     * format of the data object.
     * @return {Object} The data object
     */
    getSource : function(){
        return this.propStore.getSource();
    }
});
Ext.reg("widgetdesignerpropertygrid", afStudio.widgetDesigner.PropertyGrid);