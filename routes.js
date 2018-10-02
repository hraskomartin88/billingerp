var db = require('./config/mysql');
var fs = require('fs');
var flow = require('./config/flow-node')('tmp');
var blogic = require('./config/businesslogic');
var zplogic = require('./config/zonepricelogic');
var plogic = require('./config/pricecalclogic');
var path = require('path');
var async = require('async');
var zservarr = ['null','stdsingle','stdmulti','exp'];

const safecompare = require('safe-compare');
const simpleGit = require('simple-git');
const crypto = require('crypto');

module.exports = function(app){

  String.prototype.startsWith = function(needle){
    if((this.indexOf(needle + '-') && this.indexOf(needle + ' ')) == 0 || this == needle){
      return true;
    }else{
      if(needle.length>3){
        if(this.indexOf(needle)==0) return true;
      }else return false;
    }
  };
  //GET

  /*app.get('/customers', function(req,res){
    res.render('index', {title: 'Customers'});
  });*/

  //POST
  /*app.post('/getinvoices', function(req,res){
    db.getInvoices(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.send(result);
      }
    });
  });*/
  app.post('/webhook', function(req,res){
    console.log('webhook called');
    var payloadstring = 'sha1=' + crypto.createHmac('sha1', 'abcd54321').update(JSON.stringify(req.body)).digest('hex');
    //console.log(safecompare(payloadstring, req.headers['x-hub-signature']));
    if(safecompare(payloadstring, req.headers['x-hub-signature'])){
      if(req.body.ref == 'refs/heads/master'){
        //console.log(req.body);
        simpleGit().pull(function(err, resp){
          console.log(err);
          console.log(resp);
        });
      }
      res.status(200).json({success: true, message: 'webhook ok'});
    }else{
      res.status(401).json({sucess: false, message: 'Not authorized'});
    }
  });

  //ANGULARJS
  app.get('/api/getcustomers',function(req,res){
    //console.log(moment_en('2015-December','YYYY-MMM').format('YYYY-MM-DD 12:00:00'));
    db.getCustomers(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json({
          title: 'Customers',
          result:result
        });
      }
    })
    /*res.json({
      name: 'G'
    });*/
  });

  app.post('/api/addcustomer', function(req,res){
    db.addCustomer(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  });

  app.post('/api/removecustomer', function(req,res){
    db.removeCustomer(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  });

  app.post('/api/updatecustomer', function(req,res){
    db.updateCustomer(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  });

  app.post('/api/assigncustomers', function(req,res){
    //console.log(req.body.data);
    //res.send(200);
    db.setFoundCustomers(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        db.setFoundCustomerssurTrack(req.body.data, function(err,result2){
          if(err){
            console.log(err);
          }
          if(result2){
            console.log(result2);
            res.send(200);
          }
        });
        res.send(200);
      }
    });
  });

  app.post('/api/addreference', function(req,res){
    //console.log(req.body.data);
    db.addReference(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  });

  app.post('/api/addaccount', function(req,res){
    //console.log(req.body.data);
    db.addAccount(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  })

  app.post('/api/removereference', function(req,res){
    //console.log(req.body.data);
    db.removeReference(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  });

  app.post('/api/removeaccount', function(req,res){
    //console.log(req.body.data);
    db.removeAccount(req.body.data,function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    })
  });

  app.post('/api/closeinvoice', function(req,res){
    //console.log(req.body.data);
    plogic.startPriceCalc(req.body.data,function(err){
      if(err) console.log(err);
      db.setInvoiceClosed(req.body.data,function(err2){
        if(err2) console.log(err2);
        console.log('|ALL FINISHED|');
        res.send(200);
      });
    });
    /*db.setInvoiceClosed(req.body.data,function(err){
      res.send(200);
    });*/
    //res.send(200);
  });

  app.get('/api/geteucountrylist', function(req,res){
    db.getEuCountries(function(err,result){
      if(err) console.log(err);
      //console.log(JSON.parse(JSON.stringify(result)));
      res.send(Object.keys(result).map(function(_) { return result[_].alpha2; }));
    });
  });

  app.post('/api/findcustomers', function(req,res){
    //console.log(req.body.data);
    db.getNoCustInvoices(req.body.data, function(err,result){
      db.getPrefixes(function(err,result2){
        db.getAccounts(function(err,result3){

          var unidentified = result;
          var reference = result2;
          var accountnumbers = result3;
          //console.log(unidentified);
          var identified = [];
          for (item in unidentified){
            for (ref in reference){
              if(reference[ref].hasOwnProperty('customerreference')){
                if(unidentified[item].hasOwnProperty('ref1') && unidentified[item].hasOwnProperty('ref2')){
                  if(unidentified[item].ref1.startsWith(reference[ref].customerreference) || unidentified[item].ref2.startsWith(reference[ref].customerreference)){
                    //console.log(unidentified[item].id + ' | ' + reference[ref].custid);
                    items = {};
                    items["mainid"] = unidentified[item].id;
                    items["custid"] = reference[ref].main_customer_id;
                    //NOWOTNY CO KG GMBH WH DE SEPARATION
                    if(reference[ref].main_customer_id == 24 && unidentified[item].country=='DE'){
                      items["custid"] = 204;
                    }
                    if(reference[ref].main_customer_id == 198 && unidentified[item].country=='DE'){
                      items["custid"] = 205;
                    }
                    identified.push(items);

                    //console.log(reference[ref].main_customer_id);
                  }
                }
              }
              //console.log(reference[ref].customerreference.startsWith("PC"));
            }

            for(acc in accountnumbers){
              if(accountnumbers[acc].hasOwnProperty('accnr')){
                if(unidentified[item].hasOwnProperty('accnr')){
                  if(unidentified[item].accnr.startsWith(accountnumbers[acc].accnr)){
                    items2 = {};
                    items2["mainid"] = unidentified[item].id;
                    items2["custid"] = accountnumbers[acc].main_customer_id;
                    identified.push(items2);
                  }
                }
                //console.log(accountnumbers[acc]);
                //console.log(unidentified[item]);

              }
            }


            //console.log(unidentified[item].ref1);
          }
          //console.log(identified.length);
          if(identified.length>0){
            db.setFoundCustomers(identified, function(err,result){
              res.send(200);
            });
          }else{
            res.send(200);
          }

        });
      });
    });
  });

  app.post('/api/findcustomerssur', function(req,res){
    //console.log(req.body.data);
    db.getNoCustInvoicessur(req.body.data, function(err,result){
      db.getPrefixes(function(err,result2){
        db.getAccounts(function(err,result3){

          var unidentified = result;
          var reference = result2;
          var accountnumbers = result3;
          //console.log(unidentified);
          var identified = [];
          for (item in unidentified){
            for (ref in reference){
              if(reference[ref].hasOwnProperty('customerreference')){
                if(unidentified[item].hasOwnProperty('ref1') && unidentified[item].hasOwnProperty('ref2')){
                  if(unidentified[item].ref1.startsWith(reference[ref].customerreference) || unidentified[item].ref2.startsWith(reference[ref].customerreference)){
                    //console.log(unidentified[item].id + ' | ' + reference[ref].custid);
                    items = {};
                    items["mainid"] = unidentified[item].id;
                    items["custid"] = reference[ref].main_customer_id;
                    //NOWOTNY CO KG GMBH WH DE SEPARATION
                    if(reference[ref].main_customer_id == 24 && unidentified[item].country=='DE'){
                      items["custid"] = 204;
                    }
                    if(reference[ref].main_customer_id == 198 && unidentified[item].country=='DE'){
                      items["custid"] = 205;
                    }
                    identified.push(items);

                    //console.log(reference[ref].main_customer_id);
                  }
                }
              }
              //console.log(reference[ref].customerreference.startsWith("PC"));
            }

            for(acc in accountnumbers){
              if(accountnumbers[acc].hasOwnProperty('accnr')){
                if(unidentified[item].hasOwnProperty('accnr')){
                  if(unidentified[item].accnr!==null){
                    if(unidentified[item].accnr.startsWith(accountnumbers[acc].accnr)){
                      items2 = {};
                      items2["mainid"] = unidentified[item].id;
                      items2["custid"] = accountnumbers[acc].main_customer_id;
                      identified.push(items2);
                    }
                  }else{
                    console.log('routes.js ln 260 need to be checked. some surchage missing data');
                  }
                }
                //console.log(accountnumbers[acc]);
                //console.log(unidentified[item]);

              }
            }


            //console.log(unidentified[item].ref1);
          }
          //console.log(identified.length);
          if(identified.length>0){
            db.setFoundCustomerssur(identified, function(err,result){
              res.send(200);
            });
          }else{
            res.send(200);
          }

        });
      });
    });
  });

  app.get('/api/getmanuallyformdata', function(req,res){
    var finalresult = {};

    async.parallel([
        function(callback){
          db.getManuallyCountryList(function(err,result){
            if (err) return callback(err);
            finalresult.country = result;
            callback();
          });
        },
        function(callback){
          db.getManuallyCustomerList(function(err,result2){
            if (err) return callback(err);
            finalresult.customers = result2;
            callback();
          });
        },
        function(callback){
          db.getManuallyForwarder(function(err,result3){
            if (err) return callback(err);
            finalresult.forwarders = result3;
            callback();
          });
        },
        function(callback){
          db.getManuallyServices(function(err,result4){
            if (err) return callback(err);
            finalresult.services = result4;
            callback();
          });
        },
        function(callback){
          db.getManuallySurcharges(function(err,result5){
            if (err) return callback(err);
            finalresult.surcharges = result5;
            callback();
          });
        },
        function(callback){
          db.getManuallyVAT(function(err,result6){
            if (err) return callback(err);
            finalresult.vat = result6;
            callback();
          });
        }
    ],function(err){
      if(err)
        console.log(err);
      //console.log('DONE');
      res.json(finalresult);
    });
  });

  app.post('/api/addmanuallyfuelcalc', function(req,res){
    var calcwithwhat = parseFloat(0.00);
    db.getManFuelSurcharge(req.body.custid, req.body.dateforuse, req.body.express, function(err,stdexp){
      if(err){
        console.log(err);
        //callback(err);
      }
      //console.log(stdexp);

      //SAJAT VAGY GLOBAL VAGY MAS
      async.waterfall([
        function(callback){
          if(parseFloat(stdexp[0][0].custprice)===-1.00){
            //GLOBAL
            calcwithwhat = parseFloat(stdexp[1][0].globprice);
            callback(null,calcwithwhat);
            //console.log(stdexp);
          }else if(parseFloat(stdexp[0][0].custprice)===0){
            //INCLUDED
          }else if(parseFloat(stdexp[0][0].custprice)===-2.00){
            //OTHER
          }else{
            //SAJAT
            calcwithwhat = parseFloat(stdexp[0][0].custprice);
            callback(null,calcwithwhat);
          }
        }
      ], function(err,result){
        //console.log(result);
        res.json(result);
      });
    });
  });

  app.post('/api/setmanually', function(req,res){
    var data = req.body.data;
    var surcharges = req.body.surcharge;
    var invoicedater = req.body.invoicedate;
    //console.log(surcharges);

    async.series([
        function(callback){
          var invoicedata = {};
          invoicedata.invoiceno = data.main_invoice_nr;
          invoicedata.supplierid = data.manually_forwarder_id;
          invoicedata.dateins = data.labeldate;
          invoicedata.datetoinv = invoicedater;
          db.addManuallyInvoice(invoicedata, function(err,result){
            if(err) return callback(err);
            callback();
          });
        },
        function(callback){
          async.parallel([
            function(callback){
              //DATA
              db.setManuallyData(data, function(err,result){
                if(err) return callback(err);
                callback();
              });
            },
            function(callback){
              //SURCHARGES
              var finaljson = {};
              finaljson.trackingnumber = data.trackingnumber;
              finaljson.numberofpackets = data.numberofpackets;
              finaljson.main_invoice_nr = data.main_invoice_nr;
              finaljson.labeldate = data.labeldate;
              finaljson.reference1 = data.reference1;
              finaljson.weight = data.weight;
              finaljson.manually_forwarder_id = data.manually_forwarder_id;
              finaljson.main_customer_id = data.main_customer_id;
              finaljson.shipper_country = data.shipper_country;
              finaljson.receiver_country = data.receiver_country;

              async.eachSeries(surcharges, function(item, callback){
                finaljson.manually_surcharge_id = item.sel.id;
                finaljson.manually_ek = item.ekp;
                finaljson.manually_vk = item.vkp;
                finaljson.vat = item.vat2;
                db.setManuallySurcharge(finaljson, function(err,result){
                  if(err) return callback(err);
                  callback();
                })
              }, function done(){
                callback();
              });
            }
          ], function(err){
            if(err)
              console.log(err);
            //console.log('DONE2');
            callback();
          });
        }
    ], function(err){
      if (err) console.log(err)
      res.send();
    });
  });

  app.get('/api/getmanshpmnt/:id',function(req,res){
    db.getManShpmnt(req.params.id, function(err,result){
      if(err) return callback(err);
      res.json(result);
    });
  });

  app.post('/api/delmanshpmnt', function(req,res){
    db.delManShpmnt(req.body.data, function(err,result){
      if(err) return callback(err);
      res.send();
    });
  });

  app.get('/api/getmansrchg/:id', function(req,res){
    db.getManSrchg(req.params.id, function(err,result){
      if (err) return callback(err);
      res.json(result);
    });
  });

  app.post('/api/delmansrchg', function(req,res){
    db.delManSrchg(req.body.data, function(err,result){
      if(err) return callback(err);
      res.send();
    });
  });

  app.post('/api/setmaninvclosed', function(req,res){
    db.setManInvClosed(req.body.data, function(err,result){
      if (err) return callback(err);
      res.send();
    });
  });

  app.post('/api/deletemaninvoice', function(req,res){
    db.delManInv(req.body.data, function(err, result){
      if(err) return callback(err);
      res.send();
    });
  });

  app.get('/api/getinvoices',function(req,res){
    db.getInvoices(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        //console.log(result);


        async.waterfall([
          function(callback2){
            var datesinjson = {};
            async.forEachOf(result[3], function(item,key, callback){
              datesinjson[result[3][key].invyear] = [];
              callback(null);
            }, function(err){
              if(err) console.error(err);
              //console.log(datesinjson);
              callback2(null,datesinjson);
            });
          },
          function(datesinjson ,callback2){
            async.forEachOf(result[3], function(item,key, callback){
              datesinjson[result[3][key].invyear].push(result[3][key].invmonth);
              callback(null);
            }, function(err){
              if(err) console.error(err);
              //console.log(datesinjson);
              callback2(null,datesinjson);
            });
          }
          ], function(err,resultdates){
            //console.log(resultdates);
            var mandatajson = {};
            var maninvcount = {};
            async.parallel([
                function(callback){
                  db.getManuallyInvoiceDisplay(function(err,parinv){
                    if(err) return callback(err);
                    mandatajson = parinv;
                    callback();
                  });
                  //console.log(result[3]);
                },
                function(callback){
                  db.getManuallyInvoicesCount(function(err,cntinv){
                    if (err) return callback(err);
                    maninvcount = cntinv;
                    callback();
                  });
                }
            ], function(err){
              res.json({
                title: 'Rechnungen',
                result0:result[0],
                result1:result[1],
                result2:result[2],
                result3:resultdates,
                result4:result[4],
                result5:result[5],
                mandata: mandatajson,
                mandatacount: maninvcount
              });
            });
            /*res.json({
              title: 'Invoices',
              result0:result[0],
              result1:result[1],
              result2:result[2],
              result3:resultdates,
              result4:result[4],
              result5:result[5]
            });*/
          });

        /*res.json({
          title: 'Invoices',
          result0:result[0],
          result1:result[1],
          result2:result[2],
          result3:result[3]
        });*/
      }
    })
  });

  app.get('/api/getinvoiceuploaddate', function(req,res){
    db.getInvoiceUploadDate(function(err,result){
      if(err) console.log(err);
      if(result){
        async.waterfall([
          function(callback2){
            var datesinjson = {};
            async.forEachOf(result, function(item,key, callback){
              datesinjson[result[key].invyear] = [];
              callback(null);
            }, function(err){
              if(err) console.error(err);
              //console.log(datesinjson);
              callback2(null,datesinjson);
            });
          },
          function(datesinjson ,callback2){
            async.forEachOf(result, function(item,key, callback){
              datesinjson[result[key].invyear].push(result[key].invmonth);
              callback(null);
            }, function(err){
              if(err) console.error(err);
              //console.log(datesinjson);
              callback2(null,datesinjson);
            });
          }
          ], function(err,resultdates){
            //console.log(resultdates);
            res.json(resultdates);
          });
      }
    });
  });

  app.post('/api/getcustomerclsinv',function(req,res){
    //console.log(req.body);
    //res.send('ola');
    db.getCustomerIdForClosedInvoices(req.body.selyear,req.body.selmonth, function(err,result){
      if(err){
        console.log(err);
        res.send(503);
      }
      if(result){
        var resultarr = [];
        //console.log(result[1]);
        async.forEachOf(result[0], function(item,key,callback){
          if(item.hasOwnProperty('main_customer_id')){
            resultarr.push(item.main_customer_id);
            callback();
          }
          //console.log();
        }, function(err){
          //if(err) console.error(err);
          //console.log(resultarr);
          //res.json(resultarr);
          if(err) console.error(err);
          if(result[1].length>0){
            async.forEachOf(result[1], function(item2,key2,callback){
              if(item2.hasOwnProperty('main_customer_id')){
                if(resultarr.indexOf(item2.main_customer_id)==-1){
                  resultarr.push(item2.main_customer_id);
                  callback();
                }else{
                  callback();
                }
              }else{
                callback();
              }
            },function(err){
              if(err) console.error(err);
              res.json(resultarr);
            });
          }else{
            //console.log(resultarr);
            res.json(resultarr);
          }
        });
      }
    });
  });

  /*app.post('/api/getcustomerclsinv',function(req,res){
    db.getCustomerIdForClosedInvoices(req.body.selyear,req.body.selmonth, function(err,result){
      if(err){
        console.log(err);
        res.send(503);
      }
      if(result){
        var resultarr = [];
        async.forEachOf(result[0], function(item,key,callback){
          if(item.hasOwnProperty('main_customer_id')){
            resultarr.push(item.main_customer_id);
            callback();
          }
        }, function(err){
          if(err) console.error(err);
          if(result[1].length>0){
            async.forEachOf(result[1], function(item2,key2,callback){
              if(item2.hasOwnProperty('main_customer_id')){
                if(resultarr.indexOf(item2.main_customer_id)==-1){
                  resultarr.push(item2.main_customer_id);
                  callback();
                }
              }
            },function(err){
              if(err) console.error(err);
              res.json(resultarr);
            });
          }else{
            res.json(resultarr);
          }
        });
      }
    });
  });*/

  app.post('/api/getcustomerclsshipments', function(req,res){
    //console.log(req.body);
    db.getCustomerClosedShipments(req.body.custid,req.body.selyear,req.body.selmonth, function(err,result){
      if(err){
        console.log(err);
        res.send(503);
      }
      if(result){
          let treibstoffnetvk = 0;
                let mautnetvk = 0;
                let hossz = result[0].length;
                let osszvk = 0;
                let osszht = 0;
                let osszek = 0;


                for (let i = 0; i < hossz; i++) {
                    osszvk = osszvk + result[0][i].netvk;
                    osszht = osszht + result[0][i].netht;
                    osszek = osszek + result[0][i].netek;
                }

                //TREIBSTOFF SORT FELRAKJA OSZLOPNAK
                for (let i = 0; i < hossz; i++) {
                    if (result[0][i].tempservice == "TREIBSTOFFZUSCHLAG") {
                        treibstoffnetvk = result[0][i].netvk;
                        for (let x = 0; x < hossz; x++) {
                            if (result[0][x].trackingnumber == result[0][i].trackingnumber && result[0][x].numberofpackets != "") {
                                result[0][x].treibstoffzuschlag = treibstoffnetvk;
                            }
                        }
                    } else {
                        result[0][i].treibstoffzuschlag = 0;
                    }
                }

                //MAUTZUSCHLAG SORT FELRAKJA OSZLOPNAK
                for (let i = 0; i < hossz; i++) {
                    if (result[0][i].tempservice == "MAUTZUSCHLAG AT-DE") {
                        mautnetvk = result[0][i].netvk;
                        for (let x = 0; x < hossz; x++) {
                            if (result[0][x].trackingnumber == result[0][i].trackingnumber && result[0][x].numberofpackets != "") {
                                result[0][x].mautzuschlag = mautnetvk;
                            }
                        }
                    } else if (result[0][i].tempservice == "MAUTZUSCHLAG AT") {
                        mautnetvk = result[0][i].netvk;
                        for (let x = 0; x < hossz; x++) {
                            if (result[0][x].trackingnumber == result[0][i].trackingnumber && result[0][x].numberofpackets != "") {
                                result[0][x].mautzuschlag = mautnetvk;
                            }
                        }
                    } else {
                        result[0][i].mautzuschlag = 0;
                    }
                }

                //TÖRLI A TREIBSTOFFZUSHLAG ÉS A MAUTZUSHCLAG SOROKAT
                let removeIndex = 0;
                while (removeIndex != -1) {
                    removeIndex = result[0].map(function (item) {
                        return item.tempservice;
                    }).indexOf("TREIBSTOFFZUSCHLAG");
                    result[0].splice(removeIndex, 1);
                }

                let removeIndex1 = 0;
                while (removeIndex1 != -1) {
                    removeIndex1 = result[0].map(function (item) {
                        return item.tempservice;
                    }).indexOf("MAUTZUSCHLAG AT-DE");
                    result[0].splice(removeIndex1, 1);
                }

                let removeIndex2 = 0;
                while (removeIndex2 != -1) {
                    removeIndex2 = result[0].map(function (item) {
                        return item.tempservice;
                    }).indexOf("MAUTZUSCHLAG AT");
                    result[0].splice(removeIndex2, 1);
                }

                //A TÁBLÁHOZ CSATOLOM A HÁROM SORT AMI A HERINTERLADEN OLDALON MEGJELENIK
                result[0].push(osszvk);
                result[0].push(osszht);
                result[0].push(osszek);
                res.send(result);
        /*db.getEuCountries(function(err,result2){
          if(err) console.log(err);
          var countryarr = Object.keys(result2).map(function(_) { return result2[_].alpha2; });
          var eu = [];
          var noneu = [];
          var resultfin = [];
          async.forEachOf(result, function(item,key,callback){
            if(countryarr.indexOf(item.receiver_country)!=-1){
              eu.push(item);
            }else{
              noneu.push(item);
            }
            callback();
          }, function(err){
            if(err) console.log(err);
            resultfin.push(eu);
            resultfin.push(noneu);
            res.send(resultfin);
          })
        });*/
      }
    })
  });

  app.post('/api/getcustomerclsshipmentsuid', function(req,res){
    db.getCustomerClosedShipmentsUid(req.body.uid, function(err,result){
      if(err){
        console.log(err);
        res.send(503);
      }
      if(result){
        res.send(result);
      }
    });
  });

  app.post('/api/markasbilled', function(req,res){
    //console.log(req.body);
    //console.log(moment(req.body.year+'-'+req.body.month,'YYYY-MMM').format('YYYY-MM-DD 12:00:00'));
    //db.addMarkAsBilled()

    db.setGetUidMarkAsBilled(function(err,result1){
      if(err){
        console.log(err);
      }
      //generated UID
      console.log(result1);
      var datatoins = {
        uid: result1,
        main_customer_id: req.body.customer,
        datetarget: moment_en(req.body.year+'-'+req.body.month,'YYYY-MMM').format('YYYY-MM-DD 12:00:00'),
        nettotal: req.body.totalvk
      }
      console.log(datatoins);
      db.addMarkAsBilled(datatoins, function(err){
        if(err){
          console.log(err);
        }
        //IDE JÖN A TRACKINGSZÁMOK ALAPJÁN A KÜLDEMÉNYEK MEGJELÖLÉSE BILLEDKÉNT
        var markarr = [];
        async.each(req.body.data,function(item, callback){
          var which;
          item.numberofpackets == '' ? which=0 : which = 1;
          var markthis = {
            trackingnumber: item.trackingnumber,
            table: which,
            uid: result1
          }
          //console.log(item.trackingnumber + ' | ' + (item.numberofpackets==''));
          markarr.push(markthis);
          //console.log(markthis);
          callback();
        }, function(err){
          if(err){
            console.log(err);
          }else{
            //console.log('OKAY');
            //console.log(markarr);
            var counter = 0;
            async.each(markarr, function(item2,callback2){
              db.addToDataAndSurchargeBilled(item2, function(err,result2){
                if(err){
                  console.log(err);
                }
                //counter++;
                //console.log(result2);
                if(result2){
                  //console.log(result2 + counter);
                  callback2();
                }
              });
              //callback2();
            }, function(err){
              if(err){
                console.log(err);
              }
              //console.log(counter);
              res.send(200);
            });
          }
        });
      });
    });
    //res.send(200);
  });

  app.get('/api/getmainbilled', function(req,res){
    db.getMainBilled(function(err,result){
      if(err){
        console.log(err);
      }
      res.json(result);
    })
  });

  app.get('/api/getnextuid', function(req,res){
    db.setGetUidMarkAsBilled(function(err,result){
      if(err){
        console.log(err);
      }
      res.json(result);
    })
  });

  app.get('/api/getreference/:custid', function(req,res){
    db.getReference(req.params.custid, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.get('/api/getdetaileddataunid/:invno', function(req,res){
    db.getDetailInvoiceUnid(req.params.invno, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.get('/api/getdetaileddataunidsur/:invno', function(req,res){
    console.log(req.params.invno);
    db.getDetailInvoiceUnidSur(req.params.invno, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.get('/api/getdetaileddataiden/:invno', function(req,res){
    db.getDetailInvoiceIden(req.params.invno, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.get('/api/getdetaileddataidensur/:invno', function(req,res){
    db.getDetailInvoiceIdenSur(req.params.invno, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.get('/api/getsuppliersandservices', function(req,res){
    db.getSplAndService(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.post('/api/addnewprice', function(req,res){
    console.log(req.body.datatoadd);
    var tablename = "vk_"+req.body.datatoadd.customer+"_"+req.body.datatoadd.selectionbit;
    db.createPriceTable(tablename, req.body.datatoadd.zonenr, function(err,result){
      if(err){
        console.log(err);
        res.send(200);
      }
      if(result){
        console.log(result);
        res.send(200);
      }
    });
  });

  app.get('/api/getsuppliers', function(req,res){
    db.getSuppliers(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.get('/api/getvktables/:custid', function(req,res){
    db.getVkTablesName(req.params.custid, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        var queryarr = [];
        for(var i=0,len=result.length;i<len;++i){
          queryarr.push(result[i].TABLE_NAME);
        }
        res.json(queryarr);
      }
    });
  });

  app.post('/api/deleteprice', function(req,res){
    db.deletePrice(req.body.tblname, function(err,result){
      if(err){
        console.log(err);
        res.send(200);
      }
      if(result){
        res.send(200);
      }
    });
  });

  app.post('/api/exportprice', function(req,res){
    //console.log(req.body.data);
    //console.log(req.body.priceheader);
    var ID = function(){
      return '_'+Math.random().toString(36).substr(2,9);
    }
    var filedir = path.join(__dirname + '/public/download/export'+ID()+'.csv');
    var stream = fs.createWriteStream(filedir, {encoding: 'utf8'});
    stream.once('open', function(fd){
      var tempstr = "\uFEFF\uFEFF";
      tempstr += req.body.priceheader.join(';') + "\r\n";
      for(var i=0,len=req.body.data.length;i<len;++i){
        for(var key in req.body.data[i]){
          if(req.body.data[i].hasOwnProperty(key)){
            if(req.body.data[i][key]===null){
              tempstr += ";";
            }else{
              tempstr+= req.body.data[i][key]+";";
            }
          }
        }
        tempstr = tempstr.substring(0,tempstr.length-1);
        tempstr+="\r\n";
      }
      stream.write(tempstr, function(){
        stream.end();
      });
    });
    stream.once('close', function(){
      res.download(filedir);
    })
    //res.send(200);
  });

  app.post('/api/exportcsv', function(req,res){
    //console.log(req.body.data);
    var ID_ = function(){
      return '_'+Math.random().toString(36).substr(2,9);
    }
    var filedir = path.join(__dirname+'/public/download/billexport'+ID_()+'.csv');
    var stream = fs.createWriteStream(filedir, {encoding: 'utf8'});
    stream.once('open',function(fd){
      var tempstr = "\uFEFF\uFEFF";
      tempstr += "Sendungsnummer;Datum;Referenz1;Referenz2;Gewicht;Anzahl;Land;Versandart;Netto;Ust.\r\n";
      for(var i=0,len=req.body.data.length;i<len;++i){
        var netvk = 0;
        var netht = 0;
        if(req.body.data[i].netvk!==null){
          netvk = req.body.data[i].netvk;
        }else{
          netvk = 0;
        }

        if(req.body.data[i].netht!==null){
          netht = req.body.data[i].netht;
        }else{
          netht = 0;
        }

        //NETTO HT VAGY VK
        tempstr+= req.body.data[i].trackingnumber + "\t" + ";" + moment_de(new Date(req.body.data[i].labeldate)).format('L') + ";" + req.body.data[i].reference1 + ";" + req.body.data[i].reference2 + ";" + req.body.data[i].weight_billed + ";" + req.body.data[i].numberofpackets + ";" + req.body.data[i].receiver_country + ";" + req.body.data[i].tempservice + ";" + netvk+netht + ";" + req.body.data[i].main_vat_code + "\r\n";
      }
      stream.write(tempstr, function(){
        stream.end();
      });
    });
    stream.once('close',function(){
      res.download(filedir);
    });
  });

  app.post('/api/getzone', function(req,res){
    //console.log(req.body.custid);
    //console.log(req.body.vktables);
    //res.send(200);
    db.getZoneAndPrice(req.body.vktables, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    })
  });

  //OLD
  app.get('/api/getzoneandprice/:custid', function(req,res){
    db.getSpecificCustomerZone(req.params.custid, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        if(result.length===0){
          db.createPriceTables(req.params.custid, function(err,result2){
            if(err){
              console.log(err);
            }
            if(result){
              var temparr = ['vk_exp_'+req.params.custid,'vk_stdsingle_'+req.params.custid,'vk_stdmulti_'+req.params.custid];
              db.getZoneAndPrice(temparr, function(err,result4){
                if(err){
                  console.log(err);
                }
                if(result4){
                  var finalres2 = {
                    services: temparr,
                    zonetable: result4
                  }
                  res.json(finalres2);
                }
              });
            }
          });
        }else{
          var queryarr = [];
          for(var i=0,len=result.length;i<len;++i){
            queryarr.push(result[i].TABLE_NAME);
          }
          db.getZoneAndPrice(queryarr, function(err,result3){
            if(err){
              console.log(err);
            }
            if(result3){
              var finalres = {
                services: queryarr,
                zonetable: result3
              }
              res.json(finalres);
            }
          });
        }
      }
    })
  });

  app.get('/api/getsurcharge/:custid', function(req,res){
    db.getSurcharge(req.params.custid, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        //console.log(result);
        res.json(result);
      }
    });
  });

  app.get('/api/getfuelsurchargehistory', function(req,res){
    db.getFuelSurchargeHistory(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.post('/api/getfuel', function(req,res){
    db.getFuelSurcharge2(req.body.main_customer_id, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.post('/api/getmaut', function(req,res){
    db.getMautSurchargeCust(req.body.main_customer_id, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.post('/api/getprivatecust', function(req,res){
    db.getPrivateSurchargeCust(req.body.main_customer_id, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.post('/api/getcodcust', function(req,res){
    db.getCodSurchargeCust(req.body.main_customer_id, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.get('/api/getmautsurcharge', function(req,res){
    db.getMautSurchargeGlob(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.get('/api/getprivatesurchargesettings', function(req,res){
    db.getPrivateSurchargeSettings(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.get('/api/getcodsurchargesettings', function(req,res){
    db.getCodSurchargeSettings(function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        res.json(result);
      }
    });
  });

  app.get('/api/getotherinfo', function(req,res){
    async.parallel([
      function(callback){
        db.getSuppliers(function(err,result){
          if(err){
            callback(err);
          }
          if(result){
            callback(null,result);
          }
        });
      },
      function(callback){
        db.getServices(function(err2,result2){
          if(err2){
            callback(err2);
          }
          if(result2){
            callback(null,result2);
          }
        });
      }
      ],
      function(err3,result3){
        res.json(result3);
      });
  });

  app.post('/api/addfuelsurcharge', function(req,res){
    //console.log(req.body);
    //addFuelSurcharge
    db.addFuelSurcharge(req.body,function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
    //res.send(200);
  });

  app.post('/api/addmautsurcharge', function(req,res){
    db.addMautSurchargeGlob(req.body,function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/addprivatesurchargesettings', function(req,res){
    db.addPrivateSurchargeSettings(req.body, function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/addcodsurchargesettings', function(req,res){
    db.addCodSurchargeGlob(req.body,function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/addservicesupplier', function(req,res){
    //console.log(req.body);
    var servtblcolname;
    if(req.body.zsuppl == 0){
      servtblcolname= "vk_"+zservarr[req.body.zserv]+"_"+req.body.cust;
    }else{
      servtblcolname= "vk_"+zservarr[req.body.zserv]+"_"+req.body.cust+"_"+req.body.zsuppl;
    }

    console.log(servtblcolname);

    db.addServiceSupplier(servtblcolname, function(err,result){
      if(err){
        //callback(err);
        res.send(err);
      }
      if(result){
        res.send(200);
      }
    });

    //res.send(200);
  });

  app.post('/api/savefuel', function(req,res){
    console.log(req.body);
    db.saveGlobalFuel(req.body,function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/addmautsurchargecust', function(req,res){
    db.addMautSurchargeCust(req.body,function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/addprivatesurchargecust', function(req,res){
    db.addPrivateSurchargeCust(req.body, function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/addcodsurchargecust', function(req,res){
    db.addCodSurchargeCust(req.body,function(err,result){
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.post('/api/getstatistics', function(req,res){
    console.log(req.body);
    async.parallel([
      function(callback){
        db.getStatistics1(req.body, function(err,result){
          if(err) callback(err);
          callback(null, result);
        });
      },
      function(callback){
        db.getStatistics2(req.body, function(err,result){
          if(err) callback(err);
          callback(null, result);
        });
      },
      function(callback){
        db.getStatistics3(req.body, function(err,result){
          if(err) callback(err);
          callback(null, result);
        });
      },
      function(callback){
        db.getStatistics4(req.body,1, function(err,result){
          if(err) callback(err);

          var resulttosend = [];
          var glsdearr = [];
          var glsatarr = [];
          var dhlarr = [];
          var upsatarr = [];
          var upsdearr = [];
          var upshuarr = [];
          var postarr = [];
          async.each(result, function(item,callback){
            //GLSDE
            var temp1 = {
              x: item['labeldate'],
              y: item['GLSDE']
            }
            glsdearr.push(temp1);

            //GLSAT
            var temp2 = {
              x: item['labeldate'],
              y: item['GLSAT']
            }
            glsatarr.push(temp2);

            //DHL
            var temp3 = {
              x: item['labeldate'],
              y: item['DHL']
            }
            dhlarr.push(temp3);

            //UPSAT
            var temp4 = {
              x: item['labeldate'],
              y: item['UPSAT']
            }
            upsatarr.push(temp4);

            //UPSDE
            var temp5 = {
              x: item['labeldate'],
              y: item['UPSDE']
            }
            upsdearr.push(temp5);

            //UPSHU
            var temp6 = {
              x: item['labeldate'],
              y: item['UPSHU']
            }
            upshuarr.push(temp6);

            //POST
            var temp7 = {
              x: item['labeldate'],
              y: item['POST']
            }
            postarr.push(temp7);
            callback();
          },function(err){
            if(err){
              callback(err);
            }else{
              var finalskeletonglsde = {
                key: 'GLSDE',
                values: JSON.parse(JSON.stringify(glsdearr)),
                color: '#06187C'
              };
              var finalskeletonglsat = {
                key: 'GLSAT',
                values: JSON.parse(JSON.stringify(glsatarr)),
                color: '#828BB6'
              };
              var finalskeletondhl = {
                key: 'DHL',
                values: JSON.parse(JSON.stringify(dhlarr)),
                color: '#CC0000'
              };
              var finalskeletonupsat = {
                key: 'UPSAT',
                values: JSON.parse(JSON.stringify(upsatarr)),
                color: '#FFB500'
              };
              var finalskeletonupsde = {
                key: 'UPSDE',
                values: JSON.parse(JSON.stringify(upsdearr)),
                color: '#351C15'
              };
              var finalskeletonupshu = {
                key: 'UPSHU',
                values: JSON.parse(JSON.stringify(upshuarr)),
                color: '#008198'
              };
              var finalskeletonpost = {
                key: 'POST',
                values: JSON.parse(JSON.stringify(postarr)),
                color: '#F7E415'
              };

              resulttosend.push(finalskeletonglsde);
              resulttosend.push(finalskeletonglsat);
              resulttosend.push(finalskeletondhl);
              resulttosend.push(finalskeletonupsat);
              resulttosend.push(finalskeletonupsde);
              resulttosend.push(finalskeletonupshu);
              resulttosend.push(finalskeletonpost);

              //console.log(resulttosend);
              //res.send(resulttosend);
              callback(null,resulttosend);
            }
          });
        });
      },
      function(callback){
        db.getStatistics4(req.body,2, function(err,result){
          if(err) callback(err);

          var resulttosend = [];
          var glsdearr = [];
          var glsatarr = [];
          var dhlarr = [];
          var upsatarr = [];
          var upsdearr = [];
          var upshuarr = [];
          var postarr = [];
          async.each(result, function(item,callback){
            //GLSDE
            var temp1 = {
              x: item['labeldate'],
              y: item['GLSDE']
            }
            glsdearr.push(temp1);

            //GLSAT
            var temp2 = {
              x: item['labeldate'],
              y: item['GLSAT']
            }
            glsatarr.push(temp2);

            //DHL
            var temp3 = {
              x: item['labeldate'],
              y: item['DHL']
            }
            dhlarr.push(temp3);

            //UPSAT
            var temp4 = {
              x: item['labeldate'],
              y: item['UPSAT']
            }
            upsatarr.push(temp4);

            //UPSDE
            var temp5 = {
              x: item['labeldate'],
              y: item['UPSDE']
            }
            upsdearr.push(temp5);

            //UPSHU
            var temp6 = {
              x: item['labeldate'],
              y: item['UPSHU']
            }
            upshuarr.push(temp6);

            //POST
            var temp7 = {
              x: item['labeldate'],
              y: item['POST']
            }
            postarr.push(temp7);
            callback();
          },function(err){
            if(err){
              callback(err);
            }else{
              var finalskeletonglsde = {
                key: 'GLSDE',
                values: JSON.parse(JSON.stringify(glsdearr)),
                color: '#06187C'
              };
              var finalskeletonglsat = {
                key: 'GLSAT',
                values: JSON.parse(JSON.stringify(glsatarr)),
                color: '#828BB6'
              };
              var finalskeletondhl = {
                key: 'DHL',
                values: JSON.parse(JSON.stringify(dhlarr)),
                color: '#CC0000'
              };
              var finalskeletonupsat = {
                key: 'UPSAT',
                values: JSON.parse(JSON.stringify(upsatarr)),
                color: '#FFB500'
              };
              var finalskeletonupsde = {
                key: 'UPSDE',
                values: JSON.parse(JSON.stringify(upsdearr)),
                color: '#351C15'
              };
              var finalskeletonupshu = {
                key: 'UPSHU',
                values: JSON.parse(JSON.stringify(upshuarr)),
                color: '#008198'
              };
              var finalskeletonpost = {
                key: 'POST',
                values: JSON.parse(JSON.stringify(postarr)),
                color: '#F7E415'
              };

              resulttosend.push(finalskeletonglsde);
              resulttosend.push(finalskeletonglsat);
              resulttosend.push(finalskeletondhl);
              resulttosend.push(finalskeletonupsat);
              resulttosend.push(finalskeletonupsde);
              resulttosend.push(finalskeletonupshu);
              resulttosend.push(finalskeletonpost);

              //console.log(resulttosend);
              //res.send(resulttosend);
              callback(null,resulttosend);
            }
          });
        });
      },
      function(callback){
        db.getStatistics5(req.body, function(err,result){
          if (err) callback(err);
          //console.log(result);
          if(typeof(result[0])=='undefined'){
            //console.log('undefined');
            result[0] = {};
            result[0].eu_mem = 'Non-EU 0';
            result[0].y = '0';
            result[1] = {};
            result[1].eu_mem = 'EU 0';
            result[1].y = '0';
            callback(null,result);
          }else{
            if(result[0].eu_mem===0){
              result[0].eu_mem = 'Non-EU ' + result[0].y;
              if(typeof(result[1])=='undefined'){
                result[1] = {};
                result[1].eu_mem = 'EU 0';
                result[1].y = 0;
              }else{
                result[1].eu_mem = 'EU '+ result[1].y;
              }
            }else{
              result[0].eu_mem = 'EU ' + result[0].y;
              if(typeof(result[1])=='undefined'){
                result[1] = {};
                result[1].eu_mem = 'Non-EU 0';
                result[1].y = 0;
              }else{
                result[1].eu_mem = 'Non-EU ' + result[1].y;
              }
            }
            callback(null,result);
          }
        });
      },
      function(callback){
        db.getStatistics6(req.body, function(err,result){
          if(err) callback(err);
          callback(null, result);
        });
      },
      function(callback){
        db.getStatistics7(req.body, function(err,result){
          if(err) callback(err);
          callback(null, result);
        });
      }
    ], function(err,results){
      if(err) console.log(err);
      //console.log(results[3]);
      var response = {
        shipmentEK: parseFloat(results[0][0].shipmentEK).toFixed(2),
        shipmentVK: parseFloat(results[0][0].shipmentVK).toFixed(2),
        shipmentNR: parseInt(results[0][0].shipmentNR),
        shipmentMARGE: (parseFloat(results[0][0].shipmentVK)-parseFloat(results[0][0].shipmentEK)).toFixed(2),
        multiNR: parseInt(results[1][0].multiNR),
        multipackNR: parseInt(results[1][0].multipackNR),
        singleNR: parseInt(results[0][0].shipmentNR)-parseInt(results[1][0].multiNR),
        packageNR: (parseInt(results[0][0].shipmentNR)-parseInt(results[1][0].multiNR))+parseInt(results[1][0].multipackNR),
        surchargeEK: parseFloat(results[2][0].surchargeEK).toFixed(2),
        surchargeVK: parseFloat(results[2][0].surchargeVK).toFixed(2),
        surchargeMARGE: (parseFloat(results[2][0].surchargeVK)-parseFloat(results[2][0].surchargeEK)).toFixed(2),
        totalEK: (parseFloat(results[2][0].surchargeEK)+parseFloat(results[0][0].shipmentEK)).toFixed(2),
        totalVK: (parseFloat(results[2][0].surchargeVK)+parseFloat(results[0][0].shipmentVK)).toFixed(2),
        totalMARGE: ((parseFloat(results[2][0].surchargeVK)+parseFloat(results[0][0].shipmentVK))-(parseFloat(results[2][0].surchargeEK)+parseFloat(results[0][0].shipmentEK))).toFixed(2),
        packagesVolChart: results[3],
        packagesWeightChart: results[4],
        eunoneuDonut: results[5],
        euDonut: results[6],
        noneuDonut: results[7]
      }
      res.send(response);
    });
  });

  app.get('/api/getchartdonut', function(req,res){
    db.getEuNonEuDonut(function(err,result){
      if (err) console.log(err);
      if(result[0].eu_mem===0){
        result[0].eu_mem = 'Non-EU ' + result[0].y;
        result[1].eu_mem = 'EU '+ result[1].y;
      }else{
        result[0].eu_mem = 'EU ' + result[0].y;
        result[1].eu_mem = 'Non-EU ' + result[1].y;
      }
      res.json(result);
    });
  });

  app.get('/api/getdonutcharteucountry', function(req,res){
    db.getEuCountryDonut(function(err,result){
      if(err) console.log(err);
      res.json(result);
    });
  });

  app.get('/api/getdonutchartnoneucountry', function(req,res){
    db.getNonEuCountryDonut(function(err,result){
      if(err) console.log(err);
      res.json(result);
    });
  });

  app.get('/api/getdonutcharteusupplier', function(req,res){
    db.getEuSupplierDonut(function(err,result){
      if(err) console.log(err);
      res.json(result);
    });
  });

  app.get('/api/getdonutchartnoneusupplier', function(req,res){
    db.getNonEuSupplierDonut(function(err,result){
      if(err) console.log(err);
      res.json(result);
    });
  });

  app.get('/api/getchartmain/:which', function(req,res){
    db.getChartMain(req.params.which, function(err,result){
      if(err) console.log(err);

      var resulttosend = [];
      var glsdearr = [];
      var glsatarr = [];
      var dhlarr = [];
      var upsatarr = [];
      var upsdearr = [];
      var upshuarr = [];
      var postarr = [];
      async.each(result, function(item,callback){
        //GLSDE
        var temp1 = {
          x: item['labeldate'],
          y: item['GLSDE']
        }
        glsdearr.push(temp1);

        //GLSAT
        var temp2 = {
          x: item['labeldate'],
          y: item['GLSAT']
        }
        glsatarr.push(temp2);

        //DHL
        var temp3 = {
          x: item['labeldate'],
          y: item['DHL']
        }
        dhlarr.push(temp3);

        //UPSAT
        var temp4 = {
          x: item['labeldate'],
          y: item['UPSAT']
        }
        upsatarr.push(temp4);

        //UPSDE
        var temp5 = {
          x: item['labeldate'],
          y: item['UPSDE']
        }
        upsdearr.push(temp5);

        //UPSHU
        var temp6 = {
          x: item['labeldate'],
          y: item['UPSHU']
        }
        upshuarr.push(temp6);

        //POST
        var temp7 = {
          x: item['labeldate'],
          y: item['POST']
        }
        postarr.push(temp7);
        callback();
      },function(err){
        if(err){
          console.log(err);
        }else{
          var finalskeletonglsde = {
            key: 'GLSDE',
            values: JSON.parse(JSON.stringify(glsdearr)),
            color: '#06187C'
          };
          var finalskeletonglsat = {
            key: 'GLSAT',
            values: JSON.parse(JSON.stringify(glsatarr)),
            color: '#828BB6'
          };
          var finalskeletondhl = {
            key: 'DHL',
            values: JSON.parse(JSON.stringify(dhlarr)),
            color: '#CC0000'
          };
          var finalskeletonupsat = {
            key: 'UPSAT',
            values: JSON.parse(JSON.stringify(upsatarr)),
            color: '#FFB500'
          };
          var finalskeletonupsde = {
            key: 'UPSDE',
            values: JSON.parse(JSON.stringify(upsdearr)),
            color: '#351C15'
          };
          var finalskeletonupshu = {
            key: 'UPSHU',
            values: JSON.parse(JSON.stringify(upshuarr)),
            color: '#008198'
          };
          var finalskeletonpost = {
            key: 'POST',
            values: JSON.parse(JSON.stringify(postarr)),
            color: '#F7E415'
          };

          resulttosend.push(finalskeletonglsde);
          resulttosend.push(finalskeletonglsat);
          resulttosend.push(finalskeletondhl);
          resulttosend.push(finalskeletonupsat);
          resulttosend.push(finalskeletonupsde);
          resulttosend.push(finalskeletonupshu);
          resulttosend.push(finalskeletonpost);

          //console.log(resulttosend);
          res.send(resulttosend);
        }
      });
    });
  });

  //OLD
  app.post('/api/removeservicesupplier', function(req,res){
    //console.log(req.body.removethis);
    db.removeServiceSupplier(req.body.removethis, function(err,result){
      if(err){
        res.send(err);
      }
      if(result){
        res.send(200);
      }
    });
  });

  app.post('/api/surchargesave', function(req,res){
    //console.log(req.body);
    //MAJD ASYNC KELL IDE
    var i = req.body.surchargedata.length;
    while(i--){
      delete req.body.surchargedata[i].sxs_surcharge;
      delete req.body.surchargedata[i].spl_surcharge;
      if(req.body.surchargedata[i].hasOwnProperty('main_customer_id')){
        if(req.body.surchargedata[i].main_customer_id === null || req.body.surchargedata[i].main_customer_id === 'null'){
          req.body.surchargedata[i].main_customer_id = Number(req.body.customerid);
        }
      }
      if(req.body.surchargedata[i].hasOwnProperty('price')){
        if(req.body.surchargedata[i].price === null || req.body.surchargedata[i].price === 'null'){
          req.body.surchargedata.splice(i,1);
        }
      }
    }

    console.log(req.body.surchargedata);

    db.setSurcharge(req.body.surchargedata, function(err,result){
      if(err){
        console.log(err);
      }
    });
    res.send(200);
  });

  app.post('/api/upload', function(req,res){
    //console.log(req.body);
    //console.log(req.files);
    flow.post(req, function(status, filename, original_filename, identifier, currentTestChunk, numberOfChunks){
      //console.log('POST: ', status, filename, identifier);
      if(status === 'done' && currentTestChunk>numberOfChunks){
        var stream = fs.createWriteStream('./public/upload/' + filename, {encoding:'utf-8'});
        flow.write(identifier, stream, {onDone: flow.clean}, function(err){
          if(err){
            console.log('err' + err);
          }else{
            console.log(req.body);
            switch(req.body.type){
              case "0":
                res.send(200);
                blogic.processFileLogic(req.body.supplierid, req.body.dateofinv, filename);
                break;
              case "1":
                //console.log('zonelogic');
                zplogic.processFileLogic(filename, function(test){
                  //console.log(test);
                  res.send(test);
                });
                //res.send("tattarata");
                break;
              case "2":
                zplogic.processPriceImport(filename, function(retdata){
                  res.send(retdata);
                })
              default:
                break;
              }
          }
        });
      }else{
        console.log(status);
      }
    });
    /*var stream = fs.createWriteStream(req.query.flowFilename);
    flow.write(req.query.flowIdentifier, stream, {onDone: flow.clean});
    res.send(200);*/
  });

    app.get('/api/getmanuallyccformdata', function(req,res){
    var finalresult = {};

    async.parallel([
        function(callback){
          db.getManuallyccCountryList(function(err,result){
            if (err) return callback(err);
            finalresult.country = result;
            callback();
          });
        },
        function(callback){
          db.getManuallyccCustomerList(function(err,result2){
            if (err) return callback(err);
            finalresult.customers = result2;
            callback();
          });
        },
        function(callback){
          db.getManuallyccForwarder(function(err,result3){
            if (err) return callback(err);
            finalresult.forwarders = result3;
            callback();
          });
        },
        function(callback){
          db.getManuallyccServices(function(err,result4){
            if (err) return callback(err);
            finalresult.services = result4;
            callback();
          });
        },
    ],function(err){
      if(err)
        console.log(err);
      //console.log('DONE');
      res.json(finalresult);
    });
  });


    // NEGATÍV PROFIT NÉLKÜL
    app.post('/api/positivprofit', function (req, res) {
        /*console.log(req.body.szazalek);
        console.log(req.body.netamount);
        console.log(req.body.fromdatum);
        console.log(req.body.todatum);
        console.log(req.body.szazalekrelacio);
        console.log(req.body.netamountrelacio);*/
        if (req.body.szazalekrelacio == '>' || req.body.szazalekrelacio == '>=') {
            db.getPositivProfit1(req.body.szazalek, req.body.netamount, req.body.fromdatum, req.body.todatum, req.body.szazalekrelacio, req.body.netamountrelacio, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    //console.log(result);
                    res.json({
                        result: result
                    });
                }
            })
        } else {
            db.getPositivProfit2(req.body.szazalek, req.body.netamount, req.body.fromdatum, req.body.todatum, req.body.szazalekrelacio, req.body.netamountrelacio, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    //console.log(result);
                    res.json({
                        result: result
                    });
                }
            })
        }
    });


    //NEGATÍV PROFITTAL EGYÜTT
    app.post('/api/postprofit', function (req, res) {
        /*console.log(req.body.szazalek);
        console.log(req.body.netamount);
        console.log(req.body.fromdatum);
        console.log(req.body.todatum);
        console.log(req.body.szazalekrelacio);
        console.log(req.body.netamountrelacio);*/
        if (req.body.szazalekrelacio == '>' || req.body.szazalekrelacio == '>=') {
            db.getProfit1(req.body.szazalek, req.body.netamount, req.body.fromdatum, req.body.todatum, req.body.szazalekrelacio, req.body.netamountrelacio, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    //console.log(result);
                    res.json({
                        result: result
                    });
                }
            })
        } else {
            db.getProfit2(req.body.szazalek, req.body.netamount, req.body.fromdatum, req.body.todatum, req.body.szazalekrelacio, req.body.netamountrelacio, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    //console.log(result);
                    res.json({
                        result: result
                    });
                }
            })
        }
    });

  app.post('/api/unsetselected', function(req,res){
    db.setUnsetSelected(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      db.setUnsetSelectedSur(req.body.track, function(err,result){
        if(err){
          console.log(err);
        }
        res.send(200);
      });
      //res.send(200);
    });
  });

  app.post('/api/unsetselectedsur', function(req,res){
    db.setUnsetSelectedSur(req.body.track, function(err,result){
      if(err){
        console.log(err);
      }
    });
    res.send(200);
  });

  app.post('/api/deleteinvoice', function(req,res){
    db.deleteInvoice(req.body.data, function(err,result){
      if(err){
        console.log(err);
      }
      res.send(200);
    });
  });

  app.post('/api/zoneexport', function(req,res){
    //req.body.data
    //req.body.services
    var ID=function(){
      return '_'+Math.random().toString(36).substr(2,9);
    }
    var filedir = path.join(__dirname + '/public/download/export'+ID()+'.csv');
    var stream = fs.createWriteStream(filedir, {encoding:'utf8'});
    stream.once('open', function(fd){
      var tempstr = "\uFEFF\uFEFF";
      tempstr += "COUNTRY;" + req.body.services.join(';') + "\r\n";
      for(var j=0,len2=req.body.data.length;j<len2;++j){
        tempstr+= req.body.data[j].alpha2+"_"+req.body.data[j].german_formal+";";
        for(var i=0,len=req.body.services.length;i<len;++i){
          if(req.body.data[j][req.body.services[i]]===null){
            tempstr+=";";
          }else{
            tempstr+=req.body.data[j][req.body.services[i]]+";";
          }
        }
        tempstr = tempstr.substring(0,tempstr.length-1);
        tempstr+="\r\n";
      }
      stream.write(tempstr, function(){
        stream.end();
      })
    });
    stream.once('close', function(){
      res.download(filedir);
    });
  });

  app.post('/api/zonesave', function(req,res){
    //console.log(req.body);
    db.setZone(req.body.zones,req.body.services,function(err,result){
      if(err){
        console.log(err);
      }
      res.send(200);
    })
  });

  app.post('/api/getprice', function(req,res){
    db.getPrice(req.body.ident, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        //console.log('van result: ' + result.length);
        async.eachSeries(result, function iterator(item,callback){
          if(item.length===0){
            //console.log('van item:' + item);
            getZoneNumbers(req.body.ident[result.indexOf(item)], function(error,finalres3){
              if(error){
                console.log(err);
                return;
              }
              if(finalres3){
                //console.log(finalres3);
                var tempnull = {};
                tempnull["weight"] = null;
                for(var h=0,lenh=finalres3;h<lenh;++h){
                  tempnull["z"+(h+1)] = null;
                }
                item.push(tempnull);
                //console.log(item);
                callback(null,item);
              }
            })
          }else{
            //console.log('nincs item');
            callback(null,item);
          }
        },function done(){
          /*console.log('nicns async eachseries');
          console.log('result length:' + result.length);
          console.log(result);*/
          res.json(result);
        });
      }
    })
  });

  //EXPIRATION
  app.post('/api/setexpiration', function(req,res){
    console.log(req.body.table_name);
    console.log(req.body.dateexpiration);
    var jsondata = {
      table_name: req.body.table_name,
      dateexpiration: req.body.dateexpiration
    };
    //console.log(jsondata);
    //res.send(200);
    db.addPriceExpiration(jsondata, function(err,result){
      if(err){
        console.log(err);
      }
      //console.log(result);
      res.send(200);
    });
  });

  app.post('/api/getexpiration', function(req,res){
    db.getPriceExpiration(req.body.ident, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        //console.log(result);
        res.send(result[0]);
      }else{
        res.send(503);
      }
    });
  });

  app.post('/api/getthingstodo', function(req,res){
    //console.log(req.body.customer);
    //res.send();
    db.getThingsNeedsToBeDone(req.body.customer, function(err,result){
      if(err){
        console.log(err);
      }
      if(result){
        //console.log(result);
        res.send(result);
      }else{
        res.send(503);
      }
    });
  });

  app.post('/api/getexpirydate', function(req,res){
    var currdate;
    var expdate;
    var expiredarr = [];
    var servicesarr = [];
    servicesarr[0] = 'MULTI';
    //waterfall
    async.waterfall([
        function getServiceList(getServiceListCallback){
          db.getServices(function(err,services){
            if(err){
              getServiceListCallback(err);
            }else{
              getServiceListCallback(null, services);
              /*async.forEach(services, function(item,foreachcallback){
                servicesarr.push(item.main_supplier_alpha3 + " " + item.service);
                foreachcallback();
              }, function(err2){
                if(err2){
                  console.log(err2);
                }
                getServiceListCallback();
              });*/
            }
          });
        },
        function getExpiryDates(services, getExpiryDatesCallback){
          db.getExpirydate(req.body.custid, function(err3, expiries){
            if(err3){
              getExpiryDatesCallback(err3);
            }else{
              async.forEach(expiries, function(item2,foreachcallback2){
                item2.epoch_time = item2.epoch_time*1000
                currdate = new Date();
                //expdate = new Date(item2.epoch_time*1000);
                expdate = new Date(item2.epoch_time);
                currdate.setMonth(currdate.getMonth()+2);
                if(+expdate.getTime() <= +currdate.getTime()){
                  expiredarr.push(item2);
                }
                foreachcallback2();
              }, function(err4){
                if(err4){
                  console.log(err4);
                }
                getExpiryDatesCallback(null, services);
              });
            }
          });
        }
      ], function (error, services){
        if(error){
          console.log('valami nem ok');
          res.send(503);
        }else{
          //console.log(services);
          //console.log(expiredarr);
          //console.log('minden ok');
          res.json({
            services: services,
            expiredarr: expiredarr
          });
        }
    });
  });

  function BitwiseAndLarge(val1, val2) {
    var shift = 0, result = 0;
    var mask = ~((~0) << 30); // Gives us a bit mask like 01111..1 (30 ones)
    var divisor = 1 << 30; // To work with the bit mask, we need to clear bits at a time
    while( (val1 != 0) && (val2 != 0) ) {
        var rs = (mask & val1) & (mask & val2);
        val1 = Math.floor(val1 / divisor); // val1 >>> 30
        val2 = Math.floor(val2 / divisor); // val2 >>> 30
        for(var i = shift++; i--;) {
            rs *= divisor; // rs << 30
        }
        result += rs;
    }
    return result;
  }

  //EXPIRATION

  app.post('/api/setprice', function(req,res){
    var datatoset = req.body.datatoset
    var tblname = req.body.tblname
    var headersonly = req.body.headersonly;
    headersonly.shift();
    //console.log(headersonly);
    /*getZoneNumbers(tblname, function(err,result){
      console.log(result);
    });
    getZoneNumbersOffline(headersonly, function(err2,result2){
      console.log(result2);
    });*/
    async.parallel({
      model: function(callback){
        getZoneNumbersOffline(headersonly, function(err2,resmodel){
          callback(null,resmodel);
        });
      },
      datab: function(callback){
        getZoneNumbers(tblname, function(err,resdatab){
          callback(null,resdatab);
        });
      }
    },function(err,result){
        //console.log(result);
        //console.log(result.model);
        //console.log(result.datab);
        var model = Number(result.model);
        var datab = Number(result.datab);
        if(model===datab){
          //tökéletes insert
          console.log('insert');
          db.setPriceZone(tblname,datatoset,function(err,result){
            if(err){
              console.log(err);
            }
            res.send(200);
          });
        }else{
          if(model>datab){
            //modellben több dbhez új oszlop(ok)
            var mennyi = model-datab;
            var newzonenrarr = [];
            for(var i=datab,len=model;i<len;++i){
              newzonenrarr.push(Number(i+1));
            }
            async.eachSeries(newzonenrarr, function iterator(item,callback){
              //console.log(item);
              db.addPriceZone(tblname,item,function(err,result){
                if(result){
                  callback(null,item);
                }
              })
            },function done(){
              db.setPriceZone(tblname,datatoset,function(err,result){
                if(err){
                  console.log(err);
                }
                res.send(200);
              });
              //res.send(200);
            });
            //console.log(newzonenrarr);

            //console.log('addcolumns', mennyi);
          }else{
            //datab-ben több van databből drop oszlop(ok)
            var mennyi = datab-model;
            var remozonearr = [];
            for(var j=datab,len=model;j>len;--j){
              remozonearr.push(Number(j));
            }
            async.eachSeries(remozonearr, function iterator(item,callback){
              db.removePriceZone(tblname,item,function(err,result){
                if(result){
                  callback(null,item);
                }
              })
            },function done(){
              res.send(200);
            })
            //console.log(remozonearr);
            //res.send(200);
            console.log('removecolumns');
          }
        }
      });

    //res.send(200);
  })

function getZoneNumbersOffline(sourcedata, callback){
  var max = 0;
  //console.log(sourcedata);
  for(var i=0,len=sourcedata.length;i<len;++i){
    var thenum = sourcedata[i].replace(/^\D+/g,'');
    if(Number(thenum)>Number(max)) max=thenum;
  }
      //console.log(p);
  callback(false,max);
}

function getZoneNumbers(tblname, callback){
    db.getZoneNumbers(tblname, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      if(result){
        var max = 0;
        for(var g=0,len=result.length;g<len;++g){
          var thenum = result[g].column_name.replace(/^\D+/g,'');
          if(Number(thenum)>Number(max)) max=thenum;
        }
        callback(false,max);
      }
    });
}

  app.post('/api/addpricezone', function(req,res){
    var zonearray = [];
    getZoneNumbers(req.body.tblname, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      if(result){
        db.addPriceZone(req.body.tblname,++result,function(err,result){
          if(err){
            console.log(err);
            return;
          }
          if(result){
            res.send(200);
          }
        })
      }
    });
  });

  app.get('/api/gettodolist', function(req,res){
    db.getTodoList(function(err,result){
      if(err){
        console.log(err);
        return;
      }
      if(result){
        res.json(result);
      }
    })
  });

  app.post('/api/addtodolist', function(req,res){
    var thistosend = {
      description: req.body.datatoadd
    }
    db.addTodoList(thistosend, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      if(result){
        res.send(200);
      }
    })
  });

  app.post('/api/setclosedtodo', function(req,res){
    db.setClosedTodo(req.body.idoftodo, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      if(result){
        res.send(200);
      }
    })
  });

  app.get('/pdfbill/:uid', function(req,res){
    console.log(req.params.uid);
    res.render('templates/pdfbill');
  });

  app.get('/api/download/:fname', function(req,res){
    console.log(req.params.fname);
    res.download(path.join(__dirname + '/public/download/'+'fname'));
  });

  app.post('/api/test', function(req,res){
    blogic.processFileLogic('1','GLS DE_.csv');
    res.send(200);
  });

  app.get('/partials/:name', function(req,res){
    var name = req.params.name;
    res.render('partials/' + name);
  });

  //ALLGET
  app.get('*',function(req,res){
    res.render('index');
  });
}
