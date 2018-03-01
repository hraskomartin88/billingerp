'use strict';

/* Filters */

angular.module('billingErp.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }).
  filter('comma2decimal', [
    function(){
      return function(input){
        var ret = (input)?input.toString().trim().replace(',','.'):null;
        return parseFloat(ret);
      };
    }
    ]).
  filter('decimal2comma', [
    function(){
      return function(input){
        var ret=(input)?input.toString().replace('.',','):null;
        if(ret){
          var decArr = ret.split(',');
          if(decArr.length>1){
            var dec=decArr[1].length;
            if(dec===1){ret+="0";}
          }
        }
        return ret;
      }
    }
    ]).
  filter('customeridfilt', [
    function (filter){
      return function(list,arrayFilter,element){
        if(arrayFilter){
          return filter(list,function(listItem){
            return arrayFilter.indexOf(listItem[element]) != -1;
          });
        }
        //return items;
        //return highlander;
      };
    }
    ]).
  filter('servicedisplay', [
    function(){
      return function(input,supplarr){
        var retthis = "";
        var servicearr = [{exp: "EXPRESS",stdmulti:"STANDARD MULTI",stdsingle:"STANDARD SINGLE"}];
        //console.log(supplarr);
        //console.log($);
        var inpsplit = input.split('_');
        if(inpsplit.length==4){
          //console.log(inpsplit[3]);
          //console.log(typeof(supplarr));
          if(typeof(supplarr)!== 'undefined'){
            var result = $.grep(supplarr, function(e){return e.id === Number(inpsplit[3])});
            //console.log(result[0].name);
            //console.log(servicearr[0][inpsplit[1]]);
            retthis = servicearr[0][inpsplit[1]] + " with " + result[0].name;
          }
          //console.log(result);
        }else{
          retthis = servicearr[0][inpsplit[1]];
        }
        return retthis;
      };
    }
    ]).
  filter('servicebitdisplay', [
    function(){
      return function(input,whatwehave,fulllist){
        //console.log(input);
        //console.log(whatwehave);
        //console.log(fulllist);
        var relevantinfo = whatwehave.split('_')[2];
        //console.log(relevantinfo);
        var respstring = [];
        for(var i=0,len=fulllist.length+1;i<len;++i){
          //if((relevantinfo&Math.pow(2,i))!=0){
          if(BitwiseAndLarge(relevantinfo,Math.pow(2,i))!=0){
            if(i==0){
              respstring.push('MULTI');
            }else{
              respstring.push('(' + fulllist[i-1].main_supplier_alpha3+ ') ' + fulllist[i-1].service);
            }
          }
        }
        //return $sce.trusAsHtml(respstring.join('<br>'));
        return respstring.join(', ');
      }
    }
    ]);


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