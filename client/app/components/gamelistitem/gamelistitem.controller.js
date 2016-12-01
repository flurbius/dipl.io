/* global humanizeDuration */
angular.module('gamelistitem.component')
.controller('GameListItemController', ['gameService', '$mdDialog', '$mdPanel', '$state',
function(gameService, $mdDialog, $mdPanel, $state) {
    this.game = this.game.Properties;
    var vm = this,
        timeUntilDeadline,
        currentPhase;
    gameService.getPhases(vm.game.ID)
    .then(function(phases) {
        vm.phases = phases.Properties;
        currentPhase = _.last(vm.phases);
    });

    vm.reasonForNoJoin = reasonForNoJoin;
    vm.showJoinDialog = showJoinDialog;
    vm.goToGame = goToGame;
    vm.showDetailsDialog = showDetailsDialog;

    if (!vm.game.Finished) {
        if (!vm.game.Started) {
            // TODO: Replace 0 with variant player count.
            vm.phaseDescription = '(Not started: waiting on ' + (0 - vm.game.Members.length) + ' more players)';
        }
        else if (vm.game.Started && currentPhase) {
            timeUntilDeadline = new Date(currentPhase.DeadlineAt).getTime() - new Date().getTime();
            vm.phaseDescription = currentPhase.Season + ' ' + currentPhase.Year;
            vm.readableTimer = humanizeDuration(timeUntilDeadline, { largest: 2, round: true });
        }
    }
    else {
        vm.phaseDescription = 'Finished';
        vm.readableTimer = 'Finished';
    }

    // PRIVATE FUNCTIONS

    function reasonForNoJoin() {
        // Breaking this down into individual rules to avoid one monstrous if() statement.

        // User belongs to game already, whether as GM or user.
        if (gameService.isPlayer(vm.game))
            return 'You already are a player in this game.';

        return null;
    }

    function goToGame() {
        $state.go('games.view', { id: vm.game.ID });
    }

    function showJoinDialog(event) {
        var confirm = $mdDialog.confirm()
                        .title('Really join?')
                        .textContent('Are you sure you want to join this game? By clicking OK you are agreeing to participate to the best of your ability. See the FAQ and Community Guidelines for details.')
                        .ariaLabel('Really join game?')
                        .targetEvent(event)
                        .ok('Join')
                        .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            gameService.joinGame(vm.game, { })
            .then(function() {
                $state.go('profile.games');
            });
        });
    }

    function showDetailsDialog(event) {
        $mdDialog.show({
            controller: 'GameListItemDetailsController',
            controllerAs: 'dg',
            templateUrl: 'app/components/gamelistitem/gamelistitemdetails.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: false,
            locals: {
                game: this.game
            }
        });
    }
}]);
