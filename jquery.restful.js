;(function($){
  /////////////////////////////////////////////////////////////////////////////
  // BaseModel
  // Abstract class: define "prototype.singular"

  BaseModel = function(attrs){
    this.attributes = attrs || {};

    this.destroy = function(callback){
      $.Delete(this.delete_url(), {id: this.attributes.id}, {dataType: 'text', success: callback});
    };
    
    this.is_new = function(){ return $.is_blank(this.attributes.id) || (parseInt(this.attributes.id) == 0) };

    this.reload = function(callback){
      if(!this.is_new()){
        
        this.find(this.attributes.id, function(obj){
          this.attributes = obj.attributes;
          if($.isFunction(callback)) callback(this);
        }.bind(this))
      }
    };

    this.save = function(callback){
      attrs = {id: this.attributes.id};
      attrs[this.singular] = this.attributes; 

      // dataType=text because of empty request
      $.Update(this.update_url(), attrs, { dataType: 'text', 
        success: function(){
          this.reload(callback);
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

  BaseModel.prototype.find = function(id, callback){
    var obj = new this.constructor();
    $.Read(this.show_url(), {id: id}, function(data){ 
      obj.attributes = $.extend({id: id}, data[this.singular]); 
      if($.isFunction(callback)) callback(obj);
    }.bind(this));

    return obj;
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

  })(jQuery);
