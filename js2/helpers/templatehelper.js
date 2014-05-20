/**
 * Created by garffan on 10/3/13.
 */

var TemplateStorage = {
    templates: {},

    getTemplate: function (templateName, callback) {
        var self = this;
        if (templateName in this.templates) {
            callback(this.templates[templateName]);
            return;
        }

        $.ajax({
            url: '/static/templates/' + templateName + '.html',
            type: 'get',
            success: function (data) {
                self.templates[templateName] = data;
                if (callback) {
                    callback(data);
                }
            }
        });
    }
};