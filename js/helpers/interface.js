/**
 * Created by garffan on 10/15/13.
 */


function fixTableWidth(view){
    view.find('.scrollable').css('top', view.find('.table.head').outerHeight(true));
}

function showError(error) {
    $('.error-block').text(error).show();
}


var properties = {
    id: 'Номер',
    subdepartmentId: 'Код подразделения',
    universityDepartmentId: 'Код факультета',
    displayName: 'Имя пользователя',
    typeId: 'Тип заявки',
    phone: 'Телефон'
};