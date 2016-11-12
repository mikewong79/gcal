(function() {
  'use strict';
  angular.module('Gcal')
    .controller('MainController', MainController);

    MainController.$inject = ['$scope'];

    function MainController($scope) {
      var vm = this;
      vm.handleAuthClick = handleAuthClick;
      vm.events = [];
      vm.authorized = false;
      vm.calendars = [];
      vm.startDate = new Date();
      vm.getCalendarEvents = getCalendarEvents;
      vm.moment = moment;

      var CLIENT_ID = '691219269754-09i20sq65ahqvjhtr7eckp77ei9t369j.apps.googleusercontent.com';
      var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

      /**
       * Check if current user has authorized this application.
       */
      // function checkAuth() {
      //   gapi.auth.authorize(
      //     {
      //       'client_id': CLIENT_ID,
      //       'scope': SCOPES.join(' '),
      //       'immediate': true
      //     }, handleAuthResult);
      // }
      // checkAuth();

      function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          vm.authorized = true;
          $scope.$apply();
          loadCalendarApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          vm.authorized = false;
        }
      }

      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', getCalendars);
      }
      function getCalendars() {
        var request = gapi.client.calendar.calendarList.list();
        request.execute(function(resp) {
          vm.calendars = resp.items;
          console.log(resp);
          $scope.$apply();
        })
      }

      function getCalendarEvents() {
        var request = gapi.client.calendar.events.list({
          'calendarId': vm.selectedCal,
          'timeMin': vm.startDate.toISOString(),
          'timeMax': vm.endDate.toISOString(),
          'showDeleted': false,
          'singleEvents': true
        });

        request.execute(function(resp) {
          vm.events = resp.items;
          console.log(vm.events)
          $scope.$apply();

        });
      }

    };
}());
