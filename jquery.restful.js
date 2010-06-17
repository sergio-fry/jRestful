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
        _list_url: '/' + model_name.pluralize().underscore() + '.json',
        _update_url: '/' + model_name.pluralize().underscore() + '/{id}.json',
        _create_url: '/' + model_name.pluralize().underscore() + '.json',
        _delete_url: '/' + model_name.pluralize().underscore() + '/{id}.json'
      });
    },
    create: function(attributes, callback){
      if($.isFunction(attributes)){
        callback = attributes;
        attributes = {};
      }
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
    findFirst: function(attributes, callback){
      if($.isFunction(attributes)){
        callback = attributes;
        attributes = {};
      }
      var result = {};
      this.findAll(attributes, function(collection){
        result = $.extend(result, (collection.length > 0) ? collection[0] : {});
        if( typeof callback == "function") callback(result);
      });
      return result;
    },
    findAll: function(attributes, callback){
      if($.isFunction(attributes)){
        callback = attributes;
        attributes = {};
      }
      var collection = new Array();
      
      var model = this;
      var item_template = $.extend({}, $.ModelObject);
      item_template._model = model;
      
      $.Read(this._list_url, attributes, function(data){ 
        for ( row in data ) {
          item = $.extend({}, item_template);
          item.setAttributes(data[row][model._singular]); 
          collection[collection.length] = item;
        }
        if( typeof callback == "function") callback(collection);
      });
      return collection;
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
    update: function(id, attributes, callback){ 
      if($.isFunction(attributes)){
        callback = attributes;
        attributes = {};
      }
      var options = {id: id}; 
      options[this._singular] = attributes; 
      $.Update(this._update_url, options, {
        dataType: 'text', 
        success: callback
        });
      },
    delete: function(id, callback){ 
      $.Delete(this._delete_url, {id: id}, {dataType: 'text', success: callback});
    },
    deleteAll: function(attributes, callback){ 
      if($.isFunction(attributes)){
        callback = attributes;
        attributes = {};
      }
      var model = this;
      this.findAll(attributes, function(collection){
        for (row in collection){
          $.Delete(model._delete_url, {id: collection[row].ID()}, {dataType: 'text', success: callback});
        }
      });
    }
    
  }
  
  })(jQuery);
