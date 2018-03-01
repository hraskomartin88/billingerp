'use strict';

/* Directives */

angular.module('billingErp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })
  .directive("stickyNav", ['$window', function stickyNav($window){
  function stickyNavLink(scope, element){
    var w = angular.element($window),
        size = element[0].clientHeight,
        top = 0;

    /*
     * on scroll we just check the page offset
     * if it's bigger than the target size we fix the controls
     * otherwise we display them inline
     */
    function toggleStickyNav(){
      if(!element.hasClass('controls-fixed') && $window.pageYOffset > top + size){
        element.addClass('controls-fixed');
      } else if(element.hasClass('controls-fixed') && $window.pageYOffset <= top + size){
        element.removeClass('controls-fixed');
      }
    }

    /*
     * We update the top position -> this is for initial page load,
     * while elements load
     */
    scope.$watch(function(){
      return element[0].getBoundingClientRect().top + $window.pageYOffset;
    }, function(newValue, oldValue){
      if(newValue !== oldValue && !element.hasClass('controls-fixed')){
        top = newValue;
      }
    });

    /*
     * Resizing the window displays the controls inline by default.
     * This is needed to calculate the correct boundingClientRect.
     * After the top is updated we toggle the nav, eventually
     * fixing the controls again if needed.
     */
    w.bind('resize', function stickyNavResize(){
      element.removeClass('controls-fixed');
      top = element[0].getBoundingClientRect().top + $window.pageYOffset;
      toggleStickyNav();
    });
    w.bind('scroll', toggleStickyNav);
  }

  return {
    scope: {},
    restrict: 'A',
    link: stickyNavLink
  };
}])
  .directive("country",function(){
    return {
      restrict: "EA",
      scope: false,
      template: "<div>{{zone.zones}}</div>"
    };
  })
  .directive("clickToEdit", function() {
      var editorTemplate = '<div class="click-to-edit">' +
          '<div ng-hide="view.editorEnabled">' +
              '{{value}} ' +
              '<a ng-click="enableEditor()">Edit</a>' +
          '</div>' +
          '<div ng-show="view.editorEnabled">' +
              '<input ng-model="view.editableValue">' +
              '<a href="#" ng-click="save()">Save</a>' +
              ' or ' +
              '<a ng-click="disableEditor()">cancel</a>.' +
          '</div>' +
      '</div>';

      return {
          restrict: "A",
          replace: true,
          template: editorTemplate,
          scope: {
              value: "=clickToEdit",
          },
          controller: function($scope) {
              $scope.view = {
                  editableValue: $scope.value,
                  editorEnabled: false
              };

              $scope.enableEditor = function() {
                  $scope.view.editorEnabled = true;
                  $scope.view.editableValue = $scope.value;
              };

              $scope.disableEditor = function() {
                  $scope.view.editorEnabled = false;
              };

              $scope.save = function() {
                  $scope.value = $scope.view.editableValue;
                  $scope.disableEditor();
              };
          }
      };
  })
  .directive('showtab',function(){
    return {
      link: function (scope, element, attrs) {
        element.click(function(e) {
          e.preventDefault();
          $(element).tab('show');
        });
      }
    };
  })
  .directive('decprice',['$filter',
    function($filter){
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope,element,attrs,ngModelController){
          ngModelController.$parsers.push(function(data){
            data = $filter('comma2decimal')(data);
            return data;
          });

          ngModelController.$formatters.push(function(data){
            data = $filter('decimal2comma')(data);
            return data;
          });
        }
      };
    }
    ]);
