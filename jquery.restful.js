/////////////////////////////////////////////////////////////////////////////
// BaseModel
// Abstract class: defines "prototype.singular"

BaseModel = function(attrs){
  this.attributes = attrs || {};
  this.after_update_callbacks = [];
  this.after_destroy_callbacks = [];

  this.id = function(){
    return this.attributes.id;
  }

  this.create = function(attributes, options){
    var default_options = {
      success: $.noop,
      error: $.noop
    };

    if(options == null) options = default_options;
    if(attributes == null) attributes = {};

    attrs = {};
    attrs[this.singular] = attributes;


    options = options || {};
    if($.isFunction(options)){
      options = $.extend({}, default_options, {success: options});
    } else {
      options = $.extend({}, default_options, {success: options.success, error: options.error});
    }

    var obj = new this.constructor();
    // TODO: replace with $.ajax
    $.Create(this.create_url(), attrs, { dataType: 'json',
      success: function(data){
        obj.attributes = $.extend({}, data[this.singular]);
        options.success(obj);
      }.bind(this),
      error: options.error
    });

    return obj;
  };

  this.destroy = function(callback){
    // TODO: replace with $.ajax
    $.Delete(this.delete_url(), {id: this.id()}, {dataType: 'text', success: function(){
      this.after_destroy();
      if($.isFunction(callback)) callback(this);
    }.bind(this)});
  };

  this.is_new = function(){ return is_blank(this.id()) || (parseInt(this.id()) == 0) };

  this.reload = function(options){
    if(!this.is_new()){
      var default_options = {
        success: $.noop,
        error: $.noop
      };
      if(options == null) options = default_options;

      if($.isFunction(options)){
        options = $.extend({}, default_options, {success: options});
      } else {
        options = $.extend({}, default_options, {success: options.success, error: options.error});
      }

      this.find(this.id(), {
        success: function(obj){
          this.attributes = obj.attributes;
          options.success(this);
        }.bind(this),
        error: options.error,
        cache: false
      })
    }
  };

  this.save = function(options){
    var default_options = {
      success: $.noop,
      error: $.noop
    };

    attrs = {id: this.id()};
    attrs[this.singular] = this.attributes;


    options = options || {};
    if($.isFunction(options)){
      options = $.extend({}, default_options, {success: options});
    } else {
      options = $.extend({}, default_options, {success: options.success, error: options.error});
    }

    // dataType=text because of empty request
    // TODO: replace with $.ajax
    $.Update(this.update_url(), attrs, { dataType: 'text',
      success: function(){
        this.reload({
          success: function(obj){
            options.success(obj);
            this.after_update();
          }.bind(this)
        });

      }.bind(this),
      error: options.error
    });
  };
};


// Static methods

// Routes
BaseModel.prototype.create_url = function(){ return '/' + this.singular.pluralize().underscore() + '.json'; };
BaseModel.prototype.delete_url = function(){ return '/' + this.singular.pluralize().underscore() + '/{id}.json'; };
BaseModel.prototype.list_url = function(){ return '/' + this.singular.pluralize().underscore() + '.json'; };
BaseModel.prototype.show_url = function(){ return '/' + this.singular.pluralize().underscore() + '/'+this.id()+'.json'; };
BaseModel.prototype.update_url = function(){ return '/' + this.singular.pluralize().underscore() + '/{id}.json'; };

BaseModel.prototype.find = function(id, options){
  var default_options = {
    success: $.noop,
    error: $.noop,
    cache: false
  };

  if($.isFunction(options)){
    options = $.extend(default_options, {success: options});
  } else {
    options = $.extend(default_options, options);
  }

  if(options.cache){
    attrs = {id: id};
  } else {
    attrs = {id: id, r: Math.random()};
  }


  var obj = new this.constructor();
  $.ajax({url: this.show_url(),
    data: attrs,
    success: function(data){
      data = $.parseJSON(data);
      obj.attributes = $.extend({id: id}, data[this.singular]);
      options.success.call(this, obj);
    }.bind(this),
    error: options.error,
    dataType: "text",
    type: "GET"
  });

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
// Routines

window.is_defined = function(obj){
  return typeof(obj) != "undefined";
}
window.is_def = is_defined;

window.is_blank = function(obj){
  return !is_def(obj) || obj == null || obj == "";
}

Function.prototype.bind = function (scope) {
  var fn = this;
  return function () {
    return fn.apply(scope, arguments);
  };
};
