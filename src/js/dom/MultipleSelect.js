$package("js.dom");

js.dom.MultipleSelect = function(ownerDoc, node) {
	$assert(this instanceof js.dom.MultipleSelect, "js.dom.MultipleSelect#MutipleSelect", "Invoked as function.");
	this.$super(ownerDoc, node);
};

js.dom.MultipleSelect.prototype = {
	setValue : function(values) {
		var options = this._node.options;
		for (var i = 0; i < options.length; i++) {
		    options[i].selected = values.indexOf(options[i].value) >= 0;
		}
	},

	getValue : function() {
		return this._getOptions().map(function(option) {
			return option.value;
		});
	},

	getObject : function() {
		return this._getOptions().map(function(option) {
			return option.data;
		});
	},

	_getOptions : function() {
		var idx, option, options = [];

		for (idx = 0; idx < this._node.options.length; ++idx) {
			option = this._node.options[idx];
			if (option.selected) {
				options.push({
					value : option.value,
					text : option.text,
					data : this._dataMap[option.value]
				});
			}
		}
		return options;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.MultipleSelect";
	}
};
$extends(js.dom.MultipleSelect, js.dom.Select);
