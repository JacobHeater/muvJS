!function(){"use strict";define(["./dessert.ajax","./dessert.common","./dessert.databinding"],function(e,n,t){var r=n.selectors;return function(n,i){var a=null,o=null;return i.providers.IDataBindingProvider&&(o=i.providers.IDataBindingProvider),i.providers.jquery&&(a=i.providers.jquery,e.jquery=a),function(d,p,c){var f,u,s,l,h,v,m=[],g=Object.assign({clear:!0},c),y=function(e){var r=e.map(function(e){return a("<div />").append(a(e).clone()).html()}).join("");g.clear===!0&&n.children().remove(),r=t.cleanupDeferredAttrs(r),n.append(l?l.append(r):r),"function"==typeof g.done&&g.done()};if(d&&d.length)if(f=function(e){for(var n=0;n<d.length;n++)e(d[n])},u=o.bindTemplateToData,"string"==typeof p)s=p,l="",h=a(s),1===h.find(r.rpt).length&&(s=h.find(r.rpt).eq(0).html(),h.find(r.rpt).remove(),l=h),f(function(e){v=u(s,e),m.push(v)}),y(m);else if("object"==typeof p){var j=i.cache.templateCache.getEntry(p.path),q=function(e){s=e,l="",h=a(s),1===h.find(r.rpt).length&&(s=h.find(r.rpt).eq(0).html(),h.find(r.rpt).remove(),l=h),f(function(e){v=u(s,e),m.push(v)}),y(m)};j?q(j):e.get(p.path).then(function(e){i.cache.templateCache.addEntry(p.path,e),q(e)})}return this}}})}();