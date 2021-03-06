angular.module('gametoolsprovincelistitem.component')
.controller('GameToolsProvinceListItemController', ['$scope', function($scope) {
    var vm = this,
        order;

    vm.$onInit = function() {
        vm.renderOrderSymbol = renderOrderSymbol;
        vm.renderOrderTarget = renderOrderTarget;
        vm.renderActionOfTarget = renderActionOfTarget;
        vm.renderOrderTargetOfTarget = renderOrderTargetOfTarget;
        vm.renderResolution = renderResolution;
        vm.renderExtraInfo = renderExtraInfo;

        order = vm.service.getOrderForProvince(vm.province.Province);

        // Process only unstripped orders.
        if (order)
            order = order.Properties.Parts;

        // Keep an eye out for changes to this province's orders.
        $scope.$watchCollection(function() {
            var orderTest = vm.service.getOrderForProvince(vm.province.Province);
            return _.isUndefined(orderTest) ? undefined : orderTest.Properties.Parts;
        }, function(newOrder) {
            if (newOrder)
                order = newOrder;
        });
    };

    function renderOrderSymbol() {
        if (!order)
            return '';

        switch (order[1]) {
        case 'Move':
        case 'MoveViaConvoy': return '⇒';
        case 'Support': return 'supports';
        case 'Hold': return 'holds';
        case 'Convoy': return 'convoys';
        case 'Disband': return 'disbands';
        case 'Build':
            if (order[2] === 'Army')
                return 'builds an army';
            else
                return 'builds a fleet';
        default: return '';
        }
    }

    function renderOrderTarget() {
        if (!order || order.length < 3 || order[1] === 'Build')
            return '';
        return order[2].toUpperCase();
    }

    function renderOrderTargetOfTarget() {
        if (!order || order.length < 4)
            return '';

        if (order[2] === order[3])
            return '';
        return order[3].toUpperCase();
    }

    function renderActionOfTarget() {
        if (!order || order.length < 4)
            return '';

        if (!this.renderOrderTargetOfTarget() && order[1] !== 'Support')
            return '';
        if (order[2] === order[3])
            return 'hold';
        return '⇒';
    }

    function renderResolution() {
        var phase = vm.service.getCurrentPhase(),
            resolution;
        // Nothing to render.
        if (!phase.Resolutions)
            return null;

        resolution = _.find(phase.Resolutions, ['Province', vm.province.Province]);

        return resolution ? processResolutionCode(resolution.Resolution) : '';
    }

    function processResolutionCode(code) {
        var split;
        // 'OK' is not worth showing.
        if (code === 'OK')
            return null;
        if (code.indexOf('ErrBounce') > -1) {
            split = code.split(':');
            return 'Bounced against ' + split[1].toUpperCase();
        }

        return code;
    }

    function unitIsDislodged() {
        var currentPhase = vm.service.getCurrentPhase();
        return currentPhase.Type === 'Movement' && _.some(currentPhase.Dislodgeds, { Province: vm.province.Province });
    }

    function renderExtraInfo() {
        var thingsToNote = [];

        if (unitIsDislodged())
            thingsToNote.push('dislodged');

        return thingsToNote.length ? '(' + thingsToNote.join(', ') + ')' : '';
    }
}]);
