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
      vm.hours = ["08:00", "09:00", "10:00", "11:00","12:00", "13:00", "14:00", "15:00","16:00", "17:00", "18:00", "19:00","20:00", "21:00", "22:00"]
      vm.hoursSearch = hoursSearch;
      vm.startTime = "";
      vm.endTime = "";

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
          vm.events = resp.items.sort(function(a,b) {
            return new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date);
          }).map(function(event) {
            return {
              date: moment(event.start.dateTime || event.start.date).format('ddd, MMM DD'),
              endTime: moment(event.end.dateTime || event.end.date).format('HH:mm'),
              link: event.htmlLink,
              organizer: event.organizer.displayName || event.organizer.email,
              startTime: moment(event.start.dateTime || event.start.date).format('HH:mm'),
              summary: event.summary
            }
          });
          console.log(resp)
          $scope.$apply();

        });
      }

      function hoursSearch(event) {
        if(event.startTime > vm.startTime) {
          return event.startTime <= vm.endTime;
        } else {
          return event.endTime >= vm.startTime;
        }
      }

    };
}());
