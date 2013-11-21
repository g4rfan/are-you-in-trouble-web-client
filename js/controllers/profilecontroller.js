/**
 * Created by garffan on 11/9/13.
 */

function profileCntrl ($scope, $compile, networkManager, profileProvider) {
    $scope.profile = profileProvider.getProfiles();
    $scope._domRef = $('.opened-profile');

    $scope.openProfile = function () {
        $('.login-menu').hide();
        var scope = $scope.$new();

        scope.data = $scope.profile[0];

        scope.parseDate = $scope.parseDate;

        scope.dictRoles = {
            "client" : "Клиент",
            "helper" : "Помощник",
            "subdepartment chief" : "Начальник подразделения",
            "department chief" : "Начальник службы"
        };

        scope.editProfile = function () {
            $scope._domRef.find('.edit-view').hide();
            $scope._domRef.find('.edit-field').show();
            $scope._domRef.find('.edit-button').removeClass('glyphicon-pencil').addClass('glyphicon-floppy-disk').off()
                .on('click', function () {
                    scope.saveChanges('data');
                });
        };

        scope.selfEdit = true;

        scope.saveChanges = function (type) {
            if (type == 'data') {
                networkManager.request('profiles:save', { id : scope.data.id, displayName : scope.data.displayName, phone : scope.data.phone || '' }, function (data) {
                    scope.data.updatedAt = data.updatedAt;
                    scope.data.role = data.role;
                    scope.$digest();
                    $scope.$digest();

                    $scope._domRef.find('.edit-view').show();
                    $scope._domRef.find('.edit-field').hide();
                    $scope._domRef.find('.edit-button').removeClass('glyphicon-floppy-disk').addClass('glyphicon-pencil').off()
                        .on('click', function () {
                            scope.editProfile();
                        });
                });
            }
        };

        var nElement = $compile(TemplateStorage.templates['profile'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);

        $scope._domRef.css({
            top : $(window).height() / 2 - 125,
            left : document.body.clientWidth / 2 - 330
        }).show();

        $scope._domRef.find('.edit-button').on('click', function () {
            scope.editProfile();
        });

        $('.close-button', $scope._domRef).on('click', function () {
            $scope._domRef.hide();
            $('.blackout').hide();
        });

        $('.blackout').show();
    };

    $scope.parseDate = function (date) {
        return $.timeago(date);
    };

    profileProvider.events.addEventListener('got profile', function () {
        $scope.profile = profileProvider.getProfiles();
        $scope.$digest();
    });

    globalEvents.addEventListener('login', function () {
        profileProvider.getProfilesFromServer();
        $scope.$digest();
    });
}