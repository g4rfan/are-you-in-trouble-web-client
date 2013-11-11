/**
 * Created by garffan on 10/15/13.
 */


function fixTableWidth(view){
    /*var headers = view.find('table.head th'),
        cols = view.find('table:not(.head) tr:first-child td');

    headers.each(function (ind, header) {
        $(header).width($(cols[ind]).width());
    });*/

    /*var headers = view.find('table.head th');
    var width = document.body.clientWidth - 120 - 300;
    var rows = view.find('table:not(.head) tr');



    headers.each(function (indh, header) {
        var widthCol = width * (parseInt($(header).attr('data-perc'))/100);
        rows.each(function (indr, row) {
            var col = $(row).find('td')[indh];
            //$().css('width', widthCol).css('max-width', widthCol);
            col.style.width = '';
            col.style.maxWidth = widthCol + 'px';
            col.style.width = widthCol + 'px';

        });
        $(header).width(widthCol);
    }); */

    view.find('.scrollable').css('top', view.find('.table.head').outerHeight(true));
}