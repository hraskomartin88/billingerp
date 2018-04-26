var db = require('./mysql');
var async = require('async');
var fs = require('fs');

var maininvoiceid = 0;
exports.startPriceCalc = function(invid,callback){
  //console.log(invid);
  maininvoiceid = invid;
  async.waterfall([
    function(callback){
      db.copyCountryToSurchargeWhereNincs(invid, function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        callback(null);
      });
    },
    function(callback){
      db.getVkHtTablesList(function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        callback(null,invid,result);
      });
    },
    function(arg1,arg2,callback){
      db.getSelectedInvoiceData(arg1, function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        callback(null,arg2,result);
      });
    },
    function(arg1,arg2,callback){
      db.getServices(function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        callback(null,arg1,arg2,result);
      })
    },
    function(vkhttbls, shipments, servicelist, callback){
      //console.log(vkhttbls);
      //console.log(shipments);
      //console.log(servicelist);
      //console.log(shipments);
      async.eachSeries(shipments, function iterator(item,callback){
        //console.log(item);
        async.each(servicelist, function(service,callback){
          if(service.service==item.tempservice && service.main_supplier_alpha3==item.alpha3){
            item.tempserviceid = service.id;
            item.express = service.express;
            db.setMainServiceId(item.tempserviceid,item.id, function(err,notintres){
              if(err) console.log(err);
            });
            //console.log(item);
            /*counttest++;
            console.log(counttest);*/
          }
          //
          callback();
        },function done(){
          callback(null);
        });
      },function done2(){
        //console.log("iteration finished");
        //console.log(shipments);
        //console.log(vkhttbls);
        /*db.getSelectedInvoiceSurcharge(invid,function(err,surresult){
          if(err){
            callback(new Error(err));
            return;
          }
          //console.log(surresult);
          callback(null,shipments,vkhttbls,surresult);
        });*/
        callback(null,shipments,vkhttbls);
      });
    }
    ],function(err,finship,finvkht){
      if(err) console.log(err);
      findPriceorHt(finship,finvkht,function(err){
        if(err) console.log(err);
        findVATCode(maininvoiceid,function(err){
          if(err) console.log(err);
          callback();
        });
      });
    });
}

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

function findPriceorHt(datatocheck, vkhttbls,callback){
  //SHIPMENTEK LOOP
  //console.log(surcharges);
  async.each(datatocheck, function(item,callback){
    var relevanttblservice = [];
    //console.log(item.tempserviceid);
    //VKHKTABLELOOP
    async.forEachOf(vkhttbls,function(value,key,callback2){
      var splitted = value.TABLE_NAME.split('_');
      //if(splitted[2]&Math.pow(2,item.tempserviceid)){
        //BitwiseAndLarge(splitted[2],Math.pow(2,item.tempserviceid))
      if(BitwiseAndLarge(splitted[2],Math.pow(2,item.tempserviceid))){
        if(splitted[0].indexOf('vk')!=-1){
          if(splitted[1]==item.main_customer_id){
            relevanttblservice.push(value.TABLE_NAME);
          }
        }else{
          relevanttblservice.push(value.TABLE_NAME);
        }
      }
      //if(va)
      callback2();
    },function(err){
      item.relevant = relevanttblservice;
      //console.log(item.relevant);
      callback(null);
    })
    //console.log(item);

  },function(err){
    if (err) console.log('findpriceorht:' + err);
    //console.log(datatocheck[3]);
    //DATATOCHECKBEN MINDEN AMI ARHOZ KELL
    var arrayIdPrice = [];
    //var arrayIdSurcharge = [];
    async.forEachOf(datatocheck, function(value,key,callback){
        /*for(var g=0,leng=surcharges.length;g<leng;++g){
          if(datatocheck[key].trackingnumber == surcharges[g].main_trackingnumber){
            //console.log(datatocheck[key].trackingnumber+ ' - ' +surcharges[g].main_surcharge_id);
            var surtemp = {
              main_data_id: datatocheck[key].id,
              main_surcharge_id: surcharges[g].main_surcharge_id,
              pricevk: 0,
              priceht: 0
            };
            arrayIdSurcharge.push(surtemp);
          }
        }*/
        if(datatocheck[key].relevant.length!=0){
          //fs.appendFile('output_logger.txt', JSON.stringify(datatocheck[key]) + '\r\n',function(err){});
          //console.log();
          //ASYNCRA
          /*for(var i=datatocheck[key].relevant.length-1,len=0;i>=len;--i){
            console.log(datatocheck[key].relevant[i]);
          }
          console.log('____________');*/
          //HA VAN VK AR AKKOR KISZEDI A HT ARAKAT
          if(datatocheck[key].relevant.filter(filterHtVk).length>0){
            for(var i=datatocheck[key].relevant.length-1,len=0;i>=len;--i){
              if(datatocheck[key].relevant[i].split('_')[0]==='ht'){
                datatocheck[key].relevant.splice(i,1);
              }
            }
          }

          //KÜLÖNSZEDI A HT ÁRAKAT PL GLS AT_DE SZERVIZNÉV UGYANAZ ÁR KÜLÖNBÖZŐ
          //PL HT_1_2 ÉS HT_2_2 KOZUL KIVALASZTJA A JOT
          if(datatocheck[key].relevant.filter(filterVkHt).length>1){
            for(var i=datatocheck[key].relevant.length-1,len=0;i>=len;--i){
              if(datatocheck[key].relevant[i].split('_')[1]!=datatocheck[key].alpha3_id){
                datatocheck[key].relevant.splice(i,1);
              }
            }
          }

          //DHL MULTI TABLA KERESESE HA DHL MULTI
          if(datatocheck[key].alpha3.indexOf('DHL')>-1 && datatocheck[key].numberofpackets > 1){
            for(var g=datatocheck[key].relevant.length-1,len=0;g>=len;--g){
              //if(!(datatocheck[key].relevant[g].split('_')[2]&Math.pow(2,0))){
                //BitwiseAndLarge(datatocheck[key].relevant[g].split('_')[2],Math.pow(2,0))
              if(!BitwiseAndLarge(datatocheck[key].relevant[g].split('_')[2],Math.pow(2,0))){
                datatocheck[key].relevant.splice(g,1);
              }
            }
          }

          //DHL KISZEDI MULTI TABLAKAT SINGLENEL
          if(datatocheck[key].alpha3.indexOf('DHL')>-1 && datatocheck[key].numberofpackets == 1){
            for(var u=datatocheck[key].relevant.length-1,len=0;u>=len;--u){
              if(BitwiseAndLarge(datatocheck[key].relevant[u].split('_')[2],Math.pow(2,0))){
                //console.log(datatocheck[key]);
                if(datatocheck[key].relevant.length>1){
                  datatocheck[key].relevant.splice(u,1);
                }
              }
            }
          }

          //console.log(datatocheck[key]);
          if(datatocheck[key].alpha3=='PST' && datatocheck[key].receiver_country.indexOf('z')!=-1){
            //PST z1 countrynál
            db.powerQueryPST(datatocheck[key].receiver_country,datatocheck[key].relevant[0],datatocheck[key].weight_billed, function(err,result){
              if(err){
                console.log(err);
                //console.log(datatocheck[key]);
                callback();
                return;
              }
              datatocheck[key].priceht = result[0];
              var temp = {
                main_data_id: '',
                pricevk: 0,
                priceht: 0
              };
              temp.main_data_id = datatocheck[key].id;
              for(var zonekey in result[0])
                temp['price'+datatocheck[key].relevant[0].split('_')[0]] = result[0][zonekey];
              arrayIdPrice.push(temp);
              //console.log(result);
              callback();
            });
          }else{
            //minden más
            //MULTI CSOMAGOK
            /*var calculatewiththisweight = 0;
            if(datatocheck[key].numberofpackets!='1' && datatocheck[key].numberofpackets!=''){
              calculatewiththisweight = (number)datatocheck[key].weight_billed
            }else{
              calculatewiththisweight = datatocheck[key].weight_billed;
            }*/
            //MULTI CSOMAG VÉGE

            /*if(datatocheck[key].numberofpackets!='1' && datatocheck[key].alpha3=='UPS' && datatocheck[key].tempservice=='STANDARD MULTI'){

            }else{

            }*/
            let weightusedhere;
            if(datatocheck[key].weightenteredbit == '1' && datatocheck[key].alpha3=='UPS' && datatocheck[key].tempservice=='STANDARD SINGLE'){
              weightusedhere = JSON.parse(JSON.stringify(datatocheck[key].weight_entered));
            }else{
              weightusedhere = JSON.parse(JSON.stringify(datatocheck[key].weight_billed));
            }

            db.powerQuery(datatocheck[key].receiver_country,datatocheck[key].relevant[0], weightusedhere, function(err,result){
              if(err){
                //console.log('powerquery');
                //fs.appendFile('output_logger__.txt', JSON.stringify(datatocheck[key]) + '\r\n' + err + '\r\n',function(err){});
                //console.log(datatocheck[key]);
                //console.log(err);
                if(datatocheck[key].numberofpackets!='1' && datatocheck[key].alpha3=='UPS' && datatocheck[key].tempservice=='STANDARD MULTI'){
                  upsBackDivide(vkhttbls,datatocheck[key],function(err,priceback) {
                    if(err) {
                      console.log(err);
                      console.log('elakad0');
                    }else{
                      //console.log('ok');
                      arrayIdPrice.push(priceback);
                      callback();
                      return;
                    }
                  });
                  //console.log('most meg ide');
                  /*callback();
                  return;*/
                }else{
                  fs.appendFile('errnozone.txt', err + '\r\n' + err + '\r\n',function(err){});
                  //console.log('ide jut');
                  //RÉSZLETES HIBA
                  //console.log(datatocheck[key]);
                  callback();
                  return;
                }
              }
              //fs.appendFile('output_logger__.txt', JSON.stringify(result[0]) + '\r\n' + err + '\r\n',function(err){});
              else{
                //console.log('ide is jut');
                //console.log(result);
                datatocheck[key].priceht = result[0];
                var temp = {
                  main_data_id: '',
                  pricevk: 0,
                  priceht: 0
                };
                temp.main_data_id = datatocheck[key].id;
                for(var zonekey in result[0])
                  temp['price'+datatocheck[key].relevant[0].split('_')[0]] = result[0][zonekey];
                arrayIdPrice.push(temp);
                //console.log(result);
                callback();
              }
            });
          }
        }else{
          //NINCS ÁR
          var temp = {
            main_data_id: datatocheck[key].id,
            pricevk: 0,
            priceht: 0
          };
          //temp.main_data_id = datatocheck[key].id;
          arrayIdPrice.push(temp);
          //console.log(datatocheck[key]);
          callback();
        }
      }, function(err){
        if (err) console.log(err);
        //console.log(arrayIdPrice);
        //console.log(arrayIdSurcharge);
        db.addCalculatedPrice(arrayIdPrice,function(err,result){
          if(err){
            console.log(err);
            return;
          }
          calculateSurcharge(function(err){
            if(err) console.log(err);
            console.log('|PRICECALCULATION FINISHED|');
            callback();
          });
        });
        /*db.addCalculatedSurcharge(arrayIdSurcharge,function(err,result){
          if(err){
            console.log(err);
            return;
          }
        });*/
    });
  });
}

function upsBackDivide(vktables,datacheck,callbackMain){
  var upsStdMultitbl;
  async.forEachOf(vktables,function(value,key,callback){
    var splitted = value.TABLE_NAME.split('_');
    if (BitwiseAndLarge(splitted[2], Math.pow(2,6))&& splitted[0].indexOf('vk') != -1 && splitted[1]== datacheck.main_customer_id){
      upsStdMultitbl = value.TABLE_NAME;
    }
    callback();
  },function(err){
    if(err){
      console.log('elakad1');
      console.log(err);
    }else{
      //console.log('itt oksa');
      var weightforcheck = datacheck.weight_billed/datacheck.numberofpackets;
      weightforcheck = weightforcheck.toFixed(2);

      var priceback = {
        main_data_id: '',
        pricevk: 0,
        priceht: 0
      };
      priceback.main_data_id = datacheck.id;
      db.powerQuery(datacheck.receiver_country, upsStdMultitbl, weightforcheck, function(err2,result){
        if(err2){
          console.log('elakad2');
          console.log(datacheck);
          console.log(weightforcheck);
          console.log(err);
          callbackMain(null, priceback);
        }else{
          async.forEachOf(result[0], function(valas,keyas,callbackas){
            var ezmegy;
            ezmegy = valas*datacheck.numberofpackets;
            priceback.pricevk = ezmegy;
            callbackas();
          }, function(err3){
            if(err3){
              console.log('elakad3');
            }else{
              //console.log(priceback);
              callbackMain(null, priceback);
            }
          })
        }
      });
      //callbackMain();
    }
  });
}

function findVATCode(whichinvoice,callback){
  //console.log(whichinvoice);

  async.waterfall([
      function(callback){
        db.getDataForVAT(whichinvoice, function(err,result){
          if(err){
            callback(err);
            return;
          }
          callback(null,result[0],result[1]);
        });
      },
      function(arg1,arg2,callback){
        db.getEuCountries(function(err,result2){
          if(err){
            callback(err);
            return;
          }
          var euresulttoarr = Object.keys(result2).map(function(_) { return result2[_].alpha2; });
          callback(null,arg1,arg2,euresulttoarr);
        });
      },
      function(arg1,arg2,arg3,callback){
        db.getVATMatrix(function(err,result){
          if(err){
            callback(err);
            return;
          }
          callback(null,arg1,arg2,arg3,result)
        });
      },
      function(dataarr,datasurchargearr,eucountries,vatmatrix,callback){
        var dataarrupd = [];
        var datasurchargearrupd = [];
        async.waterfall([
          function(callback){
            composeVAT(dataarr,vatmatrix,eucountries,function(err,dat1){
              if(err) callback(err);
              callback(null,dat1);
            });
          },function(arg1,callback){
            composeVAT(datasurchargearr,vatmatrix,eucountries, function(err,dat2){
              if(err) callback(err);
              callback(null,arg1,dat2);
            });
          }
          ],function(err,data1,data2){
            callback(null,data1,data2);
          });
        /*async.eachSeries(dataarr, function iterator(item,callback){
          //console.log(item);
          var tempo = {
            id: item.id,
            main_vat_code: '',
            origdest: ''
          };
          var notb2c = 0;
          if(item.ustidnr!==''){
            notb2c=1;
          }
          checkVAT(item.fromcountry,item.tocountry,notb2c,vatmatrix,eucountries,function(err,code,origdest){
            if(err) console.log(err);
            tempo.main_vat_code = code;
            tempo.origdest = origdest;
            dataarrupd.push(tempo);
            //console.log(tempo);
            callback();
          });
          //callback();
        },function done(){
          callback(null,dataarrupd,datasurchargearrupd);
        });*/
        //async.ser
        //console.log(dataarr);
        //console.log(datasurchargearr);
        //console.log(eucountries);
        //console.log(vatmatrix);

      }
    ], function(err,dataarrupd_,datasurchargearrupd_){
      if(err) console.log(err);
      db.updateVATmainprice(dataarrupd_, function(err){
        if(err) console.log(err);
        db.updateVATmainsurcharge(datasurchargearrupd_, function(err2){
          if(err) console.log(err2);
          console.log('|UPDATE DATA AND SURCHARGE VAT|');
          callback();
        });
      });
      //console.log(dataarrupd_);
      //console.log(datasurchargearrupd_);

      //callback();
    })
  //receiver_country
  //customer_country
  //eu_countries
  //vatmatrix with codes,percentages
}

function composeVAT(arrayofdata,vatmatrix,eucountries,callback){
  var arraytemp = [];
  async.each(arrayofdata, function iterator(item,callback){
    //console.log(item);
    var tempo = {
      id: item.id,
      main_vat_code: '',
      origdest: ''
    };
    var notb2c = 0;
    if(item.ustidnr!==''){
      notb2c=1;
    }
    checkVAT(item.fromcountry,item.tocountry,notb2c,vatmatrix,eucountries,function(err,code,origdest){
      if(err) console.log(err);
      tempo.main_vat_code = code;
      tempo.origdest = origdest;
      arraytemp.push(tempo);
      //console.log(tempo);
      callback();
    });
    //callback();
  },function done(){
    callback(null,arraytemp);
    //callback(null,dataarrupd,datasurchargearrupd);
  });
}

function checkVAT(orig,dest,notb2c,vatmatrix,eucountries,callback){
  var finalorig='';
  var finaldest='';
  var finalcode = '';
  if(notb2c){
    if(orig==='AT'){
      finalorig = 'AT';
    }else if(eucountries.indexOf(orig)>-1){
      finalorig = 'EU';
    }else{
      finalorig = 'NEU';
    }
  }else{
    finalorig = 'B2C';
  }

  if(dest==='AT'){
    finaldest = 'AT';
  }else if(eucountries.indexOf(dest)>-1 || dest==='z1'){
    finaldest='EU';
  }else{
    finaldest = 'NEU';
  }
  async.each(vatmatrix, function(vatmatrixitem,callback){
    if(vatmatrixitem.origin===finalorig && vatmatrixitem.destination===finaldest){
      //console.log(vatmatrixitem);
      finalcode = vatmatrixitem.main_vat_code;
      //console.log(finalorig + '->' + finaldest);
    }
    //console.log(vatmatrixitem.origin);
    callback();
  },function(err){
    if(err){
      console.log(err);
      callback(err);
    }else{
      //console.log(vatmatrix);
      callback(null,finalcode,finalorig + '->' + finaldest);
    }
  });
}

//TREIBSTOFFARRAY
var treibstoff = [9,26,39,45,46,47];

//MAUTARRAY
var mautatarr = [52,54,56,58,60,62,64];
var mautatdearr = [51,53,55,57,59,61,63];

//PRIVATEARRAY
var privarr = [13,14,15,22,24,25,27,28];

//CODARRAY
var codarr = [12,21,31,35,65];

function calculateSurcharge(callback){
  //console.log(maininvoiceid);
  var arrayIdSurcharge = [];
  async.waterfall([
    function(callback){
      db.getSurchargePowerQuery(maininvoiceid, function(err,result){
        if(err){
          console.log(err);
          callback(err);
        }
        callback(null,result);
      });
    },
    function(surcharges,callback){
      async.each(surcharges, function(itemsr, callback){
        surchargePriceCalculation(itemsr, function(err){
          //console.log(itemsr);
          var surtemp = {
            main_data_surcharge_id: itemsr.main_data_surcharge_id,
            main_surcharge_id: itemsr.main_surcharge_id,
            pricevk: itemsr.pricevk,
            priceht: itemsr.priceht
          }
          arrayIdSurcharge.push(surtemp);
          callback();
        });
      },function(err){
        if(err){
          console.log(err);
        }
        db.addCalculatedSurcharge(arrayIdSurcharge, function(err,result){
          if(err) console.log(err);
          callback(null,surcharges);
        });
      });
    }
    ],function(err,resultwf){
      if(err){
        console.log(err);
      }
      console.log('|SURCHARGE CALCULATION FINISHED|');
      callback();
      //console.log(resultwf);
    });
}

function surchargePriceCalculation(checkthisitem, callback){
  async.waterfall([
    function(callback){
      if(checkthisitem.price==''){
        //console.log(checkthisitem);
      }
      if(treibstoff.indexOf(checkthisitem.main_surcharge_id)>-1){
        //A VIZSGÁLT SURCHARGE TREIBSTOFF
        //console.log(checkthisitem);
        db.getFuelSurcharge(checkthisitem.main_customer_id,maininvoiceid, checkthisitem.express, function(err,stdexp){
          if(err){
            console.log(err);
            callback(err);
          }

          //SAJAT VAGY GLOBAL VAGY MAS
          var calcwithwhat = parseFloat(0.00);
          if(parseFloat(stdexp[0][0].custprice)===-1.00){
            //GLOBAL
            calcwithwhat = parseFloat(stdexp[1][0].globprice);
            //console.log(stdexp);
          }else if(parseFloat(stdexp[0][0].custprice)===0){
            //INCLUDED
          }else if(parseFloat(stdexp[0][0].custprice)===-2.00){
            //OTHER
          }else{
            //SAJAT
            calcwithwhat = parseFloat(stdexp[0][0].custprice);
          }
          var pricevk = parseFloat(0.00);
          var priceht = parseFloat(0.00);
          if(checkthisitem.vkorht===0){
            pricevk = parseFloat(checkthisitem.price)*( (calcwithwhat/100) );
          }else{
            priceht = parseFloat(checkthisitem.price)*( (calcwithwhat/100) );
          }
          //console.log(checkthisitem.price +' * '+calcwithwhat+'% = '+pricevk.toFixed(2));
          checkthisitem.pricevk = pricevk.toFixed(2);
          checkthisitem.priceht = priceht.toFixed(2);
          callback(null);
        });
      }else if(mautatarr.indexOf(checkthisitem.main_surcharge_id)>-1 || mautatdearr.indexOf(checkthisitem.main_surcharge_id)>-1){
        db.getMautSurchargeForCalc(checkthisitem.main_customer_id, function(err,mautfinal){
          if(err) console.log(err);
          var pricevk = parseFloat(0.00);
          var priceht = parseFloat(0.00);
          if(parseFloat(mautfinal[0][0].at)===-1.00 && parseFloat(mautfinal[0][0].atde)===-1.00){
            //GLOBAL
            if(mautatarr.indexOf(checkthisitem.main_surcharge_id)>-1){
              pricevk = parseFloat(mautfinal[1][0].at);
            }else if(mautatdearr.indexOf(checkthisitem.main_surcharge_id)>-1){
              pricevk = parseFloat(mautfinal[1][0].atde);
            }
          }else{
            //FIXED
            if(mautatarr.indexOf(checkthisitem.main_surcharge_id)>-1){
              pricevk = parseFloat(mautfinal[0][0].at);
            }else if(mautatdearr.indexOf(checkthisitem.main_surcharge_id)>-1){
              pricevk = parseFloat(mautfinal[0][0].atde);
            }
          }

          checkthisitem.pricevk = pricevk.toFixed(2);
          checkthisitem.priceht = priceht.toFixed(2);


          callback(null);
        });
        //NEM TREIBSTOFF
        //console.log(checkthisitem);
      }else if(privarr.indexOf(checkthisitem.main_surcharge_id)>-1){
        //PRIVATESURCHARGE
        db.getPrivateSurchargeCalc(checkthisitem.main_customer_id, function(err,privfinal){
          if(err) console.log(err);
          var pricevk = parseFloat(0.00);
          var priceht = parseFloat(0.00);
          //console.log(privfinal);
          if(parseFloat(privfinal[0][0].priceprivate)===-1){
            //GLOBAL
            pricevk = parseFloat(privfinal[1][0].priceprivate);
          }else{
            //FIXED
            pricevk = parseFloat(privfinal[0][0].priceprivate);
          }

          checkthisitem.pricevk = pricevk.toFixed(2);
          checkthisitem.priceht = priceht.toFixed(2);
          callback(null);
        });
      }else if(codarr.indexOf(checkthisitem.main_surcharge_id)>-1){
        db.getCodSurchargeCalc(checkthisitem.main_customer_id, function(err,codfinal){
          if(err) console.log(err);
          //console.log(checkthisitem);
          //console.log(codfinal);
          var pricevk = parseFloat(0.00);
          var priceht = parseFloat(0.00);
          if(parseFloat(codfinal[0][0].at)===-1.00 && parseFloat(codfinal[0][0].de)===-1.00 && parseFloat(codfinal[0][0].internat)===-1.00){
            //GLOBAL
            if(checkthisitem.receiver_country=='DE'){
              pricevk = parseFloat(codfinal[1][0].de);
            }else if(checkthisitem.receiver_country=='AT'){
              pricevk = parseFloat(codfinal[1][0].at);
            }else{
              pricevk = parseFloat(codfinal[1][0].internat);
            }
          }else{
            //FIXED
            if(checkthisitem.receiver_country=='DE'){
              pricevk = parseFloat(codfinal[0][0].de);
            }else if(checkthisitem.receiver_country=='AT'){
              pricevk = parseFloat(codfinal[0][0].at);
            }else{
              pricevk = parseFloat(codfinal[0][0].internat);
            }
          }

          checkthisitem.pricevk = pricevk.toFixed(2);
          checkthisitem.priceht = priceht.toFixed(2);
          callback(null);
        });
      }
      else{
        callback(null);
        //NEM TREIBSTOFF NEM MAUT
      }
    }
    ],function(err){
      if(err) console.log('surchargePriceCalculation: '+err);
      //console.log(checkthisitem);

      callback(null);
    });
  //var testc = 0;
  //if(testc<2){
    //testc++;
  //}
}

/*function surchargePrice(customid, surid, express,invoiceid,callback){
  var bareboning = {
    val: 0,
    percentage: 0
  };
  db.getSurchargePrice(customid, surid, function(err,result){
    if(err) console.log(err);
    if(result){
      //TREIBSTOFF
      if(treibstoff.indexOf(surid)>-1){
        //IGEN
        if(result[0].value === -1){
          //GLOBAL ÁR
          //számla hónap kiderítése és akkor aktuális surcharge
          db.getFuelSurchargeByInvoiceDate(invoiceid, function(err,result2){
            if(err) console.log(err);
            if(result2){
              //console.log(result2);
              if(express===1){
                bareboning.val = result2[0].exp;
                bareboning.percentage = result[0].percentage;
              }else{
                bareboning.val = result2[0].std;
                bareboning.percentage = result[0].percentage;
              }
              //console.log(bareboning);
              callback(null,bareboning);
            }
          });
          //console.log('GLOBAL');
        }else{
          //SAJAT ÁR
          //return bareboning;
          callback(null,bareboning);
        }
        //result.main_surcharge_id
      }else{
        //NEM
        //console.log(result);
        //return bareboning;
        callback(null,bareboning);
      }
      //return result;
    }
  });
}*/

function filterHtVk(value){
  var prefix = value.split('_');
  if(prefix[0]==='vk'){
    return true;
  }else{
    return false;
  }
}

function filterVkHt(value){
  var prefix = value.split('_');
  if(prefix[0]==='ht'){
    return true;
  }else{
    return false;
  }
}

function usethisforitemcheck(item){
  console.log(item);
}
