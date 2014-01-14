/**
 * Created by garffan on 11/9/13.
 */


function subDepsCntrl ($scope, $compile, networkManager, subDepartProvider) {
    $scope.subDeps = subDepartProvider.getSubDeps();
    $scope._domRef = $('.opened-subdep');

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName == 'subdeps') {
            subDepartProvider.getSubDepartFromServer();
            $('.view.active').removeClass('active');
            $('.view.subdeps').addClass('active');
            $scope.$digest();
        }
    });

    $scope.save = function (subDepId) {
        var params = {};

        if (subDepId) {
            params.id = subDepId;
            for (var i = 0; i < $scope.subDeps.length; ++i) {
                if ($scope.subDeps[i].id == subDepId) {
                    params.name = $scope.subDeps[i].name;
                    break;
                }
            }
        } else {
            params.name = $('.new-subdep textarea').val()
        }

        networkManager.request('subdepartments:save', params, function (data) {
            if (!subDepId) {
                subDepartProvider.insert(data);
                $scope.$digest();
            }
        });

        $('.new-subdep textarea').val('');
        $('.new-subdep, .blackout').hide();
    };


    $scope.openSubDep = function (subDepId) {
        var i = 0, len = $scope.subDeps.length, task = null;
        while (i < len) {
            if ($scope.subDeps[i].id == subDepId) {
                task = $scope.subDeps[i];
                break;
            }
            ++i;
        }
        var scope = $scope.$new();
        scope.data = task;

        var nElement = $compile(TemplateStorage.templates['subdep'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);
        $scope._domRef.css({
            top: $(window).height() / 2 - 100,
            left: document.body.clientWidth / 2 - 150
        }).show();

        scope.saveSubDep = function () {
            $scope.save(subDepId);
            $('.opened-subdep, .blackout').hide();
        };

        $scope._domRef.find('.close-button').on('click', function (event) {
            $('.opened-subdep, .blackout').hide();
        });

        $('.blackout').show();
    };



    globalEvents.addEventListener('login', function (data) {
        subDepartProvider.getSubDepartFromServer();
        $scope.$digest();
    });
}
