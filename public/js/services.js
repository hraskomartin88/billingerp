'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
/*angular.module('billingErp.services', []).
  value('version', '0.3');*/

angular.module('billingErp.services', []).service('modalService', ['$modal',
  function($modal){
    var modalDefaults = {
      backdrop: true,
      keyboard: true,
      modalFade: true,
      templateUrl: 'partials/modal'
    };

    var modalOptions = {
      closeButtonText: 'Close',
      actionButtonText: 'OK',
      headerText: 'Proceed?',
      bodyText: 'Perform this action?'
    };

    this.showModal = function(customModalDefaults, customModalOptions){
      if(!customModalDefaults) customModalDefaults = {};
      customModalDefaults.backdrop = 'static';
      return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function(customModalDefaults, customModalOptions){
      var tempModalDefaults = {};
      var tempModalOptions = {};

      angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

      angular.extend(tempModalOptions,modalOptions,customModalOptions);

      if(!tempModalDefaults.controller){
        tempModalDefaults.controller = function ($scope,$modalInstance){
          $scope.modalOptions = tempModalOptions;
          $scope.modalOptions.ok = function(result){
            $modalInstance.close(result);
          };
          $scope.modalOptions.close = function(result){
            $modalInstance.dismiss('cancel');
          };
        }
      }

      return $modal.open(tempModalDefaults).result;
    };
  }])
  .factory('Excel',function($window){
        //var uri='data:application/vnd.ms-excel;base64,',
        var uri='',
            //template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>',
            base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
            format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
        return {
            tableToExcel:function(tableId,worksheetName){
                var table=$(tableId),
                    ctx={worksheet:worksheetName,table:table.html()},
                    href=uri+base64(format(template,ctx));
                return href;
            }
        };
    });

/*
  .service('DataLayer', ['$http',
    function($http){
      var factory = {};
      var zones;
      factory.getZones = function(param, success){
        if(zones){
          success(zones);
          return;
        }
        $http.get('/api/getzoneandprice/'+param).success(function(data){
          zones =data;
          success(zones);
        });
      };

      return factory;
    }
  ])*/
