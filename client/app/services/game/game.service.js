/**
 * @ngdoc service
 * @name gameService
 * @description Interacts with game, variant, and move data.
 */
angular.module('gameService', ['userService'])
.factory('gameService', ['$http', 'userService', 'Restangular', '$q', function($http, userService, Restangular, $q) {
    'use strict';

    return {
        /**
         * Gets all active games the logged-in user is playing in.
         * @memberof GameService
         * @returns {Promise} Diplicity data containing a list of games.
         */
        getAllActiveGamesForCurrentUser: function() {
            return Restangular.all('Games').all('My').customGET('Started');
        },

        /**
         * Gets all waiting games the logged-in user has joined.
         * @memberof GameService
         * @returns {Promise} Diplicity data containing a list of games.
         */
        getAllInactiveGamesForCurrentUser: function() {
            return Restangular.all('Games').all('My').customGET('Staging');
        },

        getGame: function(gameID) {
            return Restangular.one('Game', gameID).get();
        },

        getPhases: function(gameID) {
            return Restangular.one('Game', gameID).customGET('Phases');
        },

        getPhaseState: function(gameID, phase) {
            if (!phase)
                return Promise.resolve(null);
            return Restangular.one('Game', gameID).one('Phase', phase.PhaseOrdinal).customGET('PhaseStates');
        },

        getPhaseOrders: function(gameID, phase) {
            if (!phase)
                return Promise.resolve(null);
            return Restangular.one('Game', gameID).one('Phase', phase.PhaseOrdinal).customGET('Orders');
        },

        getAllOpenGames: function() {
            return Restangular.all('Games').customGET('Open');
        },

        getAllArchivedGames: function() {
            // return $q(function(resolve) {
            //     if (userService.isAuthenticated()) {
            //         socketService.socket.emit('game:listarchives', function(games) {
            //             resolve(games);
            //         });
            //     }
            //     else {
            //         return resolve({ });
            //     }
            // });
        },

        /**
         * Creates new game and automatically joins it.
         * @param  {Object} game The game to save.
         * @return {Promise}     The saved game's promise.
         */
        createNewGame: function(game) {
            return Restangular.all('Game').post(game);
        },

        /**
         * @description Signs the current user up for a game.
         * @param {Object} game      A game.
         * @param {Object} [options] Power preferences, if allowed.
         * @return {Promise}         The user's promise.
         */
        joinGame: function(game, options) {
            return Restangular.one('Game', game.ID).customPOST({ }, 'Member');
        },

        /**
         * Updates orders for a single unit.
         * @param  {String} action  The action.
         * @param  {Object} command The unit's new command.
         * @param  {Object} phase  The phase being modified.
         * @param  {Function} callback The callback to execute after completion.
         */
        publishCommand: function(action, command, phase, callback) {
            // socketService.socket.emit('phase:setorder', {
            //     phaseID: phase.id,
            //     command: command,
            //     action: action
            // }, callback);
        },

        getCurrentUserInGame: function(game) {
            return _.find(game.Members, ['User.Id', userService.getCurrentUserID()]);
        },

        isPlayer: function(game) {
            return !!this.getCurrentUserInGame(game);
        }
    };
}]);
