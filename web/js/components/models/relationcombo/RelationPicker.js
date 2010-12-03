Ext.ns('afStudio.models');

/**
 * Relation Picker 
 * @class afStudio.models.RelationPicker
 * @extends Ext.Window
 * @author Nikolai
 */
afStudio.models.RelationPicker = Ext.extend(Ext.Window, {	
	
	/**
	 * Closes Picker
	 */
	closePicker : function() {
		if (this.closeAction == 'hide') {
			this.hide();
		} else {
			this.close();	
		}				
	}
	
	/**
	 * "ok" button handler
	 */
	,pickRelation : function() {
		var _this = this,
			   mn =	this.modelsTree.getSelectionModel().getSelectedNode(),
			   fr = this.fieldsGrid.getSelectionModel().getSelected(),
			    m = this.modelsTree.getModel(mn), 
			    f = fr.get('name');
		this.closePicker();
		this.fireEvent('relationpicked', m + '.' + f);
	}
	
	/**
	 * The initial relation pickup 
	 * @param {String} relation The model.field from relation field 
	 */
	,initialRelationPick : function(relation) {		
		var _this = this,
		      rel = relation.split('.');
		(function() {
			var node = _this.modelsTree.findModelByName(rel[0]);
			if (node) {
				_this.modelsTree.selectModel(node);
				_this.fieldsGrid.show();
				_this.loadModelFields(node, function(rs){
					if (rel[1]) {
						for (var i = 0, l = rs.length; i < l; i++) {
							if (rs[i].get('name') == rel[1]) {
								_this.fieldsGrid.getSelectionModel().selectRecords([rs[i]], false); 
								break;
							}
						}
					}
				});
			} else {
				_this.fieldsGrid.getStore().removeAll();
				_this.modelsTree.getSelectionModel().clearSelections();
			}
		}).defer(300);
	}
	
	/**
	 * Loads Model's Fields
	 * @param {Ext.tree.TreeNode} modelNode
	 * @param {Function} callback
	 */
	,loadModelFields : function(modelNode, callback) {
		var s = this.modelsTree.getSchema(modelNode),
			m = this.modelsTree.getModel(modelNode);
		this.fieldsGrid.getStore().load({
			params: {
				schema: s,
				model: m
			},
			callback: callback || Ext.emptyFn
		});
	}
	
	/**
	 * ModelTree <u>click</u> event listener
	 * @param {Ext.tree.TreeNode} node
	 * @param {Ext.EventObject} e
	 */
	,onModelClick : function(node, e) {
		this.fieldsGrid.show();
		this.loadModelFields(node);
	}	
	
	/**
	 * ModelTree <u>modelsload</u> event listener
	 * @param {Ext.tree.Loader} loader
	 * @param {XMLHttpRequest} response
	 */
	,onModelsLoad : function(loader, response) {
		this.fieldsGrid.getStore().removeAll();
		this.fieldsGrid.hide();
	}
	
	,onFieldsSelectionChange : function(sm) {
		var okBtn = this.getFooterToolbar().getComponent('pick-relation');
		sm.hasSelection() ? okBtn.enable() : okBtn.disable();
	}
	
	/**
	 * ExtJS template method
	 * @private
	 */
	,initComponent: function() {
		Ext.apply(this, Ext.apply(this.initialConfig, this._initCmp()));
		afStudio.models.RelationPicker.superclass.initComponent.apply(this, arguments);
		this._initEvents();
	}

	/**
	 * Initializes component
	 * @return {Object} The config object
	 * @private
	 */
	,_initCmp : function() {
		var _this = this;
		
		var fieldsGrid = new Ext.grid.GridPanel({			
			store: new Ext.data.JsonStore({
				autoLoad: false,
				url: _this.fieldsUrl,
				baseParams: {
					xaction: 'read'
				},
				root: 'rows',
				idProperty: 'id',    							
				fields: [
					'id', 'name', 'type', 'size', 'required'
				]
			}),
			sm: new Ext.grid.RowSelectionModel({
				singleSelect: true
			}),
			columns : [
				{header: 'Name', sortable: true, width: 150, dataIndex: 'name'},
				{header: 'Type', sortable: true, width: 110, dataIndex: 'type'},
				{header: 'Size', sortable: true, width: 60, dataIndex: 'size'}
			],
			loadMask: true,
			border: false,
			autoScroll: true,
			hidden: true,
			ref: '../fieldsGrid'
		});
		
		return {
			title: 'Relation Picker',
			iconCls: 'icon-table-relationship',
			modal: true,
			width: 600,
			height: 400,
			maximizable: true,			
			plain: true,
			layout: 'border',
			items: [
			{
				region: 'west',
				layout: 'fit',
				width: 220,
				items: [{
					id: 'models-picker',					
					xtype: 'afStudio.models.modelTree',
					url: _this.modelsUrl,
					border: false,
					ref: '../modelsTree'
				}]
			},{	
				region: 'center',
				layout: 'fit',
				items: [
					fieldsGrid
				]				
			}],
			buttons: [{
				itemId: 'pick-relation',
				text: 'ok',
				disabled: true,
				iconCls: 'icon-accept',
				handler: Ext.util.Functions.createDelegate(_this.pickRelation, _this)
			}]
		}		
	}
	
	/**
	 * Initializes events
	 * @private
	 */
	,_initEvents : function() {
		var _this      = this,
			modelTree  = this.modelsTree, 
			fieldsGrid = this.fieldsGrid,
			fgSm = fieldsGrid.getSelectionModel();
		
		_this.addEvents(
			/**
			 * @event relationpicked Fires after relation is picked
			 * @param {String} relation The picked up relation in the format model_name:model_column 
			 */
			'relationpicked'
		);
		
		modelTree.on({
			click : Ext.util.Functions.createDelegate(_this.onModelClick, _this),
			modelsload : Ext.util.Functions.createDelegate(_this.onModelsLoad, _this)			
		});
		
		fgSm.on({
			selectionchange : Ext.util.Functions.createDelegate(_this.onFieldsSelectionChange, _this)
		});
	}
	
});