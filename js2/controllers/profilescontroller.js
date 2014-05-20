/**
 * Created by garffan on 10/2/13.
 */

function profilesCtrl($scope, $rootScope, $compile, networkManager, profileProvider, profilesProvider, universityDepProvider, filtersProvider, subDepartProvider) {
    $scope.profiles = profilesProvider.getProfiles();
    $scope.me = profileProvider.getProfiles();
    $scope.uniDeps = universityDepProvider.getUniversityDep();
    $scope.subDeps = subDepartProvider.getSubDeps();
    $scope.filters = filtersProvider.getFilters();
    $scope.selectedFilters = {};

    $scope._domRef = $('.opened-profile');

    $scope.getSubDep = function (subDepId) {
        var subDep = null;
        for (var i = 0; i < $scope.subDeps.length; ++i) {
            if ($scope.subDeps[i].id == subDepId) {
                subDep = $scope.subDeps[i];
                break;
            }
        }

        return subDep ? subDep.name: '-';
    };

    $scope.getUniDep = function (uniDepId) {
        var uniDep = null;
        for (var i = 0; i < $scope.uniDeps.length; ++i) {
            if ($scope.uniDeps[i].id == uniDepId) {
                uniDep = $scope.uniDeps[i];
                break;
            }
        }

        return uniDep ? uniDep.name: '-';
    };

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName == 'profiles') {
            profilesProvider.getProfilesFromServer(true);
            $('.view.active').removeClass('active');
            $('.view.profiles').addClass('active');
            $scope.$digest();
            setTimeout(function () { fixTableWidth($('.view.profiles')); }, 40);
        }
    });

    $rootScope.$on('profiles-list-changes', function () {
        $scope.$digest();
        setTimeout(function () { fixTableWidth($('.view.profiles')); }, 40);
    });

    $scope.openProfile = function (profileId) {
        var i = 0, len = $scope.profiles.length, profile = null;
        while (i < len) {
            if ($scope.profiles[i].id == profileId) {
                profile = $scope.profiles[i];
                break;
            }
            ++i;
        }

        var scope = $scope.$new();
        scope.data = profile;

        scope.profile = $scope.me;

        scope.subDeps = $scope.subDeps;
        scope.uniDeps = $scope.uniDeps;

        scope.parseDate = $scope.parseDate;

        scope.roles = [
            { id: 1, name: "Клиент" },
            { id: 2, name: "Помощник" },
            { id: 3, name: "Начальник подразделения" },
            { id: 4, name: "Начальник службы" }
        ];

        scope.dictRoles = {
            "client": "Клиент",
            "helper": "Помощник",
            "subdepartment chief": "Начальник подразделения",
            "department chief": "Начальник службы"
        };

        scope.selectedRole = 0;
        scope.selectedSubDep = 0;

        scope.removeProfile = function () {
            networkManager.request('profiles:remove', { profileId: profileId }, function() {
                for (var i = 0; i < $scope.profiles.length; ++i) {
                    if ($scope.profiles[i].id == profileId) {
                        $scope.profiles.splice(i, 1);
                        break;
                    }
                }
                $scope.$digest();
                setTimeout(function () { fixTableWidth($('.view.profiles')); }, 40);
                $('.opened-profile, .blackout').hide();
            });
        };

        scope.editProfile = function () {
            $scope._domRef.find('.edit-view').hide();
            $scope._domRef.find('.edit-field').show();
            $scope._domRef.find('.edit-button').removeClass('glyphicon-pencil').addClass('glyphicon-floppy-disk').off()
                .on('click', function () {
                    scope.saveChanges('data');
                });
        };

        scope.saveChanges = function (type) {
            if (type == 'role') {
                if (scope.selectedRole < 1) { showError("Ошибка: выберите роль"); return; }
                if (scope.selectedRole == 1) {
                    if (!scope.selectedUniDep || scope.selectedUniDep < 1) { showError("Ошибка: выберите факультет"); return; }
                    networkManager.request('profiles:make client', { userId: profileId, universityDepartmentId: scope.selectedUniDep }, function (data) {
                        profile.subdepartmentId = -1;
                        profile.universityDepartmentId = data.universityDepartmentId;
                        profile.role = data.role;
                        profile.updatedAt = data.updatedAt;
                        scope.$digest();
                        $scope.$digest();
                    });
                } else {
                    if (scope.selectedRole != 4) {
                        if (!scope.selectedSubDep || scope.selectedSubDep < 1) { showError("Ошибка: выберите отдел"); return; }
                        networkManager.request('profiles:make helper', { userId: profileId, chief: scope.selectedRole == 3, subdepartmentId: scope.selectedSubDep }, function (data) {
                            profile.subdepartmentId = data.subdepartmentId;
                            profile.universityDepartmentId = -1;
                            profile.role = data.role;
                            profile.updatedAt = data.updatedAt;
                            scope.$digest();
                            $scope.$digest();
                        });
                    } else {
                        networkManager.request('profiles:make department chief', { userId: profileId }, function (data) {
                            profile.subdepartmentId = -1;
                            profile.universityDepartmentId = -1;
                            profile.role = data.role;
                            profile.updatedAt = data.updatedAt;
                            scope.$digest();
                            $scope.$digest();
                        });
                    }
                }
            }

            if (type == 'role') {
                $('.edit-role').show();
                $('.role-edit').hide();
                $scope._domRef.css('height', $scope._domRef.height() - 80);
            }

            if (type == 'data') {
                networkManager.request('profiles:save', { id: profileId, displayName: scope.data.displayName, phone: scope.data.phone || '' }, function (data) {
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
            top: $(window).height() / 2 - 125,
            left: document.body.clientWidth / 2 - 330
        }).show();

        $('.close-button', $scope._domRef).on('click', function () {
            $scope._domRef.hide();
            $('.blackout').hide();

            if ($scope._domRef.find('.edit-role').css('display') == 'none') {
                $scope._domRef.css('height', $scope._domRef.height() - 80);
            }
        });

        $scope._domRef.find('.edit-button').on('click', function () {
            scope.editProfile();
        });

        $scope._domRef.find('.edit-role').on('click', function () {
            $(this).hide();
            $('.role-edit').show();
            $scope._domRef.css('height', $scope._domRef.height() + 100);
        });
        $('.blackout').show();
    };

    $scope.parseDate = function (date) {
        var today = moment(new Date());
        var target = moment(date);
        if (target.isSame(today, 'day')) {
            return 'Сегодня'
        } else {
            return target.format('DD.MM.YYYY');
        }
    };

    filtersProvider.events.addEventListener('filters set changed', function (event) {
        if (event.sender == 'tasks') return;

        var data = event.selectedFilters;

        var params = {};

        var udi = [], sdi = [];

        for (var key in data.universityDep) {
            udi.push(key);
        }

        for (var key in data.subDeps) {
            sdi.push(key);
        }

        params.filters = {};
        var isEmpty = true;
        if (udi.length != 0) {
            params.filters.universityDepartmentId = udi;
            isEmpty = false;
        }

        if (sdi.length != 0) {
            params.filters.subdepartmentId = sdi;
            isEmpty = false;
        }
        $scope.selectedFilters = params;

        profilesProvider.getProfilesFromServer(true, isEmpty ? null: params);
    });

    filtersProvider.events.addEventListener('filters got', function (data) {
        $scope.filters = filtersProvider.getFilters();
    });

    $('.view.profiles .scrollable').on('scroll', function() {
        if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight - 50) {
           console.log('DOWNLOAD');
	    $scope.selectedFilters.limit = profilesProvider.limit;
            $scope.selectedFilters.offset = profilesProvider.offset;

            console.log("PARAMP %o", $scope.selectedFilters);

            profilesProvider.getProfilesFromServer(false, $scope.selectedFilters, function (data) {
                $scope.$digest();
            });
        }
    });

    globalEvents.addEventListener('login', function () {
        universityDepProvider.getUniversityDepFromServer();
        subDepartProvider.getSubDepartFromServer();
        profilesProvider.getProfilesFromServer(true);
        filtersProvider.getFiltersFromServer();
        profileProvider.getProfilesFromServer();
        $scope.$digest();
    });
}
