/*globals define*/
define(function(require, exports, module) {
    'use strict';
    var $ = require('jquery');

    var serializeFormToJSON = function(form) {
       var o = {};
       var a = $(form).serializeArray();
       $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
               o[this.name].push(this.value || '');
           }
           else {
               o[this.name] = this.value || '';
           }
       });
       return o;
    };

    return {
        serializeFormToJSON: serializeFormToJSON
    };

});
