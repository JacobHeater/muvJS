define(['./muv.common'], function(common) {
    var selectors = common.selectors;
    var attrs = common.attrs;
    return {
        bindTemplate: function(template, data) {
            var regex = /\{\{[\w\d\s+()!@#$%^&*:;<>,."'\\/_-]+\}\}/gmi;
            var brackets = /\{|\}/gm;
            var fnCall = /[\w\d_]+\(/gmi;
            var rpt = "";
            var matches = template.match(regex);
            var tmpl = template;
            var $tmpl = $(tmpl);
            var inner = $tmpl.find(selectors.rpt).length > 0 ? $this.outerHtml($tmpl.find(selectors.rpt)) : tmpl;
            var $output;
            var placeholder;
            var stripped;
            var trimmed;
            var fns;
            var value;
            var replacable;
            for (var m = 0; m < matches.length; m++) {
                placeholder = matches[m];
                stripped = placeholder.replace(brackets, '');
                trimmed = stripped.trim();
                fns = trimmed.match(fnCall);
                value = "";
                if (fns === null) {
                    value = (function() {
                        return eval(trimmed);
                    }).call(data);
                }
                inner = inner.replace(placeholder, value);
            }
            $output = $(inner).removeAttr(attrs.rpt)[0];
            replaceable = $tmpl.find(selectors.rpt);
            replaceable.replaceWith($output);
            $output = replaceable.length > 0 ? $tmpl : $output;
            return $output;
        }
    };
})