'use strict';

/* Controllers */

angular.module('billingErp.controllers', ['smart-table','billingErp.services']).
  controller('InvCtrl', function ($scope, $http, modalService){
    $scope.close = {};
    $scope.close.disabledbtn = false;
    $scope.yearsel = new Date().getFullYear();
    $scope.getInvoices = function getInvoices(){
      $http({
        method: 'GET',
        url: '/api/getinvoices'
      }).
      success(function(data,status,headers,config){
        $scope.title = data.title;
        $scope.data = data.result0;
        $scope.counts = data.result1;
        $scope.counts2 = data.result2;
        $scope.dateinfo = data.result3;
        $scope.counts3 = data.result4;
        $scope.counts4 = data.result5;
        $scope.mandata = data.mandata;
        $scope.mandatacount = data.mandatacount;
      }).
      error(function(data,status,headers,config){
        $scope.data = 'Error!';
      });
    };

    $scope.returnMonth = function returnMonth(monthname){
      switch(monthname){
        case "January":
          return "Januar"
          break;
        case "February":
          return "Februar";
          break;
        case "March":
          return "März"
          break;
        case "April":
          return "April"
          break;
        case "May":
          return "Mai"
          break;
        case "June":
          return "Juni"
          break;
        case "July":
          return "Juli"
          break;
        case "August":
          return "August"
          break;
        case "September":
          return "September"
          break;
        case "October":
          return "Oktober"
          break;
        case "November":
          return "November"
          break;
        case "December":
          return "Dezember"
          break;
      }
    }



    /*var y= new Date();
    y.setDate(1);
    y.setMonth(y.getMonth()-1);
    $scope.form={};
    $scope.form.dtinv = y;*/

    $scope.findCustomers = function findCustomers(invid){
      //console.log(invid);
      $scope.close.disabledbtn = true;
      $http.post('/api/findcustomers', {data: invid})
      .success(function(data){
        $http.post('/api/findcustomerssur', {data:invid})
        .success(function(data2){
          $scope.getInvoices();
          $scope.close.disabledbtn = false;
        });
      })
    };

    $scope.closeManuallyInvoice = function closeManuallyInvoice(invid){
      $scope.close.disabledbtn = true;
      $http.post('/api/setmaninvclosed', {data:invid})
      .success(function(){
        $scope.getInvoices();
        $scope.close.disabledbtn = false;
      });
    };

    $scope.closeInvoice = function closeInvoice(invid){
      //console.log(invid);
      $scope.close.disabledbtn = true;
      $http.post('/api/closeinvoice', {data:invid})
      .success(function(data){
        $scope.getInvoices();
        $scope.close.disabledbtn = false;
      });
    };

    $scope.closeBoolInv = function closeBoolInv(rowidb){
      //console.log(rowidb);
      //console.log($scope.counts);
      var bool = true;
      for(var i=0,len=$scope.counts.length;i<len;++i){
        if($scope.counts[i].hasOwnProperty('main_invoice_id')){
          //console.log($scope.counts[i]);
          if($scope.counts[i].main_invoice_id==rowidb){
            if($scope.counts[i].count==0){
              bool = false;
            }
          }
        }
      }
      return bool;
    };

    $scope.deleteManuallyInvoice = function deleteManuallyInvoice(invno,invid){
      var modalOptions2 = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Delete Invoice',
        headerText: 'Delete Invoice: '+invno+'?',
        bodyText: 'Are you sure you want to delete this invoice and all of the packages connected to it?'
      };

      modalService.showModal({}, modalOptions2).then(function(result){
        $http.post('/api/deletemaninvoice', {data:invid})
        .success(function(){
          $scope.getInvoices();
        })
      });
    };

    $scope.deleteInvoice = function deleteInvoice(invno,invid){
      var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Delete Invoice',
        headerText: 'Delete Invoice: ' + invno + '?',
        bodyText: 'Are you sure you want to delete this invoice and all of the packages connected to it?'
      };

      modalService.showModal({}, modalOptions).then(function(result){
        $http.post('/api/deleteinvoice', {data:invid})
        .success(function(data){
          $scope.getInvoices();
        })
      });
    };

    $scope.selectedYear = function selectedYear(yearsel){
      //console.log(yearsel);
      $scope.yearsel = yearsel;
    }

    $scope.getInvoices();
  }).
  controller('CustCtrl', function ($scope, $filter, $http){
    $scope.getCustomers = function getCustomers(){
      $http({
        method: 'GET',
        url: '/api/getcustomers'
      }).
      success(function(data,status,headers,config){
        $scope.title = data.title;
        $scope.data = data.result;
        $scope.displayedCollection = [].concat($scope.data);
      }).
      error(function(data,status,headers,config){
        $scope.data = 'Error!';
      });
    }

    $scope.removeCustomer = function removeRow(row){
      //console.log(row.CustomerID);
      $http.post('/api/removecustomer', {data: row.id})
      .success(function(data){
        var index = $scope.data.indexOf(row);
        if(index !== -1){
          $scope.data.splice(index, 1);
        }
      })
    };

    $scope.addCustomer = function addCustomer(){
      var newcustomer = {
        name: $scope.name,
        street: $scope.street,
        country: $scope.country,
        postalcode: $scope.postalcode,
        city: $scope.city,
        debitoren: $scope.debitoren,
        ustidnr: $scope.ustidnr
      };
      //console.log($scope.CustomerName);
      //console.log(newcustomer);
      $http.post('/api/addcustomer/', {data: newcustomer})
      .success(function(data){
        $scope.getCustomers();
      })
      /*$http.post({
        withCredentials: false,
        method: 'POST',
        url: '/api/addcustomer',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: newcustomer
      });*/
      $scope.getCustomers();

    }

    $scope.getCustomers();
  }).
  controller('ManInvShpmntCtrl', function($scope, $http, $routeParams){
    $scope.maninvshpmnt = {};
    $scope.maninvshpmnt.title = "Shipments in Manually added invoice: " + $routeParams.id;

    $scope.getManuallyInvShpmnt = function getManuallyInvShpmnt(){
      $http({
        method: 'GET',
        url: '/api/getmanshpmnt/' + $routeParams.id
      }).
      success(function(data){
        $scope.maninvshpmnt.data = data;
      }).
      error(function(){
        console.log('ERROR');
      });
    };

    $scope.maninvshpmnt.delManShpmnt = function delManShpmnt(idtodel){
      $http.post('/api/delmanshpmnt/', {data: idtodel})
        .success(function(){
          $scope.getManuallyInvShpmnt();
        });
    };

    $scope.getManuallyInvShpmnt();
  }).
  controller('ManInvSrchgCtrl', function($scope, $http, $routeParams){
    $scope.maninvsrchg = {};
    $scope.maninvsrchg.title = "Surcharges in Manually added invoice: " + $routeParams.id;

    $scope.getManuallyInvSrchg = function getManuallyInvSrchg(){
      $http({
        method: 'GET',
        url: '/api/getmansrchg/'+ $routeParams.id
      }).
      success(function(data){
        $scope.maninvsrchg.data = data;
      }).
      error(function(){
        connection.log('ERROR');
      });
    };

    $scope.maninvsrchg.delManSrchg = function delManSrchg(idtodel){
      $http.post('/api/delmansrchg/', {data: idtodel})
      .success(function(){
        $scope.getManuallyInvSrchg();
      });
    };

    $scope.getManuallyInvSrchg();
  }).
  controller('CustRefCtrl', function ($scope, $http, $routeParams){
    $scope.account = {};
    $scope.getReferenceList = function getReferenceList(){
      $scope.custref_id = $routeParams.id;
      $http({
        method: 'GET',
        url: '/api/getreference/'+$scope.custref_id
      }).
      success(function(data){
        $scope.data=data;
        $scope.title = 'Selected Customer References';
        $http({
          method: 'GET',
          url: '/api/getsuppliers'
        }).
        success(function(data){
          $scope.account.suppliers = data;
        });
      }).
      error(function(data,status,headers,config){
        $scope.data = 'Error!';
      });
    };

    $scope.AddNewReference = function AddNewReference(newref){
      //console.log(newref);
      //console.log($routeParams.id);
      $http.post('/api/addreference/', {data: {main_customer_id: $routeParams.id, reference: newref}})
      .success(function(data){
        $scope.reference = {value:''};
        $scope.getReferenceList();
      });
    };

    $scope.RemoveReference = function RemoveReference(idref){
      //console.log(idref);
      $http.post('/api/removereference/', {data: {id: idref}})
      .success(function(data){
        $scope.getReferenceList();
      })
    };

    $scope.RemoveAccount = function RemoveAccount(idacc){
      $http.post('/api/removeaccount/', {data: {id: idacc}})
      .success(function(data){
        $scope.getReferenceList();
      })
    };

    $scope.account.AddNewAccount = function AddNewAccount(newacc, newaccspl){
      console.log(newacc + "|" + newaccspl);
      $http.post('/api/addaccount/', {data: {main_customer_id: $routeParams.id, accountnumber: newacc, main_supplier_id: newaccspl}})
      .success(function(data){
        $scope.account = {value:''};
        $scope.getReferenceList();
      });
    };

    $scope.UpdateCustomer = function UpdateCustomer(){
      //console.log($scope.data[1][0]);
      var changetothis = $scope.data[1][0];
      $http.post('/api/updatecustomer', {data: changetothis})
      .success(function(data){
        $scope.getReferenceList();
      });
    };

    $scope.getReferenceList();
  }).
  controller('InvCtrlUnidSur', function ($scope,$http,$routeParams){
    $scope.unidsur = {};
    $scope.unidsur.title = 'InvoiceId: ' + $routeParams.invno;
    $scope.unidsur.subtitle = 'Unidentified surcharges';
    $scope.unidsur.getUnidInvoicesSur = function getUnidInvoicesSur(){
      $http({
        method: 'GET',
        url: '/api/getdetaileddataunidsur/'+$routeParams.invno
      }).
      success(function(data){
        $scope.unidsur.data = data;
        $scope.$watch('unidsur.data', function(newVal){
          $scope.unidsur.selectedcount = (newVal.filter(function(item){
            return item.isSelected;
          }).length);
        }, true);
        $http({
          method: 'GET',
          url: '/api/getcustomers'
        }).
        success(function(data){
          $scope.unidsur.customers = data.result;
        });
      });
    };

    $scope.unidsur.getSelectedRows = function getSelectedRows(){
      var datatosend = [];
      $scope.unidsur.data.filter(function(item){
        //console.log(item);
        if(item.isSelected){
          var updatedata = {
            mainid: '',
            custid: $scope.cust,
            tracking: item.main_trackingnumber
          }
          datatosend.push(updatedata);
        }
      });
      if(datatosend.length!=0){
        $http.post('/api/assigncustomers', {data:datatosend})
        .success(function(data){
          $scope.unidsur.getUnidInvoicesSur();
        });
      }
    }

    $scope.unidsur.getUnidInvoicesSur();
  }).
  controller('InvCtrlIdenSur', function ($scope, $http,$routeParams){
    $scope.idensur = {};
    $scope.idensur.title = 'InvoiceId: ' + $routeParams.invno;
    $scope.idensur.subtitle = 'Identified surcharges';

    $scope.idensur.getIdenInvoicesSur = function getIdenInvoices(){
      $http({
        method: 'GET',
        url: '/api/getdetaileddataidensur/'+$routeParams.invno
      }).
      success(function(data){
        //console.log(data);
        $scope.idensur.data = data;
      });
    };

    //idensur.unsetSelected(row)
    $scope.idensur.unsetSelected = function unsetSelected(row){
      $http.post('/api/unsetselectedsur', {data: row.id,track:row.main_trackingnumber})
      .success(function(data){
        $scope.idensur.getIdenInvoicesSur();
      });
    };

    $scope.idensur.getIdenInvoicesSur();
  }).
  controller('InvCtrlUnid', function ($scope,$http,$routeParams){
    $scope.title = 'InvoiceId: ' + $routeParams.invno;
    $scope.subtitle = 'Unidentified postitions';
    $scope.getUnidInvoices = function getUnidInvoices(){
      $http({
        method: 'GET',
        url: '/api/getdetaileddataunid/'+$routeParams.invno
      }).
      success(function(data){
        $scope.data = data;
        $scope.$watch('data', function(newVal){
          $scope.selectedcount = (newVal.filter(function(item){
            return item.isSelected;
          }).length);
        }, true);
        $http({
          method: 'GET',
          url: '/api/getcustomers'
        }).
        success(function(data){
          $scope.customers = data.result;
        });
      });
    };

    $scope.getSelectedRows = function getSelectedRows(){
      var datatosend = [];
      $scope.data.filter(function(item){
        //console.log(item);
        if(item.isSelected){
          var updatedata = {
            mainid: item.id,
            custid: $scope.cust,
            tracking: item.trackingnumber
          }
          datatosend.push(updatedata);
        }
      });
      if(datatosend.length!=0){
        $http.post('/api/assigncustomers', {data:datatosend})
        .success(function(data){
          $scope.getUnidInvoices();
        });
      }
    }

    $scope.getUnidInvoices();
  }).
  controller('InvCtrlIden', function ($scope,$http,$routeParams){
    $scope.title = 'InvoiceId: ' + $routeParams.invno;
    $scope.subtitle = 'Identified positions';
    $scope.getIdenInvoices = function getIdenInvoices(){
      $http({
        method: 'GET',
        url: '/api/getdetaileddataiden/'+$routeParams.invno
      }).
      success(function(data){
        //console.log(data);
        $scope.data = data;
      });
    };
    $scope.unsetSelected = function unsetSelected(row){
      $http.post('/api/unsetselected', {data: row.id,track:row.trackingnumber})
      .success(function(data){
        $scope.getIdenInvoices();
      });
    };

    $scope.getIdenInvoices();
  }).
  controller('UploadCtrl', function ($scope,$http, $routeParams){
    $scope.title = 'Upload';
    $scope.getSuppliers = function getSuppliers(){
      $http({
        method: 'GET',
        url: '/api/getsuppliers'
      }).
      success(function(data){
        $scope.suppliers = data;
      });
    };

    $scope.setThis = function setThis(){
      $scope.suppl = this.suppl;
      //console.log(this.form.dt);
      //console.log($scope.form.dt);
    };

    var x= new Date();
    x.setDate(1);
    x.setMonth(x.getMonth()-1);
    $scope.form={};
    $scope.form.dt = x;

    $scope.setQuery = {
      query: function(){
        return {
          supplierid: $scope.suppl,
          dateofinv: $scope.form.dt.toMysqlFormat(),
          type: 0
        };
      }
    };

    $scope.getSuppliers();
  }).
  controller('CustPriceCtrl', function ($scope, $http, $routeParams,$location,$anchorScroll){
    $scope.scrollTo = function(id){
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      $location.hash(old);
    };

    var x2 = new Date();
    x2.setDate(1);
    x2.setMonth(x2.getMonth());

    $scope.price = {};
    $scope.price.dt = [];
    $scope.price.isCollapsedSurcharge = true;
    $scope.price.isCollapsedMautSurcharge = true;
    $scope.price.isCollapsedPrivateSurcharge = true;
    $scope.price.isCollapsedCodSurcharge = true;
    $scope.price.isCollapsedExpiration = [];
    $scope.price.getNewPricesStart = function getNewPricesStart(){
      $http({
        method: 'GET',
        url: '/api/getsuppliersandservices'
      }).
      success(function(data){
        $scope.price.suppliers = data[1];
        $scope.price.maindata = data[0];
        $scope.price.getVkTables();
        $scope.price.getFuelSurcharge();
        $scope.price.getMautSurchargeCust();
        $scope.price.getPrivateSurchargeCust();
        $scope.price.getCodSurchargeCust();
      });
    };

    $scope.price.supplselection = [];
    $scope.price.servselection = [];
    $scope.price.custvktables = [];
    $scope.price.selectionbit = 0;
    $scope.price.zonenr = 1;

    $scope.price.getVkTables = function getVkTables(){
      $http({
        method: 'GET',
        url: '/api/getvktables/'+$routeParams.id
      }).
      success(function(data){
        //console.log(data);
        if(data.length!==0){
          $scope.price.custvktables = [];
          $scope.price.custvktables = data;
          $scope.price.getPrice();
        }
      });
    };

    $scope.price.servtoggleSelection = function servtoggleSelection(service){
      var idx = $scope.price.servselection.indexOf(service);

      if(idx>-1){
        $scope.price.selectionbit = 0;
        $scope.price.servselection.splice(idx,1);
      }else{
        $scope.price.selectionbit = 0;
        $scope.price.servselection.push(service);
      }
      for(var i=0,len=$scope.price.servselection.length;i<len;++i){
        $scope.price.selectionbit+=Math.pow(2,$scope.price.servselection[i]);
      }
    };

    $scope.price.suppltoggleSelection = function suppltoggleSelection(supplier){
      var idx = $scope.price.supplselection.indexOf(supplier);

      if(idx>-1){
        $scope.price.supplselection.splice(idx,1);
      }else{
        $scope.price.supplselection.push(supplier);
      }
    };

    $scope.price.allSelected = function allSelected(){
      var newthings = {
        zonenr: $scope.price.zonenr,
        selectionbit: $scope.price.selectionbit,
        customer: $routeParams.id
      }
      $http.post('/api/addnewprice', {datatoadd: newthings})
      .success(function(response,status,fn,xhr){
        $scope.price.supplselection = [];
        $scope.price.servselection = [];
        $scope.price.selectionbit = 0;
        $scope.price.getNewPricesStart();
      });
    };

    $scope.price.deletePrice = function deletePrice(tablename){
      $http.post('/api/deleteprice',{tblname: tablename})
      .success(function(response,status,fn,xhr){
        $scope.price.getNewPricesStart();
      });
    };

    $scope.price.getPrice = function getPrice(){
      $http.post('/api/getprice', {ident: $scope.price.custvktables})
      .success(function(data){
        $scope.price.prices = data;
        var priceheaders = [];
        for(var o=0,len5=data.length;o<len5;++o){
          priceheaders.push(Object.keys(data[o][0]));
        }
        $scope.price.zheaders = priceheaders;
        $scope.price.getZone();
      });
    };

    $scope.price.savePrice = function savePrice(inp){
      $http.post('/api/setprice', {datatoset: $scope.price.prices[$scope.price.custvktables.indexOf(inp)], tblname:inp, headersonly: $scope.price.zheaders[$scope.price.custvktables.indexOf(inp)]})
      .success(function(){
        $scope.price.getNewPricesStart();
      });
    };

    $scope.price.exportPrice = function exportPrice(inp){
      console.log('export here');
      //console.log($scope.price.prices[$scope.price.custvktables.indexOf(inp)]);
      //console.log($scope.price.zheaders[$scope.price.custvktables.indexOf(inp)]);
      $http.post('/api/exportprice', {data:$scope.price.prices[$scope.price.custvktables.indexOf(inp)], priceheader: $scope.price.zheaders[$scope.price.custvktables.indexOf(inp)]})
      .success(function(response,status,fn,xhr){
        //console.log(response);
        var file = new Blob([response], {type: 'Content-Disposition'});
        var fileURL = URL.createObjectURL(file);
        var anchorElement = document.createElement('a');
        anchorElement.href = fileURL;
        anchorElement.target = '_self';
        anchorElement.download = 'export_'+inp+'.csv';
        document.body.appendChild(anchorElement);
        anchorElement.click();
      });
    };

    $scope.price.getExpiration = function getExpiration(inp){
      $scope.price.isCollapsedExpiration[inp] = true;
      $http.post('/api/getexpiration', {ident: inp})
      .success(function(data){
        $scope.price.dt[data.table_name] = data.dateexpiration;
      });
    };

    $scope.price.setExpiration = function setExpiration(pricetbl, dateexp){
      dateexp.setTime(dateexp - (dateexp.getTimezoneOffset() * 60 * 1000));
      $http.post('/api/setexpiration', {table_name: pricetbl, dateexpiration: dateexp.toMysqlFormat()})
      .success(function(){
        $scope.price.isCollapsedExpiration[pricetbl] = false;
      });
    };

    /*$scope.price.importPrice = function importPrice(){
      console.log('import here');
    };*/
    $scope.price.completePriceImport = {
      controllerFn: function($flow,$file,$message,$inpindex){
        $scope.price.prices[$inpindex] = JSON.parse($message);
        //console.log($message);
      }
    };

    $scope.price.addPriceZone = function addPriceZone(inp){
      var nextzonenr = Object.keys($scope.price.prices[$scope.price.custvktables.indexOf(inp)][0]).length-1;
      var checkzonenr = $scope.price.zheaders[$scope.price.custvktables.indexOf(inp)].length;
      if(nextzonenr===checkzonenr){
        for(var i=0,len=$scope.price.prices[$scope.price.custvktables.indexOf(inp)].length;i<len;++i){
          $scope.price.prices[$scope.price.custvktables.indexOf(inp)][i]["z"+nextzonenr] = null;
        }
        $scope.price.zheaders[$scope.price.custvktables.indexOf(inp)].push("z"+nextzonenr);
      };
    };

    $scope.price.removePriceZone = function removePriceZone(inp){
      var nextzonenr = Object.keys($scope.price.prices[$scope.price.custvktables.indexOf(inp)][0]).length-1;
      var checkzonenr = $scope.price.zheaders[$scope.price.custvktables.indexOf(inp)].length;
      if(nextzonenr===checkzonenr){
        for(var j=0,len2=$scope.price.prices[$scope.price.custvktables.indexOf(inp)].length;j<len2;++j){
          delete $scope.price.prices[$scope.price.custvktables.indexOf(inp)][j]["z"+(nextzonenr-1)];
        }
        $scope.price.zheaders[$scope.price.custvktables.indexOf(inp)].splice(-1,1);
      };
    }

    $scope.price.addNewRow = function addNewRow(inp){
      var thiscopy = angular.copy($scope.price.prices[$scope.price.custvktables.indexOf(inp)][0]);
      for(var p in thiscopy)
        if(thiscopy.hasOwnProperty(p))
          thiscopy[p] = null;
      $scope.price.prices[$scope.price.custvktables.indexOf(inp)].push(thiscopy);
    };

    $scope.price.removeLastRow = function removeLastRow(inp){
      $scope.price.prices[$scope.price.custvktables.indexOf(inp)].splice(-1,1);
    };

    $scope.price.getZone = function getZone(){
      $http.post('/api/getzone/', {custid: $routeParams.id,vktables:$scope.price.custvktables})
      .success(function(response){
        $scope.price.zones = response;
      });
    };

    $scope.price.saveZone = function saveZone(){
      $http.post('/api/zonesave', {zones:$scope.price.zones,services:$scope.price.custvktables})
      .success(function(response,status,fn,xhr){

      });
    };

    $scope.price.exportZone = function exportZone(inp){
      $http.post('/api/zoneexport', {data:inp, services: $scope.price.custvktables})
      .success(function(response,status,fn,xhr){
        var file = new Blob([response], {type: 'Content-Disposition'});
        var fileURL = URL.createObjectURL(file);
        var anchorElement = document.createElement('a');
        anchorElement.href = fileURL;
        anchorElement.target = '_self';
        anchorElement.download = 'export_zones_'+$routeParams.id+'.csv';
        document.body.appendChild(anchorElement);
        anchorElement.click();
      });
    };

    //price.zoneCompleteUpload.controllerFn
    $scope.price.zoneCompleteUpload = {
      controllerFn: function($flow,$file,$message){
        $scope.price.zones = JSON.parse($message);
      }
    };

    $scope.price.checkinputs = function checkinputs(){
      if($scope.price.globalchecked){
        return false;
      }else if($scope.price.fixedchecked){
        if(!isNaN(parseFloat($scope.price.stdpercentage).toFixed(2))&&!isNaN(parseFloat($scope.price.exppercentage).toFixed(2))){
          return false;
        }else{
          return true;
        }
      }else{
        return true;
      }
    };

    $scope.price.saveFuelSurcharge = function saveFuelSurcharge(){
      if($scope.price.globalchecked){
        //-1 USE GLOBAL
        //console.log('-1');
        //console.log('-1');
        $http.post('/api/savefuel', {main_customer_id:$routeParams.id,std:-1,exp:-1})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedSurcharge = false;
        });
      }else if($scope.price.fixedchecked){
        //console.log($scope.price.stdpercentage);
        //console.log($scope.price.exppercentage);
        $http.post('/api/savefuel', {main_customer_id:$routeParams.id,std:$scope.price.stdpercentage,exp:$scope.price.exppercentage})
        .success(function(response,status,fn,xhr){
          //console.log('price updated');
          $scope.price.isCollapsedSurcharge = false;
        });
      };
    };

    $scope.price.getFuelSurcharge = function getFuelSurcharge(){
      //console.log($routeParams.id);
      $http.post('/api/getfuel', {main_customer_id:$routeParams.id})
      .success(function(response,status,fn,xhr){
        //console.log(typeof(response[0])==='undefined');
        if(typeof(response[0])!='undefined'){
          //console.log(response[0].std==-1 && response[0].exp==-1);
          if(response[0].std==-1 && response[0].exp==-1){
            $scope.price.globalchecked=true;
          }else{
            $scope.price.fixedchecked=true;
            $scope.price.stdpercentage = response[0].std;
            $scope.price.exppercentage = response[0].exp;
          }
        }
      });
    };

    $scope.price.addMautSurchargeCust = function addMautSurchargeCust(){
      if($scope.price.mautglobalchecked){
        $http.post('/api/addmautsurchargecust', {main_customer_id:$routeParams.id, at:-1,atde:-1})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedMautSurcharge = false;
        });
      }else if($scope.price.mautfixedchecked){
        $http.post('/api/addmautsurchargecust', {main_customer_id:$routeParams.id,at:$scope.price.mautat,atde:$scope.price.mautatde})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedMautSurcharge = false;
        });
      }
    }

    $scope.price.getMautSurchargeCust = function getMautSurchargeCust(){
      $http.post('/api/getmaut', {main_customer_id:$routeParams.id})
      .success(function(response,status,fn,xhr){
        //console.log(response[0]);
        if(typeof(response[0])!='undefined'){
          if(response[0].at==-1 && response[0].atde==-1){
            $scope.price.mautglobalchecked=true;
          }else{
            $scope.price.mautfixedchecked=true;
            $scope.price.mautat = response[0].at;
            $scope.price.mautatde = response[0].atde;
          }
        }
      });
    };

    $scope.price.checkmautinputs = function checkinputs(){
      if($scope.price.mautglobalchecked){
        return false;
      }else if($scope.price.mautfixedchecked){
        if(!isNaN(parseFloat($scope.price.mautat).toFixed(2))&&!isNaN(parseFloat($scope.price.mautatde).toFixed(2))){
          return false;
        }else{
          return true;
        }
      }else{
        return true;
      }
    };

    $scope.price.addPrivateSurchargeCust = function addPrivateSurchargeCust(){
      if($scope.price.privateglobalchecked){
        $http.post('/api/addprivatesurchargecust', {main_customer_id:$routeParams.id, priceprivate:-1})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedPrivateSurcharge = false;
        });
      }else if($scope.price.privatefixedchecked){
        $http.post('/api/addprivatesurchargecust', {main_customer_id:$routeParams.id, priceprivate:$scope.price.privateprice})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedPrivateSurcharge = false;
        });
      }
    };

    $scope.price.getPrivateSurchargeCust = function getPrivateSurchargeCust(){
      $http.post('/api/getprivatecust', {main_customer_id:$routeParams.id})
      .success(function(response,status,fn,xhr){
        if(typeof(response[0])!='undefined'){
          if(response[0].priceprivate==-1){
            $scope.price.privateglobalchecked = true;
          }else{
            $scope.price.privatefixedchecked = true;
            $scope.price.privateprice = response[0].priceprivate;
          }
        }
      });
    };

    $scope.price.checkprivateinput = function checkprivateinput(){
      if($scope.price.privateglobalchecked){
        return false;
      }else if($scope.price.privatefixedchecked){
        if(!isNaN(parseFloat($scope.price.privateprice).toFixed(2))){
          return false;
        }else{
          return true;
        }
      }else{
        return true;
      }
    };

    //CODSURCHARGE
    $scope.price.addCodSurchargeCust = function addCodSurchargeCust(){
      if($scope.price.codglobalchecked){
        $http.post('/api/addcodsurchargecust', {main_customer_id:$routeParams.id,at:-1,de:-1,internat:-1})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedCodSurcharge = false;
        });
      }else if($scope.price.codfixedchecked){
        $http.post('/api/addcodsurchargecust', {main_customer_id:$routeParams.id,at:$scope.price.codatprice,de:$scope.price.coddeprice,internat:$scope.price.codintprice})
        .success(function(response,status,fn,xhr){
          $scope.price.isCollapsedCodSurcharge = false;
        });
      }
    };

    $scope.price.getCodSurchargeCust = function getCodSurchargeCust(){
      $http.post('/api/getcodcust', {main_customer_id:$routeParams.id})
      .success(function(response,status,fn,xhr){
        if(typeof(response[0])!='undefined'){
          if(response[0].at==-1 && response[0].de==-1 && response[0].internat==-1){
            $scope.price.codglobalchecked = true;
          }else{
            $scope.price.codfixedchecked = true;
            $scope.price.codatprice = response[0].at;
            $scope.price.coddeprice = response[0].de;
            $scope.price.codintprice = response[0].internat;
          }
        }
      });
    };

    $scope.price.checkcodinput = function checkcodinput(){
      if($scope.price.codglobalchecked){
        return false;
      }else if($scope.price.codfixedchecked){
        if(!isNaN(parseFloat($scope.price.codatprice).toFixed(2))&&!isNaN(parseFloat($scope.price.coddeprice).toFixed(2))&&!isNaN(parseFloat($scope.price.codintprice).toFixed(2)) ){
          return false;
        }else{
          return true;
        }
      }else{
        return true;
      }
    }

    $scope.price.getNewPricesStart();
  }).
  controller('TodoListCtrl', function($scope, $http){
    $scope.todo={};

    $scope.todo.getTodoList = function getTodoList(){
      $http({
        method: 'GET',
        url: '/api/gettodolist/'
      }).
      success(function(list){
        $scope.todo.list=list;
      });
    }

    $scope.todo.addTodoList = function addTodoList(){
      //console.log($scope.todo.desc);
      $http.post('/api/addtodolist', {datatoadd: $scope.todo.desc})
      .success(function(response,status,fn,xhr){
        $scope.todo.getTodoList();
      });
    }

    $scope.todo.setClosedTodo = function setClosedTodo(idtoset){
      //console.log(idtoset);
      $http.post('/api/setclosedtodo', {idoftodo: idtoset})
      .success(function(response,status,fn,xhr){
        $scope.todo.getTodoList();
      })
    }

    $scope.todo.getTodoList();
  }).
  controller('BilledCtrl', function ($scope,$http,$filter){
    $scope.billed = {};
    $scope.billed.title = 'Billed Invoices';

    $http({
      method: 'GET',
      url: '/api/getmainbilled'
    }).
    success(function(data){
      $scope.billed.maindata = data;
    });

    $scope.billed.pdfDownload = function pdfDownload(uid){
      console.log(uid);
      /*$http({
        method: 'GET',
        //url: '/pdfbill/' + uid
      }).
      success(function(data){
        console.log(data);
      });*/
    };

    $scope.billed.exportToCsv = function exportToCsv(seluid){
      //console.log(cust);

      $http.post('/api/getcustomerclsshipmentsuid', {uid: seluid})
      .success(function(responsecustshipments,status_,fn_,xhr_){
        $http.post('/api/exportcsv', {data: responsecustshipments})
        .success(function(response,status,fn,xhr){
          var file = new Blob([response], {type:'Content-Disposition'});
          var fileURL = URL.createObjectURL(file);
          var anchorElement = document.createElement('a');
          anchorElement.href = fileURL;
          anchorElement.target = '_self';
          anchorElement.download = 'export_'+seluid+'.csv';
          document.body.appendChild(anchorElement);
          anchorElement.click();
        });
      });
      //console.log('EXPORT TO EXCEL');

    }
  }).
  controller('DownloadCtrl',function (Excel, $timeout, $scope, $http, $filter, $route, modalService){
    $scope.down= {};
    $scope.down.title = 'Download';
    $scope.down.totalvk=0;
    $scope.down.totalek=0;
    $scope.down.totalht=0;
    $scope.down.selectedyear = new Date().getFullYear();
    $scope.down.selectedmonth = '';
    $scope.down.disableexcel = true;
    $scope.down.selcustomername = '';
    $scope.down.eucountrylist={};
    //console.log($scope.down.disableexcel);
    /*$http({
      method: 'GET',
      url: '/api/getcustomers'
    }).
    success(function(data){
      $scope.down.customers = data.result;
    });*/
    $scope.down.getInvoiceUploadDate = function getInvoiceUploadDate(){
      $http({
        method: 'GET',
        url: '/api/getinvoiceuploaddate'
      }).
      success(function(data){
          $http({
            method: 'GET',
            url: '/api/getcustomers'
          }).
          success(function(data2){
            $scope.down.customers = data2.result;

            $scope.down.invoiceuploaddate = data;
            //console.log(data);
            $scope.down.getEUCountryList();
            $scope.down.getNextUid();
          });
      });
    };

    $scope.down.getEUCountryList = function getEUCountryList(){
      $http({
        method:'GET',
        url: '/api/geteucountrylist'
      }).
      success(function(data){
        $scope.down.eucountrylist = data;
      });
    }

    $scope.down.selectYearFn = function selecYearFn(year){
      $scope.down.selectedyear = year;
      //console.log($scope.down.selectedyear);
    }

    $scope.$watch('down.selectedmonth', function(newVal,oldVal){
      if(newVal!==oldVal){
        //console.log('var changed');
        $http.post('/api/getcustomerclsinv', {selyear:$scope.down.selectedyear,selmonth:$scope.down.selectedmonth})
        .success(function(response,status,fn,xhr){
          $scope.down.custclsinv = response;
        });
      }
    });

    $scope.down.filterCustById = function filterCustById(){
      return function(item){
        if(typeof($scope.down.custclsinv)!=='undefined'){
          if ($scope.down.custclsinv.indexOf(item.id)!==-1){
            return true;
          }else{
            return false;
          }
        }else{
          return false;
        }
        //console.log(item);
        //return true;
      }
    };

    //EXPIRATION
    $scope.down.getExpiration = function getExpiration(selcustomerid){
      //console.log($scope);
      $http.post('/api/getexpirydate', {custid: selcustomerid})
      .success(function(response){
        if(response.length!=0){
          //console.log(JSON.stringify(response));
          $scope.down.expservlist = response.services;
          $scope.down.expexpiredlist = response.expiredarr;
        }else{
          console.log('No expiry date');
        }
      });

      var modalOptions3 = {
        closeButtonText: 'Stempel und Druck',
        customerName: $scope.down.customers.filter(function(a){return a.id === selcustomerid})[0].name
      }

      $http.post('/api/getthingstodo', {customer: selcustomerid})
      .success(function(data){
        if(data.length!='0'){
          modalOptions3.bodyText = data;
          modalService.showModal({templateUrl: 'partials/notemodal'},modalOptions3);
        }
      });
    }

    $scope.down.getCustomerInvoice = function getCustomerInvoice(selcustomerid){
      //console.log(selcustomerid);
      $scope.down.selcustomername = $scope.down.customers.filter(function(a){return a.id === selcustomerid})[0].name;
      //console.log($scope.down.selectedyear);
      //console.log($scope.down.selectedmonth);
      $http.post('/api/getcustomerclsshipments', {custid: selcustomerid,selyear: $scope.down.selectedyear, selmonth:$scope.down.selectedmonth})
      .success(function(response,status,fn,xhr){
        console.log('data loaded');
        //EU
        //$scope.down.selcustshipmentseu = response[0];
        $scope.down.selcustshipmentseu = response[0];
        $scope.down.selcustshipmentman = response[1];
        //NOEU
        //$scope.down.selcustshipmentsnoneu = response[1];
        $scope.down.totalek = 0;
        $scope.down.totalvk = 0;
        $scope.down.totalht = 0;
        $scope.down.totalneteu = 0;
        //$scope.down.totalnetnoneu = 0;
        $scope.down.totalmwsteu=0;
        //$scope.down.totalmwstneu =0;

        $scope.down.totalmannet = 0;
        $scope.down.totalmanmwst = 0;
        $scope.down.disableexcel = false;
      });
    };

    $scope.down.getStyle = function getStyle(ek,vk,ht){
      if(ek>vk && vk!=0){
        return "{'background-color':'red'}";
      }else if(ht!=''){
        return "{'background-color':'orange'}";
      }else if(ht==0 && vk==0){
        return "{'background-color':'red'}";
      }
    };

    $scope.down.exportToCsv = function exportToCsv(cust){
      console.log(cust);
      //console.log('EXPORT TO EXCEL');
      $http.post('/api/exportcsv', {data: $scope.down.selcustshipmentseu})
      .success(function(response,status,fn,xhr){
        var file = new Blob([response], {type:'Content-Disposition'});
        var fileURL = URL.createObjectURL(file);
        var anchorElement = document.createElement('a');
        anchorElement.href = fileURL;
        anchorElement.target = '_self';
        anchorElement.download = 'export_'+cust+'.csv';
        document.body.appendChild(anchorElement);
        anchorElement.click();
      });
    }

    $scope.exportToExcel = function(){
      var anchorElement = document.createElement('a');
      //var file = new Blob([Excel.tableToExcel('#fullinvoicedata', $scope.down.selcustomername)], {type:'Content-Disposition'});
      //var fileURL = URL.createObjectURL(Excel.tableToExcel('#fullinvoicedata', $scope.down.selcustomername));
      //console.log(Excel.tableToExcel('#fullinvoicedata', $scope.down.selcustomername));
      var blob = b64toBlob(Excel.tableToExcel('#fullinvoicedata', $scope.down.selcustomername), 'data:application/vnd.ms-excel;base64');
      var bloblUrl = URL.createObjectURL(blob);
      //anchorElement.href = Excel.tableToExcel('#fullinvoicedata', $scope.down.selcustomername);
      anchorElement.href = bloblUrl;
      //console.log(anchorElement.href);
      anchorElement.target = '_self';
      anchorElement.download = 'INTERNAL USE ONLY - ' + $scope.down.selcustomername + ' ' + $scope.down.selectedyear+ '-'+ $scope.down.selectedmonth +'.xls';
      document.body.appendChild(anchorElement);
      anchorElement.click();
      if($scope.down.selcustshipmentman.length!=0)
        exportManually();


      /*var file = new Blob([response], {type: 'Content-Disposition'});
      var fileURL = URL.createObjectURL(file);
      var anchorElement = document.createElement('a');
      anchorElement.href = fileURL;
      anchorElement.target = '_self';
      anchorElement.download = 'export_'+inp+'.csv';
      document.body.appendChild(anchorElement);
      anchorElement.click();*/
    };

    function exportManually(){
      var anchorElement = document.createElement('a');
      var blob = b64toBlob(Excel.tableToExcel('#fullmaninvoicedata', $scope.down.selcustomername), 'data:application/vnd.ms-excel;base64');
      var bloblUrl = URL.createObjectURL(blob);
      anchorElement.href = bloblUrl;
      anchorElement.target = '_self';
      anchorElement.download = 'INTERNAL USE ONLY - ' + $scope.down.selcustomername + ' ' + $scope.down.selectedyear+ '-'+ $scope.down.selectedmonth +'_sonstiges.xls';
      document.body.appendChild(anchorElement);
      anchorElement.click();
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

    $scope.down.markAsBilled = function markAsBilled(custid){
      $http.post('/api/markasbilled',{customer: custid,year:$scope.down.selectedyear,month:$scope.down.selectedmonth,data:$scope.down.selcustshipmentseu,totalvk:$scope.down.totalneteu})
      .success(function(response,status,fn,xhr){
        //$scope.down.getInvoiceUploadDate();
        $route.reload();
      });
      //console.log(custid);
      //console.log($scope.down.selcustshipmentseu);
    };

    $scope.down.getNextUid = function getNextUid(){
      $http({
        method: 'GET',
        url: '/api/getnextuid'
      }).
      success(function(data){
        $scope.down.nextuid = data;
        //console.log(data);
        //return data;
      });
    };

    $scope.down.getInvoiceUploadDate();
    /*$http.post('/api/getinvoiceuploaddate')
    .success(function(response,status,fn,xhr){
      console.log(response);
    })*/
  }).
  controller('SettingsCtrl', function ($scope,$http){
    $scope.settings = {};
    $scope.settings.title = 'Settings';
    var x= new Date();
    x.setDate(1);
    x.setMonth(x.getMonth());
    $scope.settings.month = x;

    //FUELSURCHARGE
    $scope.settings.getFuelSurchargeHistory = function getFuelSurchargeHistory(){
      $http({
        method: 'GET',
        url: '/api/getfuelsurchargehistory'
      }).
      success(function(data){
        $scope.settings.fuelhistory = data;
      });
    };

    $scope.settings.addFuelSurcharge = function addFuelSurcharge(){
      $http.post('/api/addfuelsurcharge', {fueldate:$scope.settings.month.toMysqlFormat(),std:$scope.settings.std.toFixed(2),exp:$scope.settings.exp.toFixed(2)})
      .success(function(response,status,fn,xhr){
        $scope.settings.getFuelSurchargeHistory();
      });
    }

    $scope.settings.checkinputs = function checkinputs(){
      return isNaN(parseFloat($scope.settings.std).toFixed(2)) || isNaN(parseFloat($scope.settings.exp).toFixed(2));
    };

    $scope.settings.getFuelSurchargeHistory();

    //MAUTSURCHARGE
    $scope.settings.getMautSurcharge = function getMautSurcharge(){
      $http({
        method: 'GET',
        url: '/api/getmautsurcharge'
      }).
      success(function(data){
        $scope.settings.currentmaut = data;
      });
    };

    $scope.settings.checkmautinputs = function checkmautinputs(){
      return isNaN(parseFloat($scope.settings.mautat).toFixed(2)) || isNaN(parseFloat($scope.settings.mautatde).toFixed(2));
    };

    $scope.settings.addMautSurcharge = function addMautSurcharge(){
      $http.post('/api/addmautsurcharge', {at:$scope.settings.mautat,atde:$scope.settings.mautatde})
      .success(function(response,status,fn,xhr){
        $scope.settings.getMautSurcharge();
      });
    };

    $scope.settings.getMautSurcharge();

    //PRIVATESURCHARGE
    $scope.settings.getPrivateSurchargeSettings = function getPrivateSurchargeSettings(){
      $http({
        method:'GET',
        url: '/api/getprivatesurchargesettings'
      }).
      success(function(data){
        $scope.settings.currentprivate = data;
      });
    };

    $scope.settings.checkprivateinput = function checkprivateinput(){
      return isNaN(parseFloat($scope.settings.privatesurcharge).toFixed(2));
    };

    $scope.settings.addPrivateSurchargeSettings = function addPrivateSurchargeSettings(){
      $http.post('/api/addprivatesurchargesettings', {priceprivate: $scope.settings.privatesurcharge})
      .success(function(response,status,fn,xhr){
        $scope.settings.getPrivateSurchargeSettings();
      });
    };

    $scope.settings.getPrivateSurchargeSettings();

    //CODSURCHARGE
    $scope.settings.getCodSurchargeSettings = function getCodSurchargeSettings(){
      $http({
        method: 'GET',
        url: '/api/getcodsurchargesettings'
      }).
      success(function(data){
        $scope.settings.currentcod  = data;
      });
    };

    $scope.settings.checkcodinput = function checkcodinput(){
      return isNaN(parseFloat($scope.settings.codat).toFixed(2)) || isNaN(parseFloat($scope.settings.codde).toFixed(2)) || isNaN(parseFloat($scope.settings.codint).toFixed(2));
    };

    $scope.settings.addCodSurchargeSettings = function addCodSurchargeSettings(){
      $http.post('/api/addcodsurchargesettings', {at:$scope.settings.codat,de:$scope.settings.codde,internat:$scope.settings.codint})
      .success(function(response,status,fn,xhr){
        $scope.settings.getCodSurchargeSettings();
      });
    }

    $scope.settings.getCodSurchargeSettings();

  }).
  controller('ManuallyCtrl', function ($scope,$http){
    $scope.manually = {};
    $scope.manually.title = 'Add manually';

    $scope.manually.mandata = {};
    $scope.manually.mandata.dateof = new Date;
    var y= new Date();
    y.setDate(1);
    y.setMonth(y.getMonth()-1);
    $scope.manually.mandata.dateofinv = y;
    $scope.manually.mandata.savethis_data = {};
    $scope.manually.mandata.savethis_surcharge = {};

    function resetData(){
      //$scope.manually.mandata = {};
      /*$scope.manually.mandata.dateof = new Date;
      var y= new Date();
      y.setDate(1);
      y.setMonth(y.getMonth()-1);
      $scope.manually.mandata.dateofinv = y;
      $scope.manually.mandata.savethis_data = {};
      $scope.manually.mandata.savethis_surcharge = {};
      $scope.manually.mandata.getManuallyFormData();*/
      $scope.manually.mandata.trackingnr = '';
      $scope.manually.mandata.pieces = '';
      $scope.manually.mandata.invoicenr = '';
      $scope.manually.mandata.reference = '';
      $scope.manually.mandata.weight = '';
      $scope.manually.mandata.ekprice = '';
      $scope.manually.mandata.vkprice = '';
      $scope.manually.mandata.vat = '';
      //$scope.manually.mandata.from = {};
      $scope.manually.mandata.to = {};
      $scope.manually.mandata.sonstiges = [];
      $scope.manually.mandata.getManuallyFormData();
    }

    $scope.manually.mandata.getManuallyFormData = function getManuallyFormData(){
      $http({
        method: 'GET',
        url: '/api/getmanuallyformdata'
      }).
      success(function(data){
        //console.log(data.vat);
        $scope.manually.mandata.country = {
          availableOptions: data.country,
          selectedOption: {id: 'DE', name: 'Deutschland'},
          selectedOption2: {id: 'AT', name: 'Österreich'}
        };

        $scope.manually.mandata.customers = {
          availableOptions: data.customers,
          selectedOption: {id: '1', name: 'ACP IT Solutions GmbH'}
        };

        $scope.manually.mandata.forwarders = {
          availableOptions: data.forwarders,
          selectedOption: {id: '1', name:'Bil Trans'}
        };

        $scope.manually.mandata.services = {
          availableOptions: data.services,
          selectedOption: {id: '1', name:'FREIGHT'}
        };

        $scope.manually.mandata.surcharges = {
          availableOptions: data.surcharges,
          selectedOption: {id: '1', name: 'Treibstoffzuschlag'}
        };

        $scope.manually.mandata.vat = {
          availableOptions: data.vat,
          selectedOption: {id: '1', name: 'AT - AT', main_vat_code: '2', percentage: 0.2 }
        };

        $scope.manually.mandata.vat2 = {
          availableOptions: data.vat,
          selectedOption: {id: '1', name: 'AT - AT', main_vat_code: '2', percentage: 0.2}
        };

        $scope.manually.mandata.servicetype = {
          availableOptions: [{id: '0', name: 'Standard'},{id: '1', name:'Express'}],
          selectedOption: {id: '0', name:'Standard'}
        }
      });
    };

    $scope.manually.mandata.sonstiges = [];

    $scope.manually.mandata.addmanSurcharge = function addmanSurcharge(){
      //$scope.manually.mandata.sonstiges.push({sel: $scope.manually.mandata.surcharges.selectedOption, ekp: $scope.manually.mandata.surcharges.ekprice, vkp: $scope.manually.mandata.surcharges.vkprice, vat2: $scope.manually.mandata.vat2.selectedOption.id});
      if($scope.manually.mandata.surcharges.selectedOption.id == '1'){
        $http.post('/api/addmanuallyfuelcalc', {custid: $scope.manually.mandata.customers.selectedOption.id, surid: $scope.manually.mandata.surcharges.selectedOption, dateforuse: $scope.manually.mandata.dateofinv.toMysqlFormat(), express: $scope.manually.mandata.servicetype.selectedOption.id})
          .success(function(response,status,fn,xhr){
            if(typeof($scope.manually.mandata.vkprice)==='undefined' || isNaN($scope.manually.mandata.vkprice) || typeof($scope.manually.mandata.surcharges.vkprice)==='undefined' || isNaN($scope.manually.mandata.surcharges.vkprice)){
              $scope.manually.mandata.surcharges.vkprice = 0;
            }else{
              $scope.manually.mandata.surcharges.vkprice = parseFloat($scope.manually.mandata.vkprice)*((response/100));
            }
            if(typeof($scope.manually.mandata.surcharges.ekprice)==='undefined' || isNaN($scope.manually.mandata.surcharges.ekprice)){
              $scope.manually.mandata.surcharges.ekprice = 0;
            }
            $scope.manually.mandata.sonstiges.push({sel: $scope.manually.mandata.surcharges.selectedOption, ekp: $scope.manually.mandata.surcharges.ekprice, vkp: $scope.manually.mandata.surcharges.vkprice, vat2: $scope.manually.mandata.vat2.selectedOption.id});
          });
      }else{
        $scope.manually.mandata.sonstiges.push({sel: $scope.manually.mandata.surcharges.selectedOption, ekp: $scope.manually.mandata.surcharges.ekprice, vkp: $scope.manually.mandata.surcharges.vkprice, vat2: $scope.manually.mandata.vat2.selectedOption.id});
      }
    };

    $scope.manually.mandata.delmanSurcharge = function delmanSurcharge(thingsid){
      $scope.manually.mandata.sonstiges.splice(thingsid,1);
    };

    $scope.manually.mandata.saveManData = function saveManData(){
      $scope.manually.mandata.savethis_data.trackingnumber = $scope.manually.mandata.trackingnr;
      $scope.manually.mandata.savethis_data.numberofpackets = $scope.manually.mandata.pieces;
      $scope.manually.mandata.savethis_data.main_invoice_nr = $scope.manually.mandata.invoicenr;
      $scope.manually.mandata.savethis_data.labeldate = $scope.manually.mandata.dateof.toMysqlFormat();
      $scope.manually.mandata.savethis_data.reference1 = $scope.manually.mandata.reference;
      $scope.manually.mandata.savethis_data.weight = $scope.manually.mandata.weight;
      $scope.manually.mandata.savethis_data.manually_service_id = $scope.manually.mandata.services.selectedOption.id;
      $scope.manually.mandata.savethis_data.manually_forwarder_id = $scope.manually.mandata.forwarders.selectedOption.id;
      $scope.manually.mandata.savethis_data.main_customer_id = $scope.manually.mandata.customers.selectedOption.id;
      $scope.manually.mandata.savethis_data.shipper_name1 = $scope.manually.mandata.from.companyname;
      $scope.manually.mandata.savethis_data.shipper_name2 = $scope.manually.mandata.from.contactname;
      $scope.manually.mandata.savethis_data.shipper_country = $scope.manually.mandata.country.selectedOption.id;
      $scope.manually.mandata.savethis_data.shipper_postalcode = $scope.manually.mandata.from.postalcode;
      $scope.manually.mandata.savethis_data.receiver_name1 = $scope.manually.mandata.to.companyname;
      $scope.manually.mandata.savethis_data.receiver_name2 = $scope.manually.mandata.to.contactname;
      $scope.manually.mandata.savethis_data.receiver_country = $scope.manually.mandata.country.selectedOption2.id;
      $scope.manually.mandata.savethis_data.receiver_postalcode = $scope.manually.mandata.to.postalcode;
      $scope.manually.mandata.savethis_data.manually_ek = $scope.manually.mandata.ekprice;
      $scope.manually.mandata.savethis_data.manually_vk = $scope.manually.mandata.vkprice;
      $scope.manually.mandata.savethis_data.express = $scope.manually.mandata.servicetype.selectedOption.id;
      $scope.manually.mandata.savethis_data.vat = $scope.manually.mandata.vat.selectedOption.id;

      $scope.manually.mandata.savethis_surcharge = $scope.manually.mandata.sonstiges;

      $http.post('/api/setmanually', {data: $scope.manually.mandata.savethis_data, surcharge: $scope.manually.mandata.savethis_surcharge, invoicedate: $scope.manually.mandata.dateofinv.toMysqlFormat()})
          .success(function(response,status,fn,xhr){
            resetData();
          });

    };

      $scope.manually.mandata.from = {};
      $scope.manually.mandata.to = {};
    /*$scope.manually.mandata.invoicenr = 'ABCD1234';
    $scope.manually.mandata.ekprice = '11.5';
    $scope.manually.mandata.vkprice = '12.13';
    $scope.manually.mandata.weight = '3.4';
    $scope.manually.mandata.pieces = 1;
    $scope.manually.mandata.trackingnr = 'ABCDEFGHIJK5698';
    $scope.manually.mandata.reference = 'testref';

    $scope.manually.mandata.from = {};
    $scope.manually.mandata.from.companyname = 'tescomfrom';
    $scope.manually.mandata.from.contactname = 'testcontact';
    $scope.manually.mandata.from.postalcode = '12345';

    $scope.manually.mandata.to = {};
    $scope.manually.mandata.to.companyname = 'tecompto';
    $scope.manually.mandata.to.contactname = 'testcontac';
    $scope.manually.mandata.to.postalcode = '9876';*/

    $scope.manually.mandata.getManuallyFormData();
  }).
  controller('StatisticsCtrl', function (Excel,$scope,$http,$timeout, $filter){
    $scope.statistics = {};
    $scope.statistics.title = 'Statistics';

    $scope.statistics.stat = {};
    $scope.statistics.stat.stats1 = {};
    //$scope.statistics.stat.stats1.packagesVolChart;
    //$scope.statistics.stat.stats1.packagesWeightChart;

    $scope.statistics.stat.getCustData = function getAllChart(){
      $http({
        method: 'GET',
        url: '/api/getcustomers'
      }).
      success(function(data){
        $scope.statistics.stat.customers = data.result;
      });
      /*$http({
        method: 'GET',
        url: '/api/getchartmain/1'
      }).
      success(function(data){
        $scope.statistics.vol_multibarchartdata = data;
      });*/
    };

    $scope.statistics.stat.exportToExcel = function(){
      var anchorElement = document.createElement('a');
      var blob = b64toBlob(Excel.tableToExcel('#fullstatdiv', $scope.statistics.stat.selectedcustname), 'data:application/vnd.ms-excel;base64');
      var bloblUrl = URL.createObjectURL(blob);
      anchorElement.href = bloblUrl;
      anchorElement.target = '_self';
      anchorElement.download = $scope.statistics.stat.selectedcustname + '-' + $scope.statistics.stat.fromdate.toMysqlFormat2()+'-'+$scope.statistics.stat.todate.toMysqlFormat2() + '.xls';
      document.body.appendChild(anchorElement);
      anchorElement.click();
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

    $scope.statistics.stat.getAllCust = function getAllCust(){
      if($scope.statistics.stat.checkb){
        $scope.statistics.stat.cust = '%';
      }else{
        $scope.statistics.stat.cust = null;
      }
    };

    $scope.statistics.stat.getChartData = function getChartData(){
      //console.log('dataFLOW');
      if(typeof($filter('filter')($scope.statistics.stat.customers, function (d) {return d.id === $scope.statistics.stat.cust;})[0])=='undefined'){
        $scope.statistics.stat.selectedcustname = 'noname';
      }else{
        $scope.statistics.stat.selectedcustname = $filter('filter')($scope.statistics.stat.customers, function (d) {return d.id === $scope.statistics.stat.cust;})[0].name;
      }
      //console.log($filter('filter')($scope.statistics.stat.customers, {id: 224})[0].name);

      //console.log($scope.statistics.stat.cust);
      //console.log($scope.statistics.stat.fromdate.toMysqlFormat2());
      //console.log($scope.statistics.stat.todate.toMysqlFormat2());
      $http.post('/api/getstatistics', {customer: $scope.statistics.stat.cust, fromdate:$scope.statistics.stat.fromdate.toMysqlFormat2(), todate: $scope.statistics.stat.todate.toMysqlFormat2()})
          .success(function(response,status,fn,xhr){
            //console.log(response);
            //$scope.statistics.stat.stats1.packagesVolChart = null;
            //$scope.statistics.stat.stats1.packagesWeightChart = null;
            //$("svg").empty();
            //$scope.statistics.stat.stats1 = {};
            $scope.statistics.stat.stats1 = response;
            $scope.statistics.stat.packagesVolChart = response.packagesVolChart;
            $scope.statistics.stat.packagesWeightChart = response.packagesWeightChart;
            $scope.statistics.stat.eunoneu_donutchartdata = response.eunoneuDonut;
            $scope.statistics.stat.eucountry_donutchartdata = response.euDonut;
            $scope.statistics.stat.noneucountry_donutchartdata = response.noneuDonut;
            $scope.api0.updateWithData($scope.statistics.stat.packagesVolChart);
            $scope.api1.updateWithData($scope.statistics.stat.packagesWeightChart);
            $scope.api2.updateWithData($scope.statistics.stat.eunoneu_donutchartdata);
            $scope.api3.updateWithData($scope.statistics.stat.eucountry_donutchartdata);
            $scope.api4.updateWithData($scope.statistics.stat.noneucountry_donutchartdata);
            /*$timeout(function(){
              $scope.$apply();
            });*/

            //$scope.statistics.stat.updateCharts();
          });
    };

    $scope.statistics.stat.vol_multibarchartoptions = {
      chart: {
        type:'multiBarChart',
        height: 450,
        margin:{
          top: 20,
          right: 20,
          bottom: 45,
          left: 50
        },
        clipEdge: true,
        duration: 500,
        stacked: true,
        xAxis:{
          axisLabel: "",
          showMaxMin: false,
          tickFormat: function (d) {
            //return d3.time.format('%d/%m/%Y')(new Date(d));
            return d3.time.format('%b %d')(new Date(d));
          }
        },
        yAxis:{
          axisLabel: "Nr. of shipments",
          axisLabelDistance: -10,
          tickFormat: d3.format(',.0d')
        }
      }
    };

    $scope.statistics.stat.weight_multibarchartoptions = {
      chart: {
        type:'multiBarChart',
        height: 450,
        margin:{
          top: 20,
          right: 20,
          bottom: 45,
          left: 60
        },
        clipEdge: true,
        duration: 500,
        stacked: true,
        xAxis:{
          axisLabel: "",
          showMaxMin: false,
          tickFormat: function (d) {
            //return d3.time.format('%d/%m/%Y')(new Date(d));
            return d3.time.format('%b %d')(new Date(d));
          }
        },
        yAxis:{
          axisLabel: "Weight",
          axisLabelDistance: 0
        }
      }
    };

    $scope.statistics.stat.eunoneu_donutchartoptions = {
      chart: {
        type: 'pieChart',
        height: 350,
        valueFormat: d3.format('.0f'),
        donut: true,
        x: function(d){return d.eu_mem;},
        y: function(d){return d.y;},
        showLabels: true,
        labelType: 'percent',

        pie: {
          startAngle: function(d) { return d.startAngle/2-Math.PI/2},
          endAngle: function(d) { return d.endAngle/2-Math.PI/2}
        },
        duration: 500,
        legend: {
          margin: {
            top: 5,
            right: 140,
            bottom: 5,
            left: 0
          }
        }
      }
    };

    $scope.statistics.stat.country_donutchartoptions = {
      chart: {
        type: 'pieChart',
        height: 600,
        valueFormat: d3.format('.0f'),
        x: function(d){return d.receiver_country;},
        y: function(d){return d.y;},
        showLabels: true,
        labelType: 'percent',
        duration: 500,
        labelThreshold: 0.01,
        labelSunbeamLayout: true,
        legend: {
            margin: {
                top: 5,
                right: 35,
                bottom: 5,
                left: 0
            }
        }
      }
    };

    $scope.statistics.stat.getCustData();
  });

  function twoDigits(d) {
      if(0 <= d && d < 10) return "0" + d.toString();
      if(-10 < d && d < 0) return "-0" + (-1*d).toString();
      return d.toString();
  }

  Date.prototype.toMysqlFormat = function() {
      return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
  };
  Date.prototype.toMysqlFormat2 = function() {
      return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate());
  };
