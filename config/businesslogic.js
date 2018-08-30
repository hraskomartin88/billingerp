var fs = require('fs'),
  async = require('async'),
  db = require('./mysql'),
  csv = require('csv'),
  path = require('path');
  Iconv = require('iconv').Iconv;

var HeaderGlsDe = ['invoiceno', 'invoicedate', 'accountnumber', 'empty', 'trackingnumber', 'labeldate', 'receiver_country', 'receiver_postalcode', 'empty', 'zuschlag1', 'zuschlag2', 'zuschlag3', 'zuschlag4', 'zuschlag5', 'zuschlag6', 'zuschlag7', 'zuschlag8', 'weight_billed', 'netamount', 'reference1', 'empty', 'empty'];
var HeaderGlsAt = ['accountnumber', 'invoiceno', 'invoicedate', 'trackingnumber', 'labeldate', 'weight_billed', 'netamount', 'zuschlag2', 'zuschlag1', 'reference1', 'service', 'receiver_country', 'receiver_postalcode', 'receiver_city', 'empty', 'receiver_contact','empty'];
var HeaderDHL = ['invoiceno','invoicedate','empty','accountnumber','empty','empty','zuschlag1','numberofpackets','netamount','zuschlag2','zuschlag3','zuschlag4','empty','vatcode','trackingnumber','weight_billed','reference1','labeldate','empty','receiver_country','empty','receiverdetails'];
var HeaderUPSLite = ['accountnumber', 'invoiceno', 'invoicedate', 'empty', 'trackingnumber', 'empty', 'reference1', 'reference2', 'empty', 'weight_entered', 'weight_billed', 'empty', 'tempservice', 'labeldate', 'empty', 'empty', 'empty', 'empty', 'receiver_contact', 'receiver_company', 'receiver_data', 'receiver_country', 'empty', 'netamount', 'empty', 'tempservice2', 'empty', 'empty', 'empty'];
//var HeaderUPS = ['1', 'accountnumber', '3', '4', 'invoicedate', 'invoiceno', '7', '8', '9', '10', '11', 'labeldate', '13', 'trackingnumber', '15', 'reference1', 'reference2', 'billoptioncode', 'numberofpackets', '20', '21', '22', '23', '24', '25', '26', 'weight_entered', '28', 'weight_billed', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'tempservice', '47', '48', '49', '50', '51', '52', 'netamount', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', 'receiver_contact', 'receiver_company', '69', '70', 'receiver_city', 'receiver_state', 'receiver_postalcode', 'receiver_country', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199', '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250'];
//var HeaderUPS = ['empty', 'accountnumber', 'empty', 'empty', 'invoicedate', 'invoiceno', 'empty', 'empty', 'empty', 'empty', 'empty', 'labeldate', 'empty', 'trackingnumber', 'empty', 'reference1', 'reference2', 'billoptioncode', 'numberofpackets', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'weight_entered', 'empty', 'weight_billed', 'empty', 'billoptioncode2', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'tempservice', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'netamount', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'receiver_contact', 'receiver_company', 'empty', 'empty', 'receiver_city', 'receiver_state', 'receiver_postalcode', 'receiver_country', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
var HeaderUPS = ['empty', 'accountnumber', 'empty', 'empty', 'invoicedate', 'invoiceno', 'empty', 'empty', 'empty', 'empty', 'empty', 'labeldate', 'empty', 'trackingnumber', 'empty', 'reference1', 'reference2', 'billoptioncode', 'numberofpackets', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'weight_entered', 'empty', 'weight_billed', 'empty', 'billoptioncode2', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'tempservice', 'empty', 'empty', 'empty', 'empty', 'empty', 'bruttoamount', 'netamount', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'receiver_contact', 'receiver_company', 'empty', 'empty', 'receiver_city', 'receiver_state', 'receiver_postalcode', 'receiver_country', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'trackingnumber2', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
var HeaderUPSHU = ['empty', 'accountnumber', 'empty', 'empty', 'invoicedate', 'invoiceno', 'empty', 'empty', 'empty', 'empty', 'empty', 'labeldate', 'empty', 'trackingnumber', 'empty', 'reference1', 'reference2', 'billoptioncode', 'numberofpackets', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'weight_entered', 'empty', 'weight_billed', 'empty', 'billoptioncode2', 'empty', 'empty', 'empty', 'zuschlag1', 'zuschlag2', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'tempservice', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'netamount', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'receiver_contact', 'receiver_company', 'empty', 'empty', 'receiver_city', 'receiver_state', 'receiver_postalcode', 'receiver_country', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
var HeaderUPSAT = ['empty', 'accountnumber', 'empty', 'empty', 'invoicedate', 'invoiceno', 'empty', 'empty', 'empty', 'empty', 'empty', 'labeldate', 'empty', 'trackingnumber', 'empty', 'reference1', 'reference2', 'billoptioncode', 'numberofpackets', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'weight_entered', 'empty', 'weight_billed', 'empty', 'billoptioncode2', 'empty', 'empty', 'empty', 'zuschlag1', 'zuschlag2', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'tempservice', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'netamount', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'receiver_contact', 'receiver_company', 'empty', 'empty', 'receiver_city', 'receiver_state', 'receiver_postalcode', 'receiver_country', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
var HeaderPST = ['labeldate','empty','trackingnumber','reference1','reference2','empty','tempservice','empty','receiver_postalcode','empty','invoiceno','weight_billed','zuschlag1','zuschlag2', 'zuschlag3','empty','empty'];
var HeaderSPR = ['empty','empty','trackingnumber','empty','tempservice', 'numberofpackets', 'weight_billed', 'netamount', 'empty','empty', 'empty','empty','empty','receiver_country','price1','price2','price3','empty','price4','price5','price6','price7','price8','price9','price10','invoiceno','empty','empty','receiver_company','receiver_city','labeldate','empty'];
var HeaderNewDHL_old = ['empty','empty','empty','invoiceno','empty','empty','empty','invoicedate','empty','empty','empty','accountnumber','empty','empty','empty','empty','empty','empty','trackingnumber','labeldate','reference1','empty','empty','empty','servicecode','numberofpackets','empty','empty','empty','empty','empty','empty','empty','empty','empty','receiver_country','receiver_city','empty','empty','receiver_company','empty','empty','empty','receiver_postalcode','receiver_contact','empty','empty','empty','empty','empty','weight_billed','empty','empty','empty','vatcode','empty','empty','empty','netamount','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','zuschlag1_name','zuschlag1_price','empty','empty','empty','empty','empty','zuschlag2_name','zuschlag2_price','empty','empty','empty','empty','empty','zuschlag3_name','zuschlag3_price','empty','empty','empty','empty','empty','zuschlag4_name','zuschlag4_price','empty','empty','empty','empty','empty','zuschlag5_name','zuschlag5_price','empty','empty','empty','empty','empty','zuschlag6_name','zuschlag6_price','empty','empty','empty','empty','empty','zuschlag7_name','zuschlag7_price','empty','empty','empty','empty','empty','zuschlag8_name','zuschlag8_price','empty','empty','empty','empty','empty','zuschlag9_name','zuschlag9_price','empty','empty','empty','empty'];
var HeaderNewDHL = ['empty','empty','empty','invoiceno','empty','empty','empty','invoicedate','empty','empty','empty','accountnumber','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','trackingnumber','labeldate','empty','empty','reference1','empty','empty','empty','servicecode','numberofpackets','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','receiver_country','receiver_city','empty','empty','receiver_company','empty','empty','empty','receiver_postalcode','receiver_contact','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','weight_billed','empty','empty','empty','vatcode','empty','empty','empty','netamount','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','zuschlag1_name','zuschlag1_price','empty','empty','empty','empty','empty','zuschlag2_name','zuschlag2_price','empty','empty','empty','empty','empty','zuschlag3_name','zuschlag3_price','empty','empty','empty','empty','empty','zuschlag4_name','zuschlag4_price','empty','empty','empty','empty','empty','zuschlag5_name','zuschlag5_price','empty','empty','empty','empty','empty','zuschlag6_name','zuschlag6_price','empty','empty','empty','empty','empty','zuschlag7_name','zuschlag7_price','empty','empty','empty','empty','empty','zuschlag8_name','zuschlag8_price','empty','empty','empty','empty','empty','zuschlag9_name','zuschlag9_price','empty','empty','empty','empty'];

var csvParserOptions = {
  delimiter: ';',
  relax:true,
  columns:HeaderGlsDe,
  rowDelimiter: '\n'
  //auto_parse: true
};

var csvParserOptionsGLSAt = {
  delimiter: ';',
  relax:true,
  columns:HeaderGlsAt,
  rowDelimiter: '\n'
  //auto_parse: true
};

var csvParserOptionsDHL = {
  delimiter: ',',
  relax:true,
  columns: HeaderDHL,
  rowDelimiter:'\n'
};

var csvParserOptionsNewDHL = {
  delimiter: ',',
  relax: true,
  columns: HeaderNewDHL,
  rowDelimiter: '\n'
}

var csvParserOptionsUPSLite = {
  delimiter: ',',
  relax:true,
  columns: HeaderUPSLite,
  rowDelimiter:'\n'
};

var csvParserOptionsUPS = {
  delimiter: ',',
  relax:true,
  columns: HeaderUPS,
  rowDelimiter:'\n'
};

var csvParserOptionsUPSHU = {
  delimiter: ',',
  relax:true,
  columns: HeaderUPSHU,
  rowDelimiter:'\n'
};

var csvParserOptionsUPSAT = {
  delimiter: ',',
  relax:true,
  columns: HeaderUPSAT,
  rowDelimiter:'\n'
};

var csvParserOptionsPST = {
  delimiter: ';',
  relax:true,
  columns: HeaderPST,
  rowDelimiter:'\r\n'
};

var csvParserOptionsSPR = {
  delimiter: ';',
  relax: true,
  columns: HeaderSPR,
  rowDelimiter: '\r\n',
  trim: true
};

Array.prototype.checkThanPush = function(item){
  var exists = false;
  if(this.length>0){
    for(var i = 0, len = this.length; i < len; i++){
      if(this[i].invoiceno === item.invoiceno){
        exists = true;
      }
    }
    if(!exists){
      this.push(item);
    }
  }else{
    this.push(item);
  }

}

exports.processFileLogic = function(supplier, dateofinv, filename){
  switch(supplier){
    case "1":
      console.log("GLS DE detected..");
      processGLSDE(supplier, dateofinv, filename);
      break;
    case "2":
      console.log("GLS AT detected..");
      processGLSAT(supplier, dateofinv, filename);
      break;
    case "3":
      //console.log("DHL detected..");
      //processDHL(supplier, dateofinv, filename);
      console.log("NEW DHL detected..");
      processNewDHL(supplier, dateofinv,filename);
      break;
    case "4":
      console.log("UPS AT detected..");
      processUPSAT(supplier,dateofinv,filename);
      break;
    case "5":
      console.log("UPS DE detected..");
      processUPSDE(supplier,dateofinv,filename);
      break;
    case "6":
      console.log("UPS HU detected..");
      processUPSHU(supplier,dateofinv,filename);
      break;
    case "7":
      console.log("POST AT detected..");
      processPSTAT(supplier,dateofinv,filename);
      break;
    case "8":
      console.log("SPRINTER detected..");
      processSPR(supplier, dateofinv, filename);
      break;
    default:
      break;
  }
}

function processSPR(supplier, dateofinv, filename){
  var output = [];
  var invoices = [];
  var invoiceno_top = '';

  var csvparser = csv.parse(csvParserOptionsSPR);
  //console.log(csvParserOptionsSPR);
  var stream = fs.createReadStream(path.join('./public/upload/',filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(rowCount<2){
      if(rowCount==0){
        console.log(data);
        invoiceno_top = data.empty.replace('Számlaszám: ','');
      }
      rowCount++;
    }else{
      if (data.trackingnumber!=''){
        delete data.empty;

        //data.netamount = parseFloat(data.price1).toFixed(2) + parseFloat(data.price2).toFixed(2) + parseFloat(data.price3).toFixed(2) + parseFloat(data.price4).toFixed(2) + parseFloat(data.price5).tofixed(2) + parseFloat(data.price6).toFixed(2) + parseFloat(data.price7).toFixed(2) + parseFloat(data.price8).toFixed(2) + parseFloat(data.price9).tofixed(2) + parseFloat(data.price10).toFixed(2);
        data.netamount = +data.price1+ +data.price2 + +data.price3+ +data.price4+ +data.price5+ +data.price6+ +data.price7+ +data.price8+ +data.price9+ +data.price10;
        delete data.price1;
        delete data.price2;
        delete data.price3;
        delete data.price4;
        delete data.price5;
        delete data.price6;
        delete data.price7;
        delete data.price8;
        delete data.price9;
        delete data.price10;
        data.trackingnumber = data.trackingnumber.replace('=','').replace('"','');
        data.invoiceno = invoiceno_top;
        /*
          SPRINTER HU 1 WORKDAY
          SPRINTER HU 2 WORKDAY
          SPRINTER HU BEFORE 10
          SPRINTER HU BEFORE 12
          SPRINTER HU SATURDAY
        */
        switch (data.tempservice) {
          case '1 munkanapos':
            data.tempservice = '1 WORKDAY';
            break;
          case '2 munkanapos':
            data.tempservice = '2 WORKDAY';
            break;
          case '3 munkanapos':
            data.tempservice = '3 WORKDAY';
            break;
          case '5 munkanapos':
            data.tempservice = '5 WORKDAY';
            break;
          default:
            break;
        }

        invoices.checkThanPush({invoiceno: data.invoiceno, date: dateofinv, main_supplier_id: supplier, status: '0', datetarget:dateofinv});
        return data;
      }
    }
  });
  transformer.on('readable',function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    //console.log(output);
    //console.log(invoices);
    processSPR2(output,invoices);
  });

  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
};

function processUPSAT(supplier,dateofinv,filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsUPSHU);
  var stream = fs.createReadStream(path.join('./public/upload/',filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(data.tempservice.indexOf('20.000 % Tax')==-1 && data.netamount!=='0.00'){
      if(data.zuschlag1 == 'ADJ' && data.zuschlag2=='RADJ'){
        data.tempservice += ' ÄNDERUNG';
      }
      delete data.empty;
      data.tempservice = data.tempservice.toUpperCase().replace('TB ','').replace('WW ', '').replace('DOM. ','').replace('NOCH NICHT IN RECHNUNG GESTELLT ','').replace('AUSGLEICHSBUCHUNG EXPRESS SAVER','EXPRESS SAVER');
      if(data.numberofpackets>1 && data.tempservice=='STANDARD'){
        data.tempservice = 'STANDARD MULTI';
      }else if(data.tempservice=='STANDARD'){
        data.tempservice = 'STANDARD SINGLE';
      }
      data.billoptioncode = data.billoptioncode+ '|'+data.billoptioncode2;
      if(data.numberofpackets>0 && data.billoptioncode2==='LTR'){
        data.tempservice += ' ENVELOPE';
      }
      delete data.billoptioncode2;
      invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});

      delete data.zuschlag1;
      delete data.zuschlag2;
      return data;
    }
  });
  transformer.on('readable',function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processUPSDE2(output,invoices);
    //console.log(output);
  });

  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
  //stream.pipe(csvparser).pipe(transformer);
}

function processUPSHU(supplier,dateofinv,filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsUPSHU);
  var stream = fs.createReadStream(path.join('./public/upload/',filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(data.tempservice.indexOf('27.000 % Tax')==-1 && (data.netamount!=='0.00' || data.tempservice.indexOf('pótdíj')>-1)){
      if(data.zuschlag1 == 'ADJ' && data.zuschlag2=='RADJ'){
        data.tempservice += ' ÄNDERUNG';
      }
      delete data.empty;
      data.tempservice = data.tempservice.toUpperCase().replace('TB ','').replace('WW ', '');
      if(data.numberofpackets>1 && data.tempservice=='STANDARD'){
        data.tempservice = 'STANDARD MULTI';
      }else if(data.tempservice=='STANDARD'){
        data.tempservice = 'STANDARD SINGLE';
      }
      data.billoptioncode = data.billoptioncode+ '|'+data.billoptioncode2;
      if(data.numberofpackets>0 && data.billoptioncode2==='LTR'){
        data.tempservice += ' ENVELOPE';
      }
      delete data.billoptioncode2;
      invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});

      delete data.zuschlag1;
      delete data.zuschlag2;
      return data;
    }
  });
  transformer.on('readable',function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processUPSHU2(output,invoices);
    //processUPSDE2(output, invoices);
    /*console.log(output[76]);
    console.log(output.length);
    console.log(invoices);*/
  });

  stream.pipe(csvparser).pipe(transformer);
}

function processPSTAT(supplier,dateofinv,filename){
  var output = [];
  var invoices = [];
  var pstcase = 0;
  /*
    CASE1
    zuschlag2: Sperrgut Gross
    zuschlag3: Sendungsverfolgung auf..

    CASE2
    zuschlag2: Sperrgut Klein
    zuschlag3: Sendungsverfolgung auf..

    CASE3
    zuschlag2: Sperrgut Gross
    zuschlag3: Sperrgut Klein
  */


  var csvparser = csv.parse(csvParserOptionsPST);
  var stream = fs.createReadStream(path.join('./public/upload/', filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(rowCount==0){
      //CASES
      if(data.zuschlag2.indexOf('Gross')>-1){
        if(data.zuschlag3.indexOf('Klein')>-1){
          pstcase = 3;
        }else if(data.zuschlag3.indexOf('Sendungsverfolgung')>-1){
          pstcase = 1;
        }
      }else{
        if(data.zuschlag2.indexOf('Klein')!=-1 && data.zuschlag3.indexOf('Sendungsverfolgung')!=-1){
          pstcase = 2;
        }
      }

      rowCount++;
    }else{
      if(data.labeldate.indexOf("SAPDebitor")===-1 && data.labeldate!=''){
        var correcteddate = data.labeldate.split(' ');
        correcteddate = correcteddate[0].split('.');
        data.labeldate = correcteddate[2] + '.'+ correcteddate[1] + '.' + correcteddate[0];
        data.accountnumber = data.trackingnumber.substr(2,5);
        if (data.weight_billed=='') data.weight_billed='0.00';
        data.weight_billed = data.weight_billed.replace(',','.');
        data.tempservice = data.tempservice.toUpperCase();
        data.numberofpackets = '1';
        delete data.empty;
        invoices.checkThanPush({invoiceno: data.invoiceno, date: dateofinv, main_supplier_id: supplier, status: '0', datetarget:dateofinv});
        //console.log(data);
        return data;
      }
    }
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    //processUPSDE2(output, invoices);
    processPSTAT2(output,invoices,pstcase);
  });

  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
}

function processUPSDE(supplier,dateofinv,filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsUPS);
  var stream = fs.createReadStream(path.join('./public/upload/', filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(data.bruttoamount!=='0.00' || data.netamount!=='0.00'){
      if(data.tempservice.indexOf('19.000 % TAX')==-1){
        delete data.empty;
        delete data.bruttoamount;
        data.invoicedate = data.invoicedate.replace(new RegExp('-', 'g'),'.');
        data.labeldate = data.labeldate.replace(new RegExp('-', 'g'),'.');
        data.tempservice = data.tempservice.toUpperCase().replace('TB ','').replace('WW ', '').replace('DOM. ','').replace('NOCH NICHT IN RECHNUNG GESTELLT ','');
        if(data.numberofpackets>1 && data.tempservice=='STANDARD'){
          data.tempservice = 'STANDARD MULTI';
        }else if(data.tempservice=='STANDARD'){
          data.tempservice = 'STANDARD SINGLE';
        }
        if(data.trackingnumber == ''){
          data.trackingnumber = data.trackingnumber2;
        }
        delete data.trackingnumber2;
        data.billoptioncode = data.billoptioncode + '|'+data.billoptioncode2;
        if(data.numberofpackets>0 && data.billoptioncode2==='LTR'){
          data.tempservice += ' ENVELOPE';
        }
        delete data.billoptioncode2;
        invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});
        /*if(data.tempservice.indexOf('KORREKTUR')>-1 || data.tempservice.indexOf('NDERUNG')>-1){
          console.log(data);
        }*/
        //console.log(data);
        return data;
      }
    }
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processUPSDE2(output, invoices);
  });

  //.pipe(new Iconv('WINDOWS-1252','UTF-8'))
  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
}

function processUPSDELite(supplier,dateofinv,filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsUPS);
  var stream = fs.createReadStream(path.join('./public/upload/', filename),{encoding:'utf-8'});
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    //console.log(data);
    if(rowCount<3){
      rowCount++;
    }else{
      delete data.empty;
      delete data.undefined;
      var correcteddate = data.invoicedate.split('/');
      data.invoicedate = correcteddate[2]+'.'+correcteddate[1]+'.'+correcteddate[0];
      if(data.labeldate!==''){
        var correcteddate2 = data.labeldate.split('/');
        data.labeldate = correcteddate2[2]+'.'+correcteddate2[1]+'.'+correcteddate2[0];
      }
      if(data.receiver_data!==''){
        var correctedreceiver = data.receiver_data.split('  ');
        data.receiver_city = correctedreceiver[0];
        data.receiver_postalcode = correctedreceiver[1];
      }else{
        data.receiver_city = '';
        data.receiver_postalcode = '';
      }

      invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});

      delete data.receiver_data;
      return data;
    }
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processUPSDE2(output, invoices);
  });
  stream.pipe(csvparser).pipe(transformer);
}

function processDHL(supplier,dateofinv, filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsDHL);
  var stream = fs.createReadStream(path.join('./public/upload/', filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(rowCount==0){
      rowCount++;
    }else{
      delete data.empty;
      delete data.undefined;
      var correcteddate = data.invoicedate.split('/');
      data.invoicedate = "20"+correcteddate[2]+'.'+correcteddate[1]+'.'+correcteddate[0];
      var correcteddate2 = data.labeldate.split('/');
      data.labeldate = "20"+correcteddate2[2]+'.'+correcteddate2[1]+'.'+correcteddate2[0];
      //console.log(data.receiverdetails);
      var correctedreceiver = data.receiverdetails.split(';');
      //console.log(correctedreceiver[2] + "\t" + correctedreceiver.length);
      data.receiver_postalcode = correctedreceiver[2];
      data.receiver_city = correctedreceiver[3];
      data.receiver_contact = correctedreceiver[4];
      data.receiver_company = correctedreceiver[0];
      delete data.receiverdetails;
      data.zuschlag1 = data.zuschlag1.toUpperCase();
      //var relevantcountry = data.receiver_country.split('.');
      //data.receiver_country = relevantcountry[0];
      invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});
      return data;
    }
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processDHL2(output, invoices);
  });
  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
}

function processNewDHL(supplier, dateofinv, filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsNewDHL);
  var stream = fs.createReadStream(path.join('./public/upload/', filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    if(rowCount<2){
      rowCount++;
    }else{
      delete data.empty;
      data.invoicedate = convertDateString(data.invoicedate);
      data.labeldate = convertDateString(data.labeldate);
      /*delete data.empty;
      delete data.undefined;
      var correcteddate = data.invoicedate.split('/');
      data.invoicedate = "20"+correcteddate[2]+'.'+correcteddate[1]+'.'+correcteddate[0];
      var correcteddate2 = data.labeldate.split('/');
      data.labeldate = "20"+correcteddate2[2]+'.'+correcteddate2[1]+'.'+correcteddate2[0];
      var correctedreceiver = data.receiverdetails.split(';');
      data.receiver_postalcode = correctedreceiver[2];
      data.receiver_city = correctedreceiver[3];
      data.receiver_contact = correctedreceiver[4];
      data.receiver_company = correctedreceiver[0];
      delete data.receiverdetails;
      data.zuschlag1 = data.zuschlag1.toUpperCase();*/
      if(typeof(data.servicecode)!='undefined'){
        data.tempservice = data.servicecode.toUpperCase();
      }else{
        console.log(data);
      }
      delete data.servicecode;
      invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});
      //console.log(data);
      return data;
    }
  });
  transformer.on('readable', function(){
    while(row=transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processNewDHL2(output, invoices);
  });
  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
}

//YYYYMMDD -> YYYY-MM-DD
function convertDateString(datestring){
  return datestring.substr(0,4) + '.' + datestring.substr(4,2) + '.' + datestring.substr(6,2);
}

function processGLSAT(supplier, dateofinv, filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptionsGLSAt);
  var stream = fs.createReadStream(path.join('./public/upload/',filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    delete data.empty;
    delete service;
    //data.weight_billed = data.weight_billed/100;
    //data.netamount = data.netamount/100;
    var correcteddate = data.invoicedate.split('.');
    data.invoicedate = correcteddate[2]+'.'+correcteddate[1]+'.'+correcteddate[0];
    var correcteddate2 = data.labeldate.split('.');
    data.labeldate = correcteddate2[2]+'.'+correcteddate2[1]+'.'+correcteddate2[0];
    invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});
    data.tempservice = "STANDARD SINGLE";
    data.receiver_country = data.receiver_country.trim();
    return data;
  });
  transformer.on('readable', function(){
    while(row = transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    //processGLSDE2(output,invoices);
    processGLSAT2(output,invoices);
    //console.log(output);
    //console.log(invoices);
  });
  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
}

function processGLSDE(supplier, dateofinv, filename){
  var output = [];
  var invoices = [];

  var csvparser = csv.parse(csvParserOptions);
  var stream = fs.createReadStream(path.join('./public/upload/',filename));
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    delete data.empty;
    var correcteddate = data.invoicedate.split('.');
    data.invoicedate = correcteddate[2]+'.'+correcteddate[1]+'.'+correcteddate[0];
    var correcteddate2 = data.labeldate.split('.');
    data.labeldate = correcteddate2[2]+'.'+correcteddate2[1]+'.'+correcteddate2[0];
    data.weight_billed = data.weight_billed/10;
    data.netamount = data.netamount/100;
    data.tempservice = "STANDARD SINGLE";
    data.receiver_country = data.receiver_country.trim();

    invoices.checkThanPush({invoiceno: data.invoiceno, date: data.invoicedate, main_supplier_id: supplier, status: '0', datetarget:dateofinv});

    return data;
  });
  transformer.on('readable', function(){
    while(row = transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    processGLSDE2(output,invoices);
  });
  stream.pipe(new Iconv('iso-8859-1','utf-8')).pipe(csvparser).pipe(transformer);
}

function processSPR2(output_, invoices_){
  console.log(output_[3]);
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_, function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        callback(null,result);
      })
    },
    function nextThingsToDo(invoices, callback){
      callback(null);
    },
    function done(){
      console.log('FIN');
    }
  ], function(error){
    if(error){
      console.log('ERR:',error);
      return;
    }
  });
}

function processUPSHU2(output_,invoices_){
  //console.log(output_[60]);
  //console.log(invoices_);
  var output2_ = [];
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_, function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        db.getSurchargeList(function(err,result2){
          if(err){
            callback(new Error(err.message));
            return;
          }
          db.getServices(function(err,result3){
            if(err){
              callback(new Error(err.message));
              return;
            }
            callback(null,result,result2,result3);
          });
          //callback(null,result,result2);
        });
      });
    },
    function nextThingsToDowiththings(invoices,surcharges,servicesstdexp,callback){
      var zuschlag = [];
      //console.log(surcharges);
      async.each(output_,function iterator(item,callback){
        //'000002011215'
        for(var i=0,len=invoices.length;i<len;++i){
          if(invoices[i].hasOwnProperty(item.invoiceno)){
            item.main_invoice_id = invoices[i][item.invoiceno];
            delete item.invoiceno;
            delete item.invoicedate;

            if(item['tempservice'].indexOf('COD')!=-1 || item['tempservice'].indexOf('PÓTDÍJ')!=-1 || item['tempservice'].indexOf('KEZELÉS')!=-1 || item['tempservice'].indexOf('ÄNDERUNG')!=-1 || item['tempservice'].indexOf('LAKÓHELYRE')!=-1){
              for(var j=0,len5=surcharges.length;j<len5;++j){
                if(surcharges[j].spl_surcharge.indexOf(item['tempservice'])>-1){
                  var pushzs = {};
                  pushzs.main_trackingnumber = item.trackingnumber;
                  pushzs.main_surcharge_id = surcharges[j].id;
                  pushzs.main_invoice_id = item.main_invoice_id;
                  pushzs.netamount = item.netamount;
                  pushzs.numberofpackets = item.numberofpackets;
                  pushzs.accountnumber = item.accountnumber;
                  pushzs.labeldate = item.labeldate;
                  pushzs.reference1 = item.reference1;
                  pushzs.reference2 = item.reference2;
                  pushzs.billoptioncode = item.billoptioncode;
                  pushzs.weight_billed = item.weight_billed;
                  pushzs.weight_entered = item.weight_entered;
                  pushzs.receiver_country = item.receiver_country;
                  pushzs.receiver_state = item.receiver_state;
                  pushzs.receiver_postalcode = item.receiver_postalcode;
                  pushzs.receiver_city = item.receiver_city;
                  pushzs.receiver_contact = item.receiver_contact;
                  pushzs.receiver_company = item.receiver_company;
                  zuschlag.push(pushzs);
                  break;
                }
              }
            }else{
              output2_.push(item);
            }
          }
        }
        //console.log(item);
        callback(null);
      },function done(){
        //console.log(output2_[0]);
        //console.log(zuschlag.length);

        //ADDMAUT START
        //console.log(servicesstdexp);
        async.each(output2_, function(shipmentsitems,callback){
          //console.log(shipmentsitems);
          findIfStdOrExp('UPS',servicesstdexp,shipmentsitems, function(err,val){
            //console.log(val);
            if(val===0){
              var mautzs = {};
              mautzs.main_trackingnumber = shipmentsitems.trackingnumber;
              decideMautByCountry(shipmentsitems.receiver_country)==1 ? mautzs.main_surcharge_id = 60 : mautzs.main_surcharge_id = 61;
              mautzs.main_invoice_id = shipmentsitems.main_invoice_id;
              mautzs.netamount = 0;
              mautzs.numberofpackets = shipmentsitems.numberofpackets;
              mautzs.accountnumber = shipmentsitems.accountnumber;
              mautzs.labeldate = shipmentsitems.labeldate;
              mautzs.reference1 = shipmentsitems.reference1;
              mautzs.reference2 = shipmentsitems.reference2;
              mautzs.billoptioncode = shipmentsitems.billoptioncode;
              mautzs.weight_billed = shipmentsitems.weight_billed;
              mautzs.weight_entered = shipmentsitems.weight_entered;
              mautzs.receiver_country = shipmentsitems.receiver_country;
              mautzs.receiver_state = shipmentsitems.receiver_state;
              mautzs.receiver_postalcode = shipmentsitems.receiver_postalcode;
              mautzs.receiver_city = shipmentsitems.receiver_city;
              mautzs.receiver_contact = shipmentsitems.receiver_contact;
              mautzs.receiver_company = shipmentsitems.receiver_company;
              zuschlag.push(mautzs);
            }
            callback();
          });
        }, function(err){
          if(err) console.log(err);
          db.addShipmentsUPS(output2_, function(err,result){
            if(err){
              callback(new Error(err.message));
              return;
            }
            if(zuschlag.length>0){
              //console.log(zuschlag);
              db.addSurcharge(zuschlag);
            }
            callback(null);
          });
          console.log('fin');
        });

        //ADDMAUT STOP

        /*db.addShipmentsUPS(output2_, function(err,result){
          if(err){
            callback(new Error(err.message));
            return;
          }
          if(zuschlag.length>0){
            //console.log(zuschlag);
            db.addSurcharge(zuschlag);
          }
          callback(null);
        });*/
      });
    }
    ], function(error){
      if(error){
        console.log('ERR:',error);
        return;
      }
    });
}

function processPSTAT2(output_,invoices_,pstcase_){
  //console.log(invoices_);
  var output2_ = [];
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_, function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        callback(null,result);
      })
    },
    function separateZuschlagVonScheis(invoicedata,callback){
      var zuschlag = [];
      async.eachSeries(output_, function iterator(item,callback){
        for(var i=0,len=invoicedata.length;i<len;++i){
          if(invoicedata[i].hasOwnProperty(item.invoiceno)){
            item.main_invoice_id = invoicedata[i][item.invoiceno];
            delete item.invoiceno;

                if(item.tempservice.startsWith("EMS") || item.tempservice.startsWith("PAKET ÖSTERREICH") || item.tempservice.startsWith("PREMIUM LIGHT") || item.tempservice.startsWith("PREMIUM ÖSTERREICH")){
                  item.receiver_country = 'AT';
                }else{
                  var m = item.tempservice.match(/([^\?]*)\ ZONE (\d*)/);
                  if(m){
                    var zonenr = m[2];
                    item.receiver_country = 'z'+zonenr;
                  }else{
                    var c = item.tempservice.match(/([^\?]*)\PAKET INT. (\w*)/);
                    if(c){
                      switch(c[2]){
                        case "DEUTSCHLAND":
                          item.receiver_country = 'DE';
                          break;
                        case "GROSSBRITANNIEN":
                          item.receiver_country = 'GB';
                          break;
                        case "FRANKREICH":
                          item.receiver_country = 'FR';
                          break;
                        case "ITALIEN":
                          item.receiver_country = 'IT';
                          break;
                        case "SCHWEIZ":
                          item.receiver_country = 'CH';
                          break;
                        default:
                          item.receiver_country = c[2];
                          break;
                      }
                    }else{
                      item.receiver_country = '';
                    }
                  }
                }
                var temperservice = '';
                temperservice = item.tempservice.split(' ');
                var temperservice2 = temperservice[0] + ' ' + temperservice[1];
                if(temperservice2.indexOf("PAKET INT")>-1){
                  temperservice2 = "PAKET INT. ";
                  if(item.tempservice.indexOf("SCHNELL")>-1){
                    temperservice2+= "SCHNELL";
                  }else{
                    temperservice2+= "STANDARD";
                  }
                }
                item.tempservice = temperservice2;


                //console.log(getPstNetPrice(item.tempservice, item.receiver_country, item.weight_billed));
                //console.log('\r\n');
                //console.log(item);

            for(var j=1; j<4;++j){
              //console.log((pstcase_==1 || pstcase_==2)&&j==3);
              if((pstcase_==1 || pstcase_==2)&&j==3){
                delete item['zuschlag' + j];
                break;
              }
              if(item['zuschlag'+j]!=''){
                //ZUSCHLAG PROCESS
                var pushzs = {};
                pushzs.main_trackingnumber = item.trackingnumber;
                switch(j){
                  case 1:
                    //"NACHNAHME"
                    pushzs.main_surcharge_id = 31;
                    break;
                  case 2:
                    if(pstcase_== 1 || pstcase_ == 3){
                      //SPERRGUT GROSS
                      pushzs.main_surcharge_id = 32;
                    }else if(pstcase_ == 2){
                      //SPERRGUT KLEIN
                      pushzs.main_surcharge_id = 33;
                    }
                    break;
                  case 3:
                    if(pstcase_ == 3){
                      //SPERRGUT KLEIN
                      pushzs.main_surcharge_id = 33;
                    }
                    break;
                  default:
                    break;
                }
                //console.log(pushzs.main_surcharge_id);
                pushzs.main_invoice_id = item.main_invoice_id;
                pushzs.netamount = 0;

                pushzs.numberofpackets = item.numberofpackets;
                pushzs.accountnumber = item.accountnumber;
                pushzs.labeldate = item.labeldate;
                pushzs.reference1 = item.reference1;
                pushzs.reference2 = item.reference2;
                pushzs.billoptioncode = item.billoptioncode;
                pushzs.weight_billed = item.weight_billed;
                pushzs.weight_entered = 0;
                pushzs.receiver_country = item.receiver_country;
                pushzs.receiver_state = item.receiver_state;
                pushzs.receiver_postalcode = item.receiver_postalcode;
                pushzs.receiver_city = item.receiver_city;
                pushzs.receiver_contact = '';
                pushzs.receiver_company = '';

                zuschlag.push(pushzs);
                delete item['zuschlag'+j];
              }else{
                delete item['zuschlag'+j];
              }
            }
                /*if(temperservice.indexOf("PAKET INT")!==0){
                  if(item.tempservice.indexOf("SCHNELL")!==0){
                    item.tempservice = "PAKET INT. SCHNELL";
                  }else{
                    item.tempservice = "PAKET INT. STANDARD";
                  }
                }else{
                  item.tempservice = temperservice;
                }*/
          }
        }
        //PST Internal Price request. Service, Country, Weight
        getPstNetPrice(item.tempservice, item.receiver_country, item.weight_billed, function(err, resultat){
          if(resultat){
            item.netamount = resultat;
          }else{
            item.netamount = '0';
          }
          callback(null);
        });

      },function done(){
        //console.log(output_[216]);
        //console.log(zuschlag);
          async.each(output_,function(shipments,callback){
            //console.log(shipments);
            var treibstoffzs = {};
            treibstoffzs.main_trackingnumber = shipments.trackingnumber;
            treibstoffzs.main_surcharge_id = 45;
            treibstoffzs.main_invoice_id = shipments.main_invoice_id;
            treibstoffzs.netamount = 0;

            treibstoffzs.numberofpackets = shipments.numberofpackets;
            treibstoffzs.accountnumber = shipments.accountnumber;
            treibstoffzs.labeldate = shipments.labeldate;
            treibstoffzs.reference1 = shipments.reference1;
            treibstoffzs.reference2 = shipments.reference2;
            treibstoffzs.billoptioncode = shipments.billoptioncode;
            treibstoffzs.weight_billed = shipments.weight_billed;
            treibstoffzs.weight_entered = 0;
            treibstoffzs.receiver_country = shipments.receiver_country;
            treibstoffzs.receiver_state = shipments.receiver_state;
            treibstoffzs.receiver_postalcode = shipments.receiver_postalcode;
            treibstoffzs.receiver_city = shipments.receiver_city;
            treibstoffzs.receiver_contact = '';
            treibstoffzs.receiver_company = '';
            //console.log(treibstoffzs);
            zuschlag.push(treibstoffzs);


            var mautzs = {};
            mautzs.main_trackingnumber = shipments.trackingnumber;
            decideMautByCountry(shipments.receiver_country)==1 ? mautzs.main_surcharge_id = 63 : mautzs.main_surcharge_id = 64;
            mautzs.main_invoice_id = shipments.main_invoice_id;
            mautzs.netamount = 0;

            mautzs.numberofpackets = shipments.numberofpackets;
            mautzs.accountnumber = shipments.accountnumber;
            mautzs.labeldate = shipments.labeldate;
            mautzs.reference1 = shipments.reference1;
            mautzs.reference2 = shipments.reference2;
            mautzs.billoptioncode = shipments.billoptioncode;
            mautzs.weight_billed = shipments.weight_billed;
            mautzs.weight_entered = 0;
            mautzs.receiver_country = shipments.receiver_country;
            mautzs.receiver_state = shipments.receiver_state;
            mautzs.receiver_postalcode = shipments.receiver_postalcode;
            mautzs.receiver_city = shipments.receiver_city;
            mautzs.receiver_contact = '';
            mautzs.receiver_company = '';

            zuschlag.push(mautzs);

            callback();
          },function(err){
            if(err) console.log(err);
            //console.log(zuschlag[23]);
            db.addShipmentsPST(output_, function(err,result){
              if(err){
                callback(new Error(err.message));
                return;
              }
              if(zuschlag.length>0){
                db.addSurcharge(zuschlag);
              }
              callback(null);
            });
          });
        });
      }
    ], function(error){
    if(error){
      console.log('ERR:',error);
      return;
    }
    console.log('fin');
  });
}

function getPstNetPrice(servicetouse, countrytouse, weighttouse, callback){
  var tablename = '';
  switch(servicetouse){
    case "EMS ÖSTERREICH":
      tablename = 'pstat_01';
      break;
    case "PAKET INT. SCHNELL":
      tablename = 'pstat_41s';
      break;
    case "PAKET INT. STANDARD":
      tablename = 'pstat_41';
      break;
    case "PAKET ÖSTERREICH":
      tablename = 'pstat_10';
      break;
    case "PREMIUM INTERNATIONAL":
      tablename = 'pstat_45';
      break;
    case "PREMIUM LIGHT":
      tablename = 'pstat_14';
      break;
    case "PREMIUM ÖSTERREICH":
      tablename = 'pstat_31';
      break;
    case "1502 FELDPOSTPAKET":
      tablename = 'pstat_1502';
      countrytouse = 'z1';
      break;
    case "1503 FELDPOSTPAKET":
      tablename = 'pstat_1503';
      countrytouse = 'z1';
      break;
    case "1504 FELDPOSTPAKET":
      tablename = 'pstat_1504';
      countrytouse = 'z1';
      break;
    default:
      tablename = 'UNKNOWN';
      break;
  }

  var zonename = '';
  switch (countrytouse) {
    case 'DE':
      zonename = 'z6';
      break;
    case 'GB':
      zonename = 'z7';
      break;
    case 'FR':
      zonename = 'z8';
      break;
    case 'IT':
      zonename = 'z9';
      break;
    case 'CH':
      zonename = 'z10';
      break;
    case 'AT':
      zonename = 'z1';
      break;
    default:
      zonename = countrytouse;
      break;
  }
  //console.log(countrytouse+'-'+tablename+'-'+weighttouse);
  //return '';

  db.powerNetQueryPst(zonename, tablename, weighttouse, function(err,ered){
    if(err){
      console.log(err);
      //return;
    }
    //console.log(ered);
    callback(null,ered);
  });

  //console.log(tablename);
  //return tablename;
}

function processUPSDE2(output_,invoices_){
  //console.log(output_);
  //console.log(invoices_);
  //console.log(output_[2]);
  var output2_ = [];
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_,function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        db.getSurchargeList(function(err,result2){
          if(err){
            callback(new Error(err.message));
            return;
          }
          db.getServices(function(err,result3){
            if(err){
              callback(new Error(err.message));
              return;
            }
            callback(null,result,result2,result3);
          });
        });
      });
    },
    function nextThingsToDo(invoicedata,surcharges,servicesstdexp,callback){
      var zuschlag = [];

      async.each(output_, function iterator(item,callback){
        for(var i=0,len=invoicedata.length;i<len;++i){
          if(invoicedata[i].hasOwnProperty(item.invoiceno)){
            item.main_invoice_id = invoicedata[i][item.invoiceno];
            delete item.invoiceno;
            delete item.invoicedate;

            if(item['tempservice'].indexOf('ÄNDERUNG')!=-1 || item['tempservice'].indexOf('KORREKTUR')!=-1 || item['tempservice'].indexOf('NACHNAHME')!=-1 || item['tempservice'].indexOf('PRIVATZUSTELLUNG')!=-1 || item['tempservice'].indexOf('SAMSTAGZUSTELLUNG')!=-1 || item['tempservice'].indexOf('TREIBSTOFFZUSCHL.')!=-1 || item['tempservice'].indexOf('ZUSÄTZLICHE HANDHABUNG')!=-1 || item['tempservice'].indexOf('ZUSCHLAG FÜR GROSSE PAKETE')!=-1 || item['tempservice'].indexOf('DRUCKETIKETTE')!=-1 || item['tempservice'].indexOf('T-STATUS')!=-1 || item['tempservice'].indexOf('GEBÜHR ZÖLLE UND STEUERN')!=-1 || item['tempservice'].indexOf('STANDARD UNDELIVERABLE RETURN')!=-1 || item['tempservice'].indexOf('AUSSENGEBIET ZUSCHLAG- ZUSTELLUNG')!=-1 || item['tempservice'].indexOf('ERWACHSENENUNTERSCHRIFT IST NÖTIG')!=-1 || item['tempservice'].indexOf('AUSSENGEBIET ZUSCHLAG-ZUSTELLUNG')!=-1 || item['tempservice'].indexOf('ZUSCHLAG ABGELEGENES GEBIET')!=-1 || item['tempservice'].indexOf('EXPRESS SAVER UNDELIVERABLE RETURN')!=-1 || item['tempservice'].indexOf('ABHOLUNG NÄCHSTER TAG - ELEKTR.')!=-1 || item['tempservice'].indexOf('ABHOLUNG GLEICHER TAG - ELEKTR.')!=-1 || item['tempservice'].indexOf('ALT. ADRESSE-NÄCHSTEN TAG ELEKTR.')!=-1 || item['tempservice'].indexOf('AUSGLEICHSBUCHUNG CHARGEBACK FEE')!=-1 || item['tempservice'].indexOf('ALT. ADRESSE-GLEICHER TAG ELEKTR.')!=-1 || item['tempservice'].indexOf('AUSGLEICHSBUCHUNG STANDARD')!=-1 || item['tempservice'].indexOf('ÜBER MAXIMALLÄNGE')!=-1){
              for(var j=0,len3=surcharges.length;j<len3;++j){
                if(surcharges[j].spl_surcharge.indexOf(item['tempservice'])>-1){
                  var pushzs = {};
                  pushzs.main_trackingnumber = item.trackingnumber;
                  pushzs.main_surcharge_id = surcharges[j].id;
                  pushzs.main_invoice_id = item.main_invoice_id;
                  pushzs.netamount = item.netamount;
                  pushzs.numberofpackets = item.numberofpackets;
                  pushzs.accountnumber = item.accountnumber;
                  pushzs.labeldate = item.labeldate;
                  pushzs.reference1 = item.reference1;
                  pushzs.reference2 = item.reference2;
                  pushzs.billoptioncode = item.billoptioncode;
                  pushzs.weight_billed = item.weight_billed;
                  pushzs.weight_entered = item.weight_entered;
                  //pushzs.main_service_id = null;
                  pushzs.receiver_country = item.receiver_country;
                  pushzs.receiver_state = item.receiver_state;
                  pushzs.receiver_postalcode = item.receiver_postalcode;
                  pushzs.receiver_city = item.receiver_city;
                  pushzs.receiver_contact = item.receiver_contact;
                  pushzs.receiver_company = item.receiver_company;
                  //console.log(pushzs);
                  zuschlag.push(pushzs);
                  break;
                }
              }
            }else if(item['tempservice'].indexOf('SÄUMNISGEBÜHR ( 8.00%)')==-1 && item['tempservice'].indexOf('BEFÖRDERUNG')==-1 && item['tempservice'].indexOf('19.000 % TAX')==-1 && item['tempservice'].indexOf('WÖCHENTLICHE SERVICEPAUSCHALE')==-1){
              output2_.push(item);
            }
          }
        }
        callback(null);
      },function done(){
        //console.log(output2_);

        //ADDMAUT START
        //console.log(servicesstdexp);
        async.each(output2_, function(shipmentsitems,callback){
          //console.log(shipmentsitems);
          findIfStdOrExp('UPS',servicesstdexp,shipmentsitems, function(err,val){
            //console.log(val);
            if(val===0){
              var mautzs = {};
              mautzs.main_trackingnumber = shipmentsitems.trackingnumber;
              //mautzs.main_surcharge_id = surcharges[j].id;
              decideMautByCountry(shipmentsitems.receiver_country)==1 ? mautzs.main_surcharge_id = 59 : mautzs.main_surcharge_id = 60;
              mautzs.main_invoice_id = shipmentsitems.main_invoice_id;
              mautzs.netamount = 0;
              mautzs.numberofpackets = shipmentsitems.numberofpackets;
              mautzs.accountnumber = shipmentsitems.accountnumber;
              mautzs.labeldate = shipmentsitems.labeldate;
              mautzs.reference1 = shipmentsitems.reference1;
              mautzs.reference2 = shipmentsitems.reference2;
              mautzs.billoptioncode = shipmentsitems.billoptioncode;
              mautzs.weight_billed = shipmentsitems.weight_billed;
              mautzs.weight_entered = shipmentsitems.weight_entered;
              mautzs.receiver_country = shipmentsitems.receiver_country;
              mautzs.receiver_state = shipmentsitems.receiver_state;
              mautzs.receiver_postalcode = shipmentsitems.receiver_postalcode;
              mautzs.receiver_city = shipmentsitems.receiver_city;
              mautzs.receiver_contact = shipmentsitems.receiver_contact;
              mautzs.receiver_company = shipmentsitems.receiver_company;
              //UPS MAUT ID!!!
              //mautzs.main_surcharge_id = surcharges[j].id;
              zuschlag.push(mautzs);
            }
            callback();
          });
        }, function(err){
          if(err) console.log(err);
          db.addShipmentsUPS(output2_, function(err,result){
            if(err){
              callback(new Error(err.message));
              return;
            }
            if(zuschlag.length>0){
              //console.log(zuschlag);
              db.addSurcharge(zuschlag);
            }
            callback(null);
          });
          console.log('fin');
        });

        //ADDMAUT STOP
        /*db.addShipmentsUPS(output2_, function(err,result){
          if(err){
            callback(new Error(err.message));
            return;
          }
          if(zuschlag.length>0){
            //console.log(zuschlag);
            db.addSurcharge(zuschlag);
          }
          callback(null);
        });*/
      });
    }
  ], function(error){
    if(error){
      console.log('ERR:',error);
      return;
    }
  });
}

function processDHL2(output_,invoices_){
  var output2_ = [];
  //console.log(invoices_);
  //async.waterfall
  //console.log(output_);
  //console.log(output_[1]);
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_,function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        db.getCountriesDHL(function(err,result2){
          if(err){
            callback(new Error(err.message));
            return;
          }
          db.getSurchargeList(function(err,result3){
            if(err){
              callback(new Error(err.message));
              return;
            }
            db.getServices(function(err,result4){
              if(err){
                callback(new Error(err.message));
                return;
              }
              callback(null,result,result2,result3,result4);
            });
          });
        });
      });
    },
    function weNeedThingsToDo(invoicedata,countries,surcharges,servicesstdexp,callback){
      //console.log(res1);
      //console.log(res2);
      //console.log(output_);
      var zuschlag = [];
      //console.log(surcharges);
      async.eachSeries(output_, function iterator(item,callback){
        for(var i=0, len=invoicedata.length;i<len;++i){
          if(invoicedata[i].hasOwnProperty(item.invoiceno)){
            item.main_invoice_id = invoicedata[i][item.invoiceno];
            delete item.invoiceno;
            delete item.invoicedate;
            for(var k=0, len2=countries.length;k<len2;++k){
              if(countries[k].custom_dhl.indexOf(item.receiver_country.split('.')[0])!=-1){
                item.receiver_country = countries[k].alpha2;
                break;
              }
            }
            //ZUSCHLAG EXTRA KOSTEN HERE
            //if(item['zuschlag1'].indexOf('Extrakosten')!=-1){
            //if(item['zuschlag1'].indexOf('Extrakosten')!=-1 || item['zuschlag1'].indexOf('ADDRESS CORRECTION')!=-1 || item['zuschlag1'].indexOf('DUTIES & TAXES PAID')!=-1 || item['zuschlag1'].indexOf('DUTIES TAXES PAID')!=-1 || item['zuschlag1'].indexOf('FUEL SURCHARGE')!=-1 || item['zuschlag1'].indexOf('PREMIUM 12:00')!=-1 || item['zuschlag1'].indexOf('PREMIUM 9:00')!=-1 || item['zuschlag1'].indexOf('RELABELING DATA ENTRY')!=-1 || item['zuschlag1'].indexOf('RESTRICTED DESTINATION')!=-1){
            if(item['zuschlag1'].indexOf('ADDRESS CORRECTION')!=-1 || item['zuschlag1'].indexOf('BAD ADDRESS DOMESTIC')!=-1 || item['zuschlag1'].indexOf('CASH ON DELIVERY')!=-1 || item['zuschlag1'].indexOf('CHANGE OF BILLING')!=-1 || item['zuschlag1'].indexOf('DATA ENTRY')!=-1 || item['zuschlag1'].indexOf('DELIVERY NOTIFICATION')!=-1 || item['zuschlag1'].indexOf('DRY ICE UN1845')!=-1 || item['zuschlag1'].indexOf('DUTIES & TAXES PAID')!=-1 || item['zuschlag1'].indexOf('DUTIES TAXES PAID')!=-1 || item['zuschlag1'].indexOf('Einholung eine Verzollungsverfügung')!=-1 || item['zuschlag1'].indexOf('ELEVATED RISK')!=-1 || item['zuschlag1'].indexOf('EXCEPTED QUANTITIES')!=-1 || item['zuschlag1'].indexOf('EXPORTER VALIDATION')!=-1 || item['zuschlag1'].indexOf('FUEL SURCHARGE')!=-1 || item['zuschlag1'].indexOf('Handover to Broker')!=-1 || item['zuschlag1'].indexOf('Importabfertigung mit XX Zeilen')!=-1 || item['zuschlag1'].indexOf('Lagergebühr')!=-1 || item['zuschlag1'].indexOf('LIMITED QUANTITIES')!=-1 || item['zuschlag1'].indexOf('LITHIUM ION PI965')!=-1 || item['zuschlag1'].indexOf('LITHIUM ION PI966')!=-1 || item['zuschlag1'].indexOf('LITHIUM METAL')!=-1 || item['zuschlag1'].indexOf('NEUTRAL DELIVERY')!=-1 || item['zuschlag1'].indexOf('OVER HANDLED PIECE')!=-1 || item['zuschlag1'].indexOf('OVER SIZED PIECE')!=-1 || item['zuschlag1'].indexOf('OVER WEIGHT PIECE')!=-1 || item['zuschlag1'].indexOf('Post Clearance Modification')!=-1 || item['zuschlag1'].indexOf('PREMIUM 10:30')!=-1 || item['zuschlag1'].indexOf('PREMIUM 12:00')!=-1 || item['zuschlag1'].indexOf('PREMIUM 9:00')!=-1 || item['zuschlag1'].indexOf('REMOTE AREA DELIVERY')!=-1 || item['zuschlag1'].indexOf('REMOTE AREA PICKUP')!=-1 || item['zuschlag1'].indexOf('RESTRICTED DESTINATION')!=-1 || item['zuschlag1'].indexOf('SAMSTAGSZUSTELLUNG')!=-1 || item['zuschlag1'].indexOf('SHIPMENT INSURANCE')!=-1 || item['zuschlag1'].indexOf('Weiterleitung von Zollgut')!=-1){
              for(var j=0,len3=surcharges.length;j<len3;++j){
                if(surcharges[j].spl_surcharge.indexOf(item['zuschlag1'])>-1){
                  var pushzs = {};
                  pushzs.main_trackingnumber = item.trackingnumber;
                  pushzs.main_surcharge_id = surcharges[j].id;
                  pushzs.main_invoice_id = item.main_invoice_id;
                  pushzs.netamount = item.netamount;
                  pushzs.numberofpackets = item.numberofpackets;
                  pushzs.accountnumber = item.accountnumber;
                  pushzs.labeldate = item.labeldate;
                  pushzs.reference1 = item.reference1;
                  pushzs.reference2 = '';
                  pushzs.billoptioncode = '';
                  pushzs.weight_billed = item.weight_billed;
                  pushzs.weight_entered = 0;
                  //pushzs.main_service_id = null;
                  pushzs.receiver_country = item.receiver_country;
                  pushzs.receiver_state = '';
                  pushzs.receiver_postalcode = item.receiver_postalcode;
                  pushzs.receiver_city = item.receiver_city;
                  pushzs.receiver_contact = item.receiver_contact;
                  pushzs.receiver_company = item.receiver_company;
                  zuschlag.push(pushzs);
                  break;
                }
              }
            }else{
              item.tempservice = item.zuschlag1;
              delete item.zuschlag1;
              delete item.zuschlag2;
              delete item.zuschlag3;
              delete item.zuschlag4;
              output2_.push(item);
            }
          }
        }
        callback(null);
      }, function done(){

        //ADDMAUT START
        //console.log(servicesstdexp);
        async.each(output2_, function(shipmentsitems,callback){
          //console.log(shipmentsitems);
          findIfStdOrExp('DHL',servicesstdexp,shipmentsitems, function(err,val){
            //console.log(val);
            if(val===0){
              var mautzs = {};
              mautzs.main_trackingnumber = shipmentsitems.trackingnumber;
              decideMautByCountry(shipmentsitems.receiver_country)==1 ? mautzs.main_surcharge_id = 55 : mautzs.main_surcharge_id = 56;
              //mautzs.main_surcharge_id = surcharges[j].id;
              mautzs.main_invoice_id = shipmentsitems.main_invoice_id;
              mautzs.netamount = 0;
              mautzs.numberofpackets = shipmentsitems.numberofpackets;
              mautzs.accountnumber = shipmentsitems.accountnumber;
              mautzs.labeldate = shipmentsitems.labeldate;
              mautzs.reference1 = shipmentsitems.reference1;
              mautzs.reference2 = '';
              mautzs.billoptioncode = '';
              mautzs.weight_billed = shipmentsitems.weight_billed;
              mautzs.weight_entered = 0;
              mautzs.receiver_country = shipmentsitems.receiver_country;
              mautzs.receiver_state = '';
              mautzs.receiver_postalcode = shipmentsitems.receiver_postalcode;
              mautzs.receiver_city = shipmentsitems.receiver_city;
              mautzs.receiver_contact = shipmentsitems.receiver_contact;
              mautzs.receiver_company = shipmentsitems.receiver_company;
              zuschlag.push(mautzs);
            }
            callback();
          });
        }, function(err){
          if(err) console.log(err);
          //console.log(output2_[2]);
          //console.log(zuschlag[2]);
          db.addShipmentsDHL(output2_, function(err,result){
            if(err){
              callback(new Error(err.message));
              return;
            }
            if(zuschlag.length>0){
              console.log(output2_[2]);
              console.log(zuschlag[2]);
              db.addSurcharge(zuschlag);
            }
            callback(null);
          });
          console.log('fin');
        });

        //ADDMAUT STOP
        //console.log(output_.length);
        //console.log(output2_[7]);
        //console.log(output2_[8]);
        /*db.addShipmentsDHL(output2_, function(err,result){
          if(err){
            callback(new Error(err.message));
            return;
          }
          if(zuschlag.length>0){
            //console.log(zuschlag);
            db.addSurcharge(zuschlag);
          }
          callback(null);
        });*/
      });
    }
  ], function(error){
    if(error){
      console.log('ERR:',error);
      return;
    }
  });
}

function processNewDHL2(output_,invoices_){
  var output2_ = [];
  //console.log(invoices_);
  //async.waterfall
  //console.log(output_);
  //console.log(output_[1]);
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_,function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        db.getCountriesDHL(function(err,result2){
          if(err){
            callback(new Error(err.message));
            return;
          }
          db.getSurchargeList(function(err,result3){
            if(err){
              callback(new Error(err.message));
              return;
            }
            db.getServices(function(err,result4){
              if(err){
                callback(new Error(err.message));
                return;
              }
              callback(null,result,result2,result3,result4);
            });
          });
        });
      });
    },
    function weNeedThingsToDo(invoicedata,countries,surcharges,servicesstdexp,callback){
      //console.log(res1);
      //console.log(res2);
      //console.log(output_);
      var zuschlag = [];
      //console.log(surcharges);
      async.eachSeries(output_, function iterator(item,callback){
        for(var i=0, len=invoicedata.length;i<len;++i){
          if(invoicedata[i].hasOwnProperty(item.invoiceno)){
            item.main_invoice_id = invoicedata[i][item.invoiceno];
            delete item.invoiceno;
            delete item.invoicedate;
            for(var k=0, len2=countries.length;k<len2;++k){
              if(countries[k].custom_dhl.indexOf(item.receiver_country.split('.')[0])!=-1){
                item.receiver_country = countries[k].alpha2;
                break;
              }
            }
            //ZUSCHLAG EXTRA KOSTEN HERE
            /*if(item['zuschlag1'].indexOf('ADDRESS CORRECTION')!=-1 || item['zuschlag1'].indexOf('BAD ADDRESS DOMESTIC')!=-1 || item['zuschlag1'].indexOf('CASH ON DELIVERY')!=-1 || item['zuschlag1'].indexOf('CHANGE OF BILLING')!=-1 || item['zuschlag1'].indexOf('DATA ENTRY')!=-1 || item['zuschlag1'].indexOf('DELIVERY NOTIFICATION')!=-1 || item['zuschlag1'].indexOf('DRY ICE UN1845')!=-1 || item['zuschlag1'].indexOf('DUTIES & TAXES PAID')!=-1 || item['zuschlag1'].indexOf('DUTIES TAXES PAID')!=-1 || item['zuschlag1'].indexOf('Einholung eine Verzollungsverfügung')!=-1 || item['zuschlag1'].indexOf('ELEVATED RISK')!=-1 || item['zuschlag1'].indexOf('EXCEPTED QUANTITIES')!=-1 || item['zuschlag1'].indexOf('EXPORTER VALIDATION')!=-1 || item['zuschlag1'].indexOf('FUEL SURCHARGE')!=-1 || item['zuschlag1'].indexOf('Handover to Broker')!=-1 || item['zuschlag1'].indexOf('Importabfertigung mit XX Zeilen')!=-1 || item['zuschlag1'].indexOf('Lagergebühr')!=-1 || item['zuschlag1'].indexOf('LIMITED QUANTITIES')!=-1 || item['zuschlag1'].indexOf('LITHIUM ION PI965')!=-1 || item['zuschlag1'].indexOf('LITHIUM ION PI966')!=-1 || item['zuschlag1'].indexOf('LITHIUM METAL')!=-1 || item['zuschlag1'].indexOf('NEUTRAL DELIVERY')!=-1 || item['zuschlag1'].indexOf('OVER HANDLED PIECE')!=-1 || item['zuschlag1'].indexOf('OVER SIZED PIECE')!=-1 || item['zuschlag1'].indexOf('OVER WEIGHT PIECE')!=-1 || item['zuschlag1'].indexOf('Post Clearance Modification')!=-1 || item['zuschlag1'].indexOf('PREMIUM 10:30')!=-1 || item['zuschlag1'].indexOf('PREMIUM 12:00')!=-1 || item['zuschlag1'].indexOf('PREMIUM 9:00')!=-1 || item['zuschlag1'].indexOf('REMOTE AREA DELIVERY')!=-1 || item['zuschlag1'].indexOf('REMOTE AREA PICKUP')!=-1 || item['zuschlag1'].indexOf('RESTRICTED DESTINATION')!=-1 || item['zuschlag1'].indexOf('SAMSTAGSZUSTELLUNG')!=-1 || item['zuschlag1'].indexOf('SHIPMENT INSURANCE')!=-1 || item['zuschlag1'].indexOf('Weiterleitung von Zollgut')!=-1){
              for(var j=0,len3=surcharges.length;j<len3;++j){
                if(surcharges[j].spl_surcharge.indexOf(item['zuschlag1'])>-1){
                  var pushzs = {};
                  pushzs.main_trackingnumber = item.trackingnumber;
                  pushzs.main_surcharge_id = surcharges[j].id;
                  pushzs.main_invoice_id = item.main_invoice_id;
                  pushzs.netamount = item.netamount;
                  pushzs.numberofpackets = item.numberofpackets;
                  pushzs.accountnumber = item.accountnumber;
                  pushzs.labeldate = item.labeldate;
                  pushzs.reference1 = item.reference1;
                  pushzs.reference2 = '';
                  pushzs.billoptioncode = '';
                  pushzs.weight_billed = item.weight_billed;
                  pushzs.weight_entered = 0;
                  //pushzs.main_service_id = null;
                  pushzs.receiver_country = item.receiver_country;
                  pushzs.receiver_state = '';
                  pushzs.receiver_postalcode = item.receiver_postalcode;
                  pushzs.receiver_city = item.receiver_city;
                  pushzs.receiver_contact = item.receiver_contact;
                  pushzs.receiver_company = item.receiver_company;
                  zuschlag.push(pushzs);
                  break;
                }
              }*/
            if(item['zuschlag1_name']!='0' || item['zuschlag2_name']!='0' || item['zuschlag3_name']!='0' || item['zuschlag4_name']!='0' || item['zuschlag5_name']!='0' || item['zuschlag6_name']!='0' || item['zuschlag7_name']!='0' || item['zuschlag8_name']!='0' || item['zuschlag9_name']!='0'){
                if(item['zuschlag1_name']!='0'){
                  funcInside(item['zuschlag1_name'],item['zuschlag1_price']);
                }
                if(item['zuschlag2_name']!='0'){
                  funcInside(item['zuschlag2_name'],item['zuschlag2_price']);
                }
                if(item['zuschlag3_name']!='0'){
                  funcInside(item['zuschlag3_name'],item['zuschlag3_price']);
                }
                if(item['zuschlag4_name']!='0'){
                  funcInside(item['zuschlag4_name'],item['zuschlag4_price']);
                }
                if(item['zuschlag5_name']!='0'){
                  funcInside(item['zuschlag5_name'],item['zuschlag5_price']);
                }
                if(item['zuschlag6_name']!='0'){
                  funcInside(item['zuschlag6_name'],item['zuschlag6_price']);
                }
                if(item['zuschlag7_name']!='0'){
                  funcInside(item['zuschlag7_name'],item['zuschlag7_price']);
                }
                if(item['zuschlag8_name']!='0'){
                  funcInside(item['zuschlag8_name'],item['zuschlag8_price']);
                }
                if(item['zuschlag9_name']!='0'){
                  funcInside(item['zuschlag9_name'],item['zuschlag9_price']);
                }
                function funcInside(zsname, zsprice){
                  for(var j=0,len3=surcharges.length;j<len3;++j){
                    if(surcharges[j].spl_surcharge.indexOf(zsname)>-1){
                      var pushzs = {};
                      pushzs.main_trackingnumber = item.trackingnumber;
                      pushzs.main_surcharge_id = surcharges[j].id;
                      pushzs.main_invoice_id = item.main_invoice_id;
                      pushzs.netamount = zsprice;
                      pushzs.numberofpackets = item.numberofpackets;
                      pushzs.accountnumber = item.accountnumber;
                      pushzs.labeldate = item.labeldate;
                      pushzs.reference1 = item.reference1;
                      pushzs.reference2 = '';
                      pushzs.billoptioncode = '';
                      pushzs.weight_billed = item.weight_billed;
                      pushzs.weight_entered = 0;
                      //pushzs.main_service_id = null;
                      pushzs.receiver_country = item.receiver_country;
                      pushzs.receiver_state = '';
                      pushzs.receiver_postalcode = item.receiver_postalcode;
                      pushzs.receiver_city = item.receiver_city;
                      pushzs.receiver_contact = item.receiver_contact;
                      pushzs.receiver_company = item.receiver_company;
                      zuschlag.push(pushzs);
                      break;
                    }
                  }
                }
            }
            //item.tempservice = item.zuschlag1;
            delete item.zuschlag1_price;
            delete item.zuschlag2_price;
            delete item.zuschlag3_price;
            delete item.zuschlag4_price;
            delete item.zuschlag5_price;
            delete item.zuschlag6_price;
            delete item.zuschlag7_price;
            delete item.zuschlag8_price;
            delete item.zuschlag9_price;
            delete item.zuschlag1_name;
            delete item.zuschlag2_name;
            delete item.zuschlag3_name;
            delete item.zuschlag4_name;
            delete item.zuschlag5_name;
            delete item.zuschlag6_name;
            delete item.zuschlag7_name;
            delete item.zuschlag8_name;
            delete item.zuschlag9_name;
            //var item_new = {};
            var item_new = {
              accountnumber: item.accountnumber,
              numberofpackets: item.numberofpackets,
              netamount: item.netamount,
              vatcode: item.vatcode,
              trackingnumber: item.trackingnumber,
              weight_billed: item.weight_billed,
              reference1: item.reference1,
              labeldate: item.labeldate,
              receiver_country: item.receiver_country,
              receiver_postalcode: item.receiver_postalcode,
              receiver_city: item.receiver_city,
              receiver_contact: item.receiver_contact,
              receiver_company: item.receiver_company,
              main_invoice_id: item.main_invoice_id,
              tempservice: item.tempservice
            };
            //console.log(item_new);
            //output2_.push(item);
            output2_.push(item_new);
          }
        }
        callback(null);
      }, function done(){

        //ADDMAUT START
        //console.log(servicesstdexp);
        async.each(output2_, function(shipmentsitems,callback){
          //console.log(shipmentsitems);
          findIfStdOrExp('DHL',servicesstdexp,shipmentsitems, function(err,val){
            //console.log(val);
            if(val===0){
              var mautzs = {};
              mautzs.main_trackingnumber = shipmentsitems.trackingnumber;
              decideMautByCountry(shipmentsitems.receiver_country)==1 ? mautzs.main_surcharge_id = 55 : mautzs.main_surcharge_id = 56;
              //mautzs.main_surcharge_id = surcharges[j].id;
              mautzs.main_invoice_id = shipmentsitems.main_invoice_id;
              mautzs.netamount = 0;
              mautzs.numberofpackets = shipmentsitems.numberofpackets;
              mautzs.accountnumber = shipmentsitems.accountnumber;
              mautzs.labeldate = shipmentsitems.labeldate;
              mautzs.reference1 = shipmentsitems.reference1;
              mautzs.reference2 = '';
              mautzs.billoptioncode = '';
              mautzs.weight_billed = shipmentsitems.weight_billed;
              mautzs.weight_entered = 0;
              mautzs.receiver_country = shipmentsitems.receiver_country;
              mautzs.receiver_state = '';
              mautzs.receiver_postalcode = shipmentsitems.receiver_postalcode;
              mautzs.receiver_city = shipmentsitems.receiver_city;
              mautzs.receiver_contact = shipmentsitems.receiver_contact;
              mautzs.receiver_company = shipmentsitems.receiver_company;
              zuschlag.push(mautzs);
            }
            callback();
          });
        }, function(err){
          if(err) console.log(err);
          db.addShipmentsDHL(output2_, function(err,result){
            if(err){
              callback(new Error(err.message));
              return;
            }
            if(zuschlag.length>0){
              db.addSurcharge(zuschlag);
            }
            callback(null);
          });
          //console.log(zuschlag[2]);
          //console.log(output2_[2]);
          console.log('fin');
        });
      });
    }
  ], function(error){
    if(error){
      console.log('ERR:',error);
      return;
    }
  });
}

function findIfStdOrExp(supplier, services,item,callb){
  var thisis;
  async.eachSeries(services, function iterating (serv,callback){
    if(serv.main_supplier_alpha3.indexOf(supplier)!=-1 && item.tempservice===serv.service){
      //console.log('found');
      async.setImmediate(function(){
        thisis = serv.express;
        callback(null);
      });
    }else{
      callback(null);
    }
  },function done(){
    //console.log(thisis);
    //return thisis;
    if(typeof(thisis)==='undefined'){
      callb(null,-1)
    }else{
      //return thisis;
      callb(null,thisis);
    }
  })
}

function processGLSDE2(output_,invoices_){
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_,function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        db.getCountriesGLS(function(err,result2){
          if(err){
            callback(new Error(err.message));
            return;
          }
          callback(null,result,result2);
        });
      });
    },
    function makeOtherThings(invoicedata,countries,callback){
      var zuschlag = [];
      var zuschlag2 = [];
      async.eachSeries(output_, function iterator(item,callback){
        for(var i=0, len=invoicedata.length;i<len;++i){
          if(invoicedata[i].hasOwnProperty(item.invoiceno)){
            item.main_invoice_id = invoicedata[i][item.invoiceno];
            delete item.invoiceno;
            delete item.invoicedate;
            item.numberofpackets = 1;
            if(item.receiver_country.length!=2){
              for(var k=0, len2=countries.length;k<len2;++k){
                if(countries[k].custom_gls === item.receiver_country){
                  item.receiver_country = countries[k].alpha2;
                }
              }
            }
            for(var j=1; j<9;++j){
              if(item['zuschlag'+j]!='N' && item['zuschlag'+j]!=''){
                //ZUSCHLAG PROCESS
                var pushzs = {};
                pushzs.main_trackingnumber = item.trackingnumber;
                pushzs.main_surcharge_id = j;
                pushzs.main_invoice_id = item.main_invoice_id;

                pushzs.netamount = 0;
                pushzs.numberofpackets = 1;
                pushzs.accountnumber = item.accountnumber;
                pushzs.labeldate = item.labeldate;
                pushzs.reference1 = item.reference1;
                pushzs.reference2 = '';
                pushzs.billoptioncode = '';
                pushzs.weight_billed = item.weight_billed;
                pushzs.weight_entered = 0;
                pushzs.receiver_country = item.receiver_country;
                pushzs.receiver_state = '';
                pushzs.receiver_postalcode = item.receiver_postalcode;
                pushzs.receiver_city = '';
                pushzs.receiver_contact = '';
                pushzs.receiver_company = '';

                zuschlag.push(pushzs);
                delete item['zuschlag'+j];
              }else{
                delete item['zuschlag'+j];
              }
            }

          }
        }
        callback(null);
      },function done(){
        //console.log(output_[5]);
        //console.log(output_.length);
        async.each(output_,function(shipments,callback){
          if((/^..71/).test(shipments.trackingnumber)){
            var nachnahmezs = {};
            nachnahmezs.main_trackingnumber = shipments.trackingnumber;
            nachnahmezs.main_surcharge_id = 65;
            nachnahmezs.main_invoice_id = shipments.main_invoice_id;
            nachnahmezs.netamount =0;
            nachnahmezs.numberofpackets = shipments.numberofpackets;
            nachnahmezs.accountnumber=shipments.accountnumber;
            nachnahmezs.labeldate = shipments.labeldate;
            nachnahmezs.reference1 = shipments.reference1;
            nachnahmezs.reference2 = '';
            nachnahmezs.billoptioncode = '';
            nachnahmezs.weight_billed = shipments.weight_billed;
            nachnahmezs.weight_entered = 0;
            nachnahmezs.receiver_country = shipments.receiver_country;
            nachnahmezs.receiver_state = '';
            nachnahmezs.receiver_postalcode = shipments.receiver_postalcode;
            nachnahmezs.receiver_city = '';
            nachnahmezs.receiver_contact = '';
            nachnahmezs.receiver_company = '';
            zuschlag2.push(nachnahmezs);
          }
          var treibstoffzs = {};
          treibstoffzs.main_trackingnumber = shipments.trackingnumber;
          treibstoffzs.main_surcharge_id = 46;
          treibstoffzs.main_invoice_id = shipments.main_invoice_id;
          treibstoffzs.netamount =0;
          treibstoffzs.numberofpackets = shipments.numberofpackets;
          treibstoffzs.accountnumber=shipments.accountnumber;
          treibstoffzs.labeldate = shipments.labeldate;
          treibstoffzs.reference1 = shipments.reference1;
          treibstoffzs.reference2 = '';
          treibstoffzs.billoptioncode = '';
          treibstoffzs.weight_billed = shipments.weight_billed;
          treibstoffzs.weight_entered = 0;
          treibstoffzs.receiver_country = shipments.receiver_country;
          treibstoffzs.receiver_state = '';
          treibstoffzs.receiver_postalcode = shipments.receiver_postalcode;
          treibstoffzs.receiver_city = '';
          treibstoffzs.receiver_contact = '';
          treibstoffzs.receiver_company = '';
          zuschlag2.push(treibstoffzs);

          //console.log(shipments.receiver_country + '\t' + decideMautByCountry(shipments.receiver_country) + '\r\n');
          //fs.appendFile('output_logger.txt', shipments.receiver_country + '\t' + decideMautByCountry(shipments.receiver_country) + '\r\n',function(err){});
          var mautzs = {};
          mautzs.main_trackingnumber = shipments.trackingnumber;
          decideMautByCountry(shipments.receiver_country)==1 ? mautzs.main_surcharge_id = 51 : mautzs.main_surcharge_id = 52;
          mautzs.main_invoice_id = shipments.main_invoice_id;
          mautzs.netamount =0;
          mautzs.numberofpackets = shipments.numberofpackets;
          mautzs.accountnumber=shipments.accountnumber;
          mautzs.labeldate = shipments.labeldate;
          mautzs.reference1 = shipments.reference1;
          mautzs.reference2 = '';
          mautzs.billoptioncode = '';
          mautzs.weight_billed = shipments.weight_billed;
          mautzs.weight_entered = 0;
          mautzs.receiver_country = shipments.receiver_country;
          mautzs.receiver_state = '';
          mautzs.receiver_postalcode = shipments.receiver_postalcode;
          mautzs.receiver_city = '';
          mautzs.receiver_contact = '';
          mautzs.receiver_company = '';
          zuschlag2.push(mautzs);

          callback();
        },function(err){
          if(err) console.log(err);
          db.addShipmentsGLS(output_, function(err,result){
            if(err){
              callback(new Error(err.message));
              return;
            }
            if(zuschlag.length>0){
              //db.addSurchargeGLS(zuschlag);
              db.addSurcharge(zuschlag);
            }
            if(zuschlag2.length>0){
              db.addSurcharge(zuschlag2);
            }
            callback(null);
          });
        });

      });
    }
  ], function(error){
      if(error){
        console.log('ERR:',error);
        return;
      }
    });
}

function processGLSAT2(output_,invoices_){
  async.waterfall([
    function insertInvoices(callback){
      db.addInvoices(invoices_,function(err,result){
        if(err){
          callback(new Error(err.message));
          return;
        }
        db.getCountriesGLS(function(err,result2){
          if(err){
            callback(new Error(err.message));
            return;
          }
          callback(null,result,result2);
        });
      });
    },
    function makeOtherThings(invoicedata,countries,callback){
      var zuschlag = [];
      var zuschlag2 = [];
      async.eachSeries(output_, function iterator(item,callback){
        for(var i=0, len=invoicedata.length;i<len;++i){
          if(invoicedata[i].hasOwnProperty(item.invoiceno)){
            if(item.receiver_country.length!=2){
              for(var k=0, len2=countries.length;k<len2;++k){
                if(countries[k].custom_gls === item.receiver_country){
                  item.receiver_country = countries[k].alpha2;
                }
              }
            }
            item.main_invoice_id = invoicedata[i][item.invoiceno];
            delete item.invoiceno;
            delete item.invoicedate;
            item.numberofpackets = 1;
            /*if(item['zuschlag1']!='N' && item['zuschlag1']!=''){
              //ZUSCHLAG PROCESS
              var pushzs = {};
              pushzs.main_trackingnumber = item.trackingnumber;
              pushzs.main_surcharge_id = 1;
              pushzs.main_invoice_id = item.main_invoice_id;
              zuschlag.push(pushzs);
              delete item['zuschlag1'];
            }else{
              delete item['zuschlag1'];
            }*/
            if(item['zuschlag2']!=''){
              if(item['zuschlag2'].indexOf('2')!=-1){
                var pushzs = {};
                pushzs.main_trackingnumber = item.trackingnumber;
                pushzs.main_surcharge_id = 3;
                pushzs.main_invoice_id = item.main_invoice_id;
                pushzs.netamount = 0;
                pushzs.numberofpackets = 1;
                pushzs.accountnumber = item.accountnumber;
                pushzs.labeldate=item.labeldate;
                pushzs.reference1 = item.reference1;
                pushzs.reference2 = '';
                pushzs.billoptioncode = '';
                pushzs.weight_billed = item.weight_billed;
                pushzs.weight_entered = 0;
                pushzs.receiver_country = item.receiver_country;
                pushzs.receiver_state = '';
                pushzs.receiver_postalcode = item.receiver_postalcode;
                pushzs.receiver_city = item.receiver_city;
                pushzs.receiver_contact = item.receiver_contact;
                pushzs.receiver_company = '';
                zuschlag2.push(pushzs);
              }
            }
            delete item['zuschlag1'];
            delete item['zuschlag2'];

          }
        }
        callback(null);
      },function done(){
        //console.log(output_[10]);
        async.each(output_,function(shipments,callback){
          if((/^..71/).test(shipments.trackingnumber)){
            var nachnahmezs = {};
            nachnahmezs.main_trackingnumber = shipments.trackingnumber;
            nachnahmezs.main_surcharge_id = 65;
            nachnahmezs.main_invoice_id = shipments.main_invoice_id;
            nachnahmezs.netamount = 0;
            nachnahmezs.numberofpackets = shipments.numberofpackets;
            nachnahmezs.accountnumber = shipments.accountnumber;
            nachnahmezs.labeldate=shipments.labeldate;
            nachnahmezs.reference1 = shipments.reference1;
            nachnahmezs.reference2 = '';
            nachnahmezs.billoptioncode = '';
            nachnahmezs.weight_billed = shipments.weight_billed;
            nachnahmezs.weight_entered = 0;
            nachnahmezs.receiver_country = shipments.receiver_country;
            nachnahmezs.receiver_state = '';
            nachnahmezs.receiver_postalcode = shipments.receiver_postalcode;
            nachnahmezs.receiver_city = shipments.receiver_city;
            nachnahmezs.receiver_contact = shipments.receiver_contact;
            nachnahmezs.receiver_company = '';
            zuschlag2.push(nachnahmezs);
          }

          var treibstoffzs = {};
          treibstoffzs.main_trackingnumber = shipments.trackingnumber;
          treibstoffzs.main_surcharge_id = 47;
          treibstoffzs.main_invoice_id = shipments.main_invoice_id;
          treibstoffzs.netamount = 0;
          treibstoffzs.numberofpackets = shipments.numberofpackets;
          treibstoffzs.accountnumber = shipments.accountnumber;
          treibstoffzs.labeldate=shipments.labeldate;
          treibstoffzs.reference1 = shipments.reference1;
          treibstoffzs.reference2 = '';
          treibstoffzs.billoptioncode = '';
          treibstoffzs.weight_billed = shipments.weight_billed;
          treibstoffzs.weight_entered = 0;
          treibstoffzs.receiver_country = shipments.receiver_country;
          treibstoffzs.receiver_state = '';
          treibstoffzs.receiver_postalcode = shipments.receiver_postalcode;
          treibstoffzs.receiver_city = shipments.receiver_city;
          treibstoffzs.receiver_contact = shipments.receiver_contact;
          treibstoffzs.receiver_company = '';
          zuschlag2.push(treibstoffzs);

          var mautzs = {};
          mautzs.main_trackingnumber = shipments.trackingnumber;
          decideMautByCountry(shipments.receiver_country)==1 ? mautzs.main_surcharge_id = 53 : mautzs.main_surcharge_id = 54;
          //mautzs.main_surcharge_id = 47;
          mautzs.main_invoice_id = shipments.main_invoice_id;
          mautzs.netamount = 0;
          mautzs.numberofpackets = shipments.numberofpackets;
          mautzs.accountnumber = shipments.accountnumber;
          mautzs.labeldate=shipments.labeldate;
          mautzs.reference1 = shipments.reference1;
          mautzs.reference2 = '';
          mautzs.billoptioncode = '';
          mautzs.weight_billed = shipments.weight_billed;
          mautzs.weight_entered = 0;
          mautzs.receiver_country = shipments.receiver_country;
          mautzs.receiver_state = '';
          mautzs.receiver_postalcode = shipments.receiver_postalcode;
          mautzs.receiver_city = shipments.receiver_city;
          mautzs.receiver_contact = shipments.receiver_contact;
          mautzs.receiver_company = '';
          zuschlag2.push(mautzs);

          //decideMautByCountry(shipments.receiver_country)==1 ? mautzs.main_surcharge_id = 51 : mautzs.main_surcharge_id = 52;
          callback();
        },function(err){
          if(err) console.log(err);
            db.addShipmentsGLS(output_, function(err,result){
              if(err){
                callback(new Error(err.message));
                return;
              }
              if(zuschlag.length>0){
                db.addSurchargeGLS(zuschlag);
              }
              if(zuschlag2.length>0){
                db.addSurcharge(zuschlag2);
              }
              callback(null);
            });
        });
      });
    }
  ], function(error){
      if(error){
        console.log('ERR:',error);
        return;
      }
    });
}


function decideMautByCountry(country){
  var ATDE = ['DE','BE','NL','LU','GB','MC','FR','DK','SE','IE','PT','ES','NO','CH','AD','FI'];
  var AT = ['AT','CZ','PL','SK','SI','HR','BG','EE','LV','LT','RO','HU','GR','IT','MT','RS'];
  if(ATDE.indexOf(country)!==-1){
    return 1;
  }else if(AT.indexOf(country)!==-1){
    return 0;
  }else{
    //SOHA NEM KÉNE
    return -1;
  }
}

  /*console.log(supplier);
  console.log('blogic triggered: ' + filename);
  var output = [];
  var invoices = {};

  var csvparser = csv.parse(csvParserOptions);
  var stream = fs.createReadStream(path.join('./tmp',filename),{encoding:'utf-8'});
  var rowCount = 0;
  var transformer = csv.transform(function(data){
    delete data.empty;
    data.weight_billed = data.weight_billed/10;
    data.netamount = data.netamount/100;
    checkPush(invoices,data.invoiceno,data.invoicedate);*/
    /*return data.map(function(value, index, array){
      return value.toUpperCase();
    });*/
    /*return data;
  });
  transformer.on('readable', function(){
    while(row = transformer.read()){
      output.push(row);
    }
  });
  transformer.on('error', function(err){
    console.log(err.message);
  });
  transformer.on('finish', function(){
    var a = 1;
    processGLSDE(output,invoices);
    console.log(invoices);
  });
  stream.pipe(csvparser).pipe(transformer);*/
  /*var transformer = csv.transform(function(record,callback){
    setTimeout(function(){
      callback(null, record.join(' ')+'\n');
    },500);
  }, {paralell:10});*/
  //stream.pipe(csvparser).pipe(transformer).pipe(process.stdout);
  /*csvparser.on('readable', function(){
    while(record=csvparser.read()){
      console.log(record);
    }
  });
  csvparser.on('error', function(err){
    console.log(err.message);
  });


  csvparser.end();*/
