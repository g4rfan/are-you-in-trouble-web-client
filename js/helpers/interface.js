/**
 * Created by garffan on 10/15/13.
 */


function fixTableWidth(view){
    var headers = view.find('table.head th'),
        cols = view.find('table:not(.head) tr:first-child td');

    headers.each(function (ind, header) {
        $(header).width($(cols[ind]).width());
    });

    view.find('.scrollable').css('top', view.find('.table.head').outerHeight(true));
}