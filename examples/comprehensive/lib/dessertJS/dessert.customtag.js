!function(){"use strict";define(["./dessert.common"],function(t){function e(e){this.renderAs=t.utils.emptyString,this.renderAsValue=t.utils.emptyString,this.name=t.utils.emptyString,this.tag=t.utils.emptyString,this.replaceWith=t.utils.emptyString,Object.assign(this,e)}var r=t.attrs,n="CUSTOM_TAG_LITERAL",s={create:function(t){return new e(t)},isCustomTag:function(t){return t instanceof e},types:{externalModule:t.attrs.src,control:t.attrs.control,component:t.attrs.component,literal:n},init:function(e){var n,s=null;e.providers.jquery&&(s=e.providers.jquery),e&&e.getCustomTags&&e.getCustomTags().forEach(function(e){n=s(e.tag),n.each(function(){var n,i,a,o=e.replaceWith.trim().length>0?e.replaceWith:"<div></div>",c=["id"];switch(n=s(this),i=s(o),i.attr(e.renderAs,e.renderAsValue),e.renderAs){case r.component:c.length=0;break;case r.src:break;case r.control:i.attr(e.renderAs,n.prop("id"))}a=t.utils.shareElementAttrs(n,i,c),n.replaceContent(i)})})}};return s})}();