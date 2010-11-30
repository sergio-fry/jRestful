/////////////////////////////////////////////////////////////////////////////
// BaseModel
// Abstract class: defines "prototype.singular"

BaseModel = function(attrs){
  this.attributes = attrs || {};
  this.after_update_callbacks = [];
  this.after_destroy_callbacks = [];

  this.destroy = function(callback){
    $.Delete(this.delete_url(), {id: this.attributes.id}, {dataType: 'text', success: function(){
      this.after_destroy();
      if($.isFunction(callback)) callback(this);
    }.bind(this)});
  };

  this.is_new = function(){ return $.is_blank(this.attributes.id) || (parseInt(this.attributes.id) == 0) };

  this.reload = function(callback){
    if(!this.is_new()){

      this.find(this.attributes.id, function(obj){
        this.attributes = obj.attributes;
        if($.isFunction(callback)) callback(this);
      }.bind(this), true)
    }
  };

  this.save = function(callback){
    attrs = {id: this.attributes.id};
    attrs[this.singular] = this.attributes; 

    // dataType=text because of empty request
    $.Update(this.update_url(), attrs, { dataType: 'text', 
      success: function(){
        async.series([
          function(callback){
            this.reload(callback);
          }.bind(this)
        ], function(){
          this.after_update();
          if($.isFunction(callback)) callback(this);
        }.bind(this));
      }.bind(this) 
    });
  };
};


// Static methods

// Routes
BaseModel.prototype.create_url = function(){ return '/' + this.singular.pluralize().underscore() + '.json'; };
BaseModel.prototype.delete_url = function(){ return '/' + this.singular.pluralize().underscore() + '/{id}.json'; };
BaseModel.prototype.list_url = function(){ return '/' + this.singular.pluralize().underscore() + '.json'; };
BaseModel.prototype.show_url = function(){ return '/' + this.singular.pluralize().underscore() + '/{id}.json'; };
BaseModel.prototype.update_url = function(){ return '/' + this.singular.pluralize().underscore() + '/{id}.json'; };

BaseModel.prototype.find = function(id, callback, do_not_cache){
  if(is_def(do_not_cache) && do_not_cache){
    attrs = {id: id, r: Math.random()};
  } else {
    attrs = {id: id};
  }

  var obj = new this.constructor();
  $.Read(this.show_url(), attrs, function(data){ 
    obj.attributes = $.extend({id: id}, data[this.singular]); 
    if($.isFunction(callback)) callback(obj);
  }.bind(this));

  return obj;
};

// Callbacks
BaseModel.prototype.after_update = function(callback){
  if($.isFunction(callback)){
    this.after_update_callbacks.push(callback)
  } else {
    async.parallel(this.after_update_callbacks);
  }
};

BaseModel.prototype.after_destroy = function(callback){
  if($.isFunction(callback)){
    this.after_destroy_callbacks.push(callback)
  } else {
    async.parallel(this.after_destroy_callbacks);
  }
};

// Generator
// Usage:
// BaseModel.prototype.generate_resource("order");

BaseModel.prototype.generate_resource = function(singular){
  var model_class = function(attributes){};

  model_class.prototype = new BaseModel;
  model_class.prototype.singular = singular;
  model_class.prototype.constructor = model_class;

  window[singular.classify()] = model_class;
}

/////////////////////////////////////////////////////////////////////////////
