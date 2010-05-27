;(function($){
  $.ModelObject = {
    ID:function(){
      return this._original_attributes['id'];
    },
    _updated_attributes: function(){
      var result = {};
      for ( attr in this._original_attributes ){
        if(this[attr] != this._original_attributes[attr]) result[attr] = this[attr];
      }
      return result;
    },
    setAttributes: function (attributes){ 
      this._original_attributes = attributes ;
      for ( attr in attributes ){
        this[attr] = attributes[attr];
      }

      return attributes ;
    },
    changed : function(){
      for ( attr in this._updated_attributes() ){
        return true;
      }
      return false;
    },
    save: function(callback){
      this._model.update(this.ID(), this._updated_attributes(), callback);
    },
    reload: function(callback){
      var this_object = this;
      this._model.find(this.ID(), function(reloaded_object){
        this_object.setAttributes(reloaded_object._original_attributes);
        if( typeof callback == "function") callback(this_object);
      });
    },

    delete: function(callback){
      this_object = $(this);
      this._model.delete(this.ID(), function(){
        if( typeof callback == "function") callback(this_object);
      });
    }
  };

  $.Model = {
    resource: function(model_name){
      $[model_name.classify()] = $.extend({}, $.Model, {
        _singular: model_name.singularize().underscore(),
        _show_url: '/' + model_name.pluralize().underscore() + '/{id}.json',
        _update_url: '/' + model_name.pluralize().underscore() + '/{id}.json',
        _create_url: '/' + model_name.pluralize().underscore() + '.json',
        _delete_url: '/' + model_name.pluralize().underscore() + '/{id}.json'
      });
    },
    create: function(attributes, callback){
      var result = $.extend({}, $.ModelObject);
      var model = this;
      result._model = model;
      var options = {};
      options[this._singular] = attributes; 

      $.Create(this._create_url, options, function(data){ 
      result.setAttributes(data[model._singular]); 
      if( typeof callback == "function") callback(result);
    });
    return result;
  },
    find: function(id, callback){
      var result = $.extend({}, $.ModelObject);
      var model = this;
      result._model = model;

      $.Read(this._show_url, {id: id}, function(data){ 
      result.setAttributes(data[model._singular]); 
      if( typeof callback == "function") callback(result);
    });
    return result;
  },
update: function(id, attributes, callback){ var options = {id: id}; options[this._singular] = attributes; $.Update(this._update_url, options, {dataType: 'text', success: callback});},
delete: function(id, callback){ $.Delete(this._delete_url, {id: id}, {dataType: 'text', success: callback});},

  }

})(jQuery);