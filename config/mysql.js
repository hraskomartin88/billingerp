var mysql = require('mysql');

var globalConf = require('./config'),
  globalconf = new globalConf();

var pool = mysql.createPool(globalconf.connectionPropSql);

function bulkinsertcalculatedprice(price_data){
  var finalarr = [];
  for(var i=0,len=price_data.length;i<len;++i){
    var temparr = Object.keys(price_data[i]).map(function(k){return price_data[i][k]});
    finalarr.push(temparr.slice(0));
  }
  return finalarr;
}

exports.getStatistics1 = function(data, callback){
  var cmd = "SELECT IFNULL(SUM(md.netamount),0) as shipmentEK, IFNULL((SUM(mcp.pricevk)+SUM(mcp.priceht)),0) as shipmentVK, count(*) as shipmentNR from main_data md left join main_calculated_price mcp on mcp.main_data_id=md.id where md.main_customer_id like '"+data.customer+"' and (md.labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"');";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getStatistics2 = function(data, callback){
  var cmd = "select IFNULL(count(*),0) as multiNR, IFNULL(SUM(numberofpackets),0) as multipackNR from main_data md left join main_calculated_price mcp on mcp.main_data_id=md.id where md.main_customer_id like '"+data.customer+"' and (md.labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"') and md.numberofpackets>1;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getStatistics3 = function(data, callback){
  var cmd = "select IFNULL(SUM(mds.netamount),0) as surchargeEK, IFNULL((SUM(mcs.pricevk)+SUM(mcs.priceht)),0) as surchargeVK from main_data_surcharge mds left join main_calculated_surcharge mcs on mcs.main_data_surcharge_id=mds.id where mds.main_customer_id like '"+data.customer+"' and (mds.labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"');";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getStatistics4 = function(data, which, callback){
  //1 - darabszám
  //2 - súly
  if(which==1){
    var cmd = "SELECT * FROM (SELECT labeldate,SUM(CASE WHEN mi.main_supplier_id=1 THEN 1 ELSE 0 END) AS 'GLSDE',SUM(CASE WHEN mi.main_supplier_id=2 THEN 1 ELSE 0 END) AS 'GLSAT',SUM(CASE WHEN mi.main_supplier_id=3 THEN 1 ELSE 0 END) AS 'DHL',SUM(CASE WHEN mi.main_supplier_id=4 THEN 1 ELSE 0 END) AS 'UPSAT',SUM(CASE WHEN mi.main_supplier_id=5 THEN 1 ELSE 0 END) AS 'UPSDE',SUM(CASE WHEN mi.main_supplier_id=6 THEN 1 ELSE 0 END) AS 'UPSHU',SUM(CASE WHEN mi.main_supplier_id=7 THEN 1 ELSE 0 END) AS 'POST'FROM main_data as md LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id WHERE labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"' and main_customer_id like '"+data.customer+"' GROUP BY labeldate) sub ORDER BY labeldate ASC;";
  }else if(which==2){
    var cmd = "SELECT * FROM (SELECT labeldate,SUM(CASE WHEN mi.main_supplier_id=1 THEN weight_billed ELSE 0 END) AS 'GLSDE',SUM(CASE WHEN mi.main_supplier_id=2 THEN weight_billed ELSE 0 END) AS 'GLSAT',SUM(CASE WHEN mi.main_supplier_id=3 THEN weight_billed ELSE 0 END) AS 'DHL',SUM(CASE WHEN mi.main_supplier_id=4 THEN weight_billed ELSE 0 END) AS 'UPSAT',SUM(CASE WHEN mi.main_supplier_id=5 THEN weight_billed ELSE 0 END) AS 'UPSDE',SUM(CASE WHEN mi.main_supplier_id=6 THEN weight_billed ELSE 0 END) AS 'UPSHU',SUM(CASE WHEN mi.main_supplier_id=7 THEN weight_billed ELSE 0 END) AS 'POST'FROM main_data as md LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id WHERE labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"' and main_customer_id like '"+data.customer+"' GROUP BY labeldate) sub ORDER BY labeldate ASC;";
  }
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.getStatistics5 = function(data, callback){
  var cmd = "select (case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem,count(*) as y from main_data left join main_country as mc on mc.alpha2 = receiver_country WHERE labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"' and main_customer_id like '"+data.customer+"' GROUP BY eu_mem;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.getStatistics6 = function(data, callback){
  var cmd = "SELECT md.receiver_country,ms.name,(case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem,count(*) as y FROM main_data AS md LEFT JOIN main_country AS mc ON mc.alpha2 = receiver_country LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id WHERE md.labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"' and md.main_customer_id like '"+data.customer+"' GROUP BY md.receiver_country HAVING eu_mem = 1;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.getStatistics7 = function(data, callback){
  var cmd = "SELECT md.receiver_country,ms.name,(case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem,count(*) as y FROM main_data AS md LEFT JOIN main_country AS mc ON mc.alpha2 = receiver_country LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id WHERE md.labeldate BETWEEN '"+data.fromdate+"' AND '"+data.todate+"' and md.main_customer_id like '"+data.customer+"' GROUP BY md.receiver_country HAVING eu_mem = 0;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    //console.log(cmd);
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      //console.log(result);
      connection.release();
      callback(false,result);
    })
  })
};

exports.getManuallyCountryList = function(callback){
  var cmd = "SELECT alpha2 as id, german_formal as name FROM main_country;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyCustomerList = function(callback){
  var cmd = "SELECT id,name FROM main_customer;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyForwarder = function(callback){
  var cmd = "SELECT id, name FROM manually_forwarder;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null, result);
    });
  });
};

exports.getManFuelSurcharge = function(custid, datetouse, express, callback){
  //console.log(express);
  if(express == '1'){
    //console.log('express');
    var cmd = "SELECT IFNULL(MIN(exp), '-1.00') as custprice FROM customer_fuelsurcharge WHERE main_customer_id = '"+custid+"'; SELECT exp as globprice FROM main_fuelsurcharge WHERE DATE(fueldate)=DATE('"+datetouse+"');";
  }else{
    //console.log('standard');
    var cmd = "SELECT IFNULL(MIN(std), '-1.00') as custprice FROM customer_fuelsurcharge WHERE main_customer_id = '"+custid+"'; SELECT std as globprice FROM main_fuelsurcharge WHERE DATE(fueldate)=DATE('"+datetouse+"');";
  }
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getManuallyServices = function(callback){
  var cmd = "SELECT id, name FROM manually_service;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallySurcharges = function(callback){
  var cmd = "SELECT id, name FROM manually_surcharge;";
  pool.getConnection(function(err,connection){
    if(err) return console.log(err);

    connection.query(cmd, function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.setManuallyData = function(datatoins, callback){
  var cmd = "INSERT INTO manually_data SET ?;";
  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd,[datatoins], function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.setManuallySurcharge = function(datatoins, callback){
  var cmd = "INSERT INTO manually_data_surcharge SET ?;";
  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd,[datatoins], function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyVAT = function(callback){
  var cmd = "SELECT vm.id, CONCAT(vm.origin, '-',vm.destination) as name, vm.main_vat_code,vc.percentage FROM vat_matrix AS vm LEFT JOIN vat_code AS vc on vm.main_vat_code=vc.code;";
  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd,function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.addManuallyInvoice = function(data, callback){
  //console.log(data);
  var cmd = "INSERT INTO manually_invoice ( invoiceno, status, manually_supplier_id, date, datetarget) SELECT * FROM (SELECT '"+data.invoiceno+"', 0, '"+data.supplierid+"', '"+data.dateins+"' as a,'"+data.datetoinv+"' as b) AS tmp WHERE NOT EXISTS ( SELECT invoiceno FROM manually_invoice WHERE invoiceno='"+data.invoiceno+"') LIMIT 1;";
  //console.log(cmd);
  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyInvoiceDisplay = function(callback){
  var cmd = "SELECT mi.id, mi.invoiceno, mi.status, ms.name as supplier, YEAR(mi.datetarget) as yeartouse, MONTHNAME(mi.datetarget) as monthtouse, mi.datetarget as datedisp FROM manually_invoice as mi LEFT JOIN manually_forwarder as ms on mi.manually_supplier_id = ms.id;";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyInvoicesCount = function(callback){
  var cmd = "SELECT ttl.main_invoice_nr,SUM(ttl.shipmentscount) as shipmentscount, SUM(ttl.surchargescount) AS surchargescount FROM (SELECT md.id,md.main_invoice_nr,count(*) AS shipmentscount,0 as surchargescount FROM manually_data AS md GROUP BY md.main_invoice_nr UNION SELECT mds.id,mds.main_invoice_nr, 0, count(*) AS surhcargescount FROM manually_data_surcharge AS mds GROUP BY mds.main_invoice_nr) AS ttl GROUP BY ttl.main_invoice_nr";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, function(err, result){
      if (err) return console.log(err);
      connection.release();
      callback(null ,result);
    });
  });
};

exports.getManShpmnt = function(idtouse, callback){
  var cmd ="SELECT md.id,md.trackingnumber,md.numberofpackets, md.labeldate, md.weight, ms.name as nameservice,mc.name as namecustomer, md.manually_ek, md.manually_vk FROM manually_data as md LEFT JOIN manually_service as ms on ms.id=md.manually_service_id LEFT JOIN main_customer as mc on mc.id = md.main_customer_id WHERE md.main_invoice_nr = (SELECT mi.invoiceno FROM manually_invoice AS mi WHERE mi.id = ?)";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, [idtouse], function(err, result){
      if (err) return console.log(err);
      connection.release();
      callback(null, result);
    });
  });
};

exports.delManShpmnt = function(idtodel, callback){
  var cmd = "DELETE FROM manually_data WHERE id = ?";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, [idtodel], function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManSrchg = function(idtouse, callback){
  var cmd ="SELECT mds.id, mds.trackingnumber, mds.labeldate,ms.name as namesurcharge, mc.name as namecustomer, mds.manually_ek, mds.manually_vk FROM manually_data_surcharge as mds LEFT JOIN manually_surcharge as ms on ms.id = mds.manually_surcharge_id LEFT JOIN main_customer as mc on mc.id = mds.main_customer_id WHERE mds.main_invoice_nr = (SELECT mi.invoiceno FROM manually_invoice AS mi WHERE mi.id=?)";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, [idtouse], function(err, result){
      if (err) return console.log(err);
      connection.release();
      callback(null, result);
    });
  });
};

exports.delManSrchg = function(idtodel, callback){
  var cmd = "DELETE FROM manually_data_surcharge WHERE id = ?";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, [idtodel], function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.setManInvClosed = function(idtoset, callback){
  var cmd = "UPDATE manually_invoice SET status=1 WHERE id=?;";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, [idtoset], function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null,result);
    });
  });
};

exports.delManInv = function(invid, callback){
  var cmd = "DELETE FROM manually_invoice WHERE id = ?;";

  pool.getConnection(function(err,connection){
    if (err) return console.log(err);

    connection.query(cmd, [invid], function(err,result){
      if (err) return console.log(err);
      connection.release();
      callback(null, result);
    });
  });
};

exports.addCalculatedPrice = function(pricearr, callback){
  var cmd = "INSERT INTO main_calculated_price (main_data_id,pricevk,priceht) VALUES ? ON DUPLICATE KEY UPDATE priceht=VALUES(priceht), pricevk=VALUES(pricevk);";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd,[bulkinsertcalculatedprice(pricearr)],function(err,result){
      if(err){
        console.log(err);
        console.log(cmd);
        console.log('_____');
        console.log(pricearr);
        console.log('______');
        console.log('itt');
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

exports.addCalculatedSurcharge = function(pricearr, callback){
  var cmd = "INSERT INTO main_calculated_surcharge (main_data_surcharge_id,main_surcharge_id,pricevk,priceht) VALUES ? ON DUPLICATE KEY UPDATE priceht=VALUES(priceht), pricevk=VALUES(pricevk);";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd,[bulkinsertcalculatedprice(pricearr)],function(err,result){
      if(err){
        console.log(err);
        console.log('vagy itt');
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

exports.getPrivateSurchargeSettings = function(callback){
  var cmd = "SELECT * FROM main_privatesurcharge ORDER BY dateofadd DESC LIMIT 1;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getCodSurchargeSettings = function(callback){
  var cmd = "SELECT * FROM main_codsurcharge ORDER BY dateofadd DESC LIMIT 1;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getMautSurchargeGlob = function(callback){
  var cmd = "SELECT * FROM main_mautsurcharge ORDER BY dateofadd DESC LIMIT 1;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getMautSurchargeForCalc = function(custid,callback){
  var cmd = "SELECT IFNULL(MIN(at),'-1.00') as at,IFNULL(MIN(atde),'-1.00')as atde FROM customer_mautsurcharge WHERE main_customer_id = '"+custid+"'; SELECT at,atde FROM main_mautsurcharge ORDER BY dateofadd DESC LIMIT 1;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(cmd);
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getPrivateSurchargeCalc = function(custid,callback){
  var cmd = "SELECT IFNULL(MIN(priceprivate),'-1.00') as priceprivate FROM customer_privatesurcharge WHERE main_customer_id= '"+custid+"'; SELECT priceprivate FROM main_privatesurcharge ORDER BY dateofadd DESC LIMIT 1;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(cmd);
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getCodSurchargeCalc = function(custid,callback){
  var cmd = "SELECT IFNULL(MIN(at),'-1.00') as at,IFNULL(MIN(de),'-1.00')as de, IFNULL(MIN(internat), '-1.00') as internat FROM customer_codsurcharge WHERE main_customer_id = '"+custid+"'; SELECT at,de,internat FROM main_codsurcharge ORDER BY dateofadd DESC LIMIT 1;"
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(cmd);
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getFuelSurcharge = function(custid,invid,express,callback){
  if(express){
    var cmd = "SELECT IFNULL(MIN(exp),'-1.00') as custprice FROM customer_fuelsurcharge WHERE main_customer_id = '"+custid+"'; SELECT exp as globprice FROM main_fuelsurcharge WHERE DATE(fueldate)=(SELECT DATE(datetarget) from main_invoice where id = '"+invid+"');"
  }else{
    var cmd = "SELECT IFNULL(MIN(std),'-1.00') as custprice FROM customer_fuelsurcharge WHERE main_customer_id = '"+custid+"'; SELECT std as globprice FROM main_fuelsurcharge WHERE DATE(fueldate)=(SELECT DATE(datetarget) from main_invoice where id = '"+invid+"');"
  }
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(cmd);
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getFuelSurcharge2 = function(custid,callback){
  var cmd = "SELECT * FROM customer_fuelsurcharge WHERE main_customer_id = '"+custid+"';";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getFuelSurchargeHistory = function(callback){
  var cmd = "SELECT fueldate,std,exp FROM main_fuelsurcharge ORDER BY fueldate DESC LIMIT 3;";
  pool.getConnection(function(err,connection){
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.addFuelSurcharge = function(data, callback){
  var cmd = "INSERT INTO main_fuelsurcharge SET ?;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,[data],function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.getMautSurchargeCust = function(custid,callback){
  var cmd = "SELECT * FROM customer_mautsurcharge WHERE main_customer_id='"+custid+"';";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.getPrivateSurchargeCust = function(custid,callback){
  var cmd = "SELECT * FROM customer_privatesurcharge WHERE main_customer_id='"+custid+"';";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.getCodSurchargeCust = function(custid,callback){
  var cmd = "SELECT * FROM customer_codsurcharge WHERE main_customer_id='"+custid+"';";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.addPrivateSurchargeSettings = function(data,callback){
  var cmd = "INSERT INTO main_privatesurcharge SET ?;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,[data],function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.addMautSurchargeGlob = function(data, callback){
  var cmd = "INSERT INTO main_mautsurcharge SET ?;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,[data],function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.addCodSurchargeGlob = function(data,callback){
  var cmd = "INSERT INTO main_codsurcharge SET ?;";
  pool.getConnection(function(err,connection){
    connection.query(cmd, [data],function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.saveGlobalFuel = function(data,callback){
  //"INSERT INTO main_calculated_price (main_data_id,pricevk,priceht) VALUES ? ON DUPLICATE KEY UPDATE priceht=VALUES(priceht), pricevk=VALUES(pricevk);";
  //var cmd = "INSERT INTO customer_fuelsurcharge (main_customer_id,std,exp) VALUES ? ON DUPLICATE KEY UPDATE std=VALUES(std), exp=VALUES(exp);";
  var cmd = "insert into customer_fuelsurcharge (main_customer_id,std,exp) VALUES ("+data.main_customer_id+","+data.std+","+data.exp+") ON duplicate key update std=VALUES(std),exp=VALUES(exp)";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.addPrivateSurchargeCust = function(data,callback){
  var cmd = "INSERT INTO customer_privatesurcharge (main_customer_id,priceprivate) VALUES("+data.main_customer_id+","+data.priceprivate+") ON DUPLICATE KEY UPDATE priceprivate=VALUES(priceprivate);";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.addCodSurchargeCust = function(data,callback){
  console.log(data);
  var cmd = "INSERT INTO customer_codsurcharge (main_customer_id,at,de,internat) VALUES("+data.main_customer_id+","+data.at+","+data.de+","+data.internat+") ON DUPLICATE KEY UPDATE at=VALUES(at),de=VALUES(de),internat=VALUES(internat);";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.addMautSurchargeCust = function(data,callback){
  var cmd = "INSERT INTO customer_mautsurcharge (main_customer_id,at,atde) VALUES("+data.main_customer_id+","+data.at+","+data.atde+") ON DUPLICATE KEY UPDATE at=VALUES(at),atde=VALUES(atde);";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getSurchargePowerQuery=function(invid,callback){
  var cmd = "SELECT mds.id as main_data_surcharge_id, mds.main_trackingnumber, mds.main_surcharge_id, IFNULL(IF(mcp.pricevk='0',mcp.priceht,mcp.pricevk),0) AS price, IF(mcp.pricevk='0',1,0) as vkorht, mds.receiver_country,mds.main_customer_id,ms.express FROM main_data_surcharge AS mds LEFT JOIN main_data AS md ON md.trackingnumber=mds.main_trackingnumber LEFT JOIN main_calculated_price AS mcp ON mcp.main_data_id = md.id LEFT JOIN main_service AS ms ON ms.id=md.main_service_id WHERE mds.main_invoice_id=?";
  pool.getConnection(function(err,connection){
    connection.query(cmd,[invid],function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.getChartMain = function(which,callback){
  if(which==1){
    var cmd = "SELECT * FROM (SELECT labeldate,SUM(CASE WHEN mi.main_supplier_id=1 THEN 1 ELSE 0 END) AS 'GLSDE',SUM(CASE WHEN mi.main_supplier_id=2 THEN 1 ELSE 0 END) AS 'GLSAT',SUM(CASE WHEN mi.main_supplier_id=3 THEN 1 ELSE 0 END) AS 'DHL',SUM(CASE WHEN mi.main_supplier_id=4 THEN 1 ELSE 0 END) AS 'UPSAT',SUM(CASE WHEN mi.main_supplier_id=5 THEN 1 ELSE 0 END) AS 'UPSDE',SUM(CASE WHEN mi.main_supplier_id=6 THEN 1 ELSE 0 END) AS 'UPSHU',SUM(CASE WHEN mi.main_supplier_id=7 THEN 1 ELSE 0 END) AS 'POST'FROM main_data as md LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id GROUP BY labeldate ORDER BY labeldate DESC LIMIT 60) sub ORDER BY labeldate ASC;";
  }else if(which==2){
    var cmd = "SELECT * FROM (SELECT labeldate,SUM(CASE WHEN mi.main_supplier_id=1 THEN weight_billed ELSE 0 END) AS 'GLSDE',SUM(CASE WHEN mi.main_supplier_id=2 THEN weight_billed ELSE 0 END) AS 'GLSAT',SUM(CASE WHEN mi.main_supplier_id=3 THEN weight_billed ELSE 0 END) AS 'DHL',SUM(CASE WHEN mi.main_supplier_id=4 THEN weight_billed ELSE 0 END) AS 'UPSAT',SUM(CASE WHEN mi.main_supplier_id=5 THEN weight_billed ELSE 0 END) AS 'UPSDE',SUM(CASE WHEN mi.main_supplier_id=6 THEN weight_billed ELSE 0 END) AS 'UPSHU',SUM(CASE WHEN mi.main_supplier_id=7 THEN weight_billed ELSE 0 END) AS 'POST'FROM main_data as md LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id GROUP BY labeldate ORDER BY labeldate DESC LIMIT 60) sub ORDER BY labeldate ASC;";
  }
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.getEuCountries = function(callback){
  var cmd = "SELECT alpha2 FROM main_country WHERE eu_member like '1';";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getEuNonEuDonut = function(callback){
  var cmd = "select (case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem,count(*) as y from main_data left join main_country as mc on mc.alpha2 = receiver_country GROUP BY eu_mem;";
  pool.getConnection(function(err,connection){
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.getEuCountryDonut = function(callback){
  var cmd = "SELECT md.receiver_country,ms.name,(case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem,count(*) as y FROM main_data AS md LEFT JOIN main_country AS mc ON mc.alpha2 = receiver_country LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id GROUP BY md.receiver_country HAVING eu_mem = 1;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.getNonEuCountryDonut = function(callback){
  var cmd = "SELECT md.receiver_country,ms.name,(case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem,count(*) as y FROM main_data AS md LEFT JOIN main_country AS mc ON mc.alpha2 = receiver_country LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id GROUP BY md.receiver_country HAVING eu_mem = 0;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.getEuSupplierDonut = function(callback){
  var cmd = "SELECT *,count(*) as y FROM (SELECT md.receiver_country,ms.name,(case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem FROM main_data AS md LEFT JOIN main_country AS mc ON mc.alpha2 = receiver_country LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id) as ende WHERE eu_mem=1 GROUP BY name;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.getNonEuSupplierDonut = function(callback){
  var cmd = "SELECT *,count(*) as y FROM (SELECT md.receiver_country,ms.name,(case when receiver_country='z1' then 1 else if(mc.eu_member = 1,1,0) END) as eu_mem FROM main_data AS md LEFT JOIN main_country AS mc ON mc.alpha2 = receiver_country LEFT JOIN main_invoice AS mi ON md.main_invoice_id = mi.id LEFT JOIN main_supplier AS ms ON mi.main_supplier_id = ms.id) as ende WHERE eu_mem=0 GROUP BY name;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
};

exports.setMainServiceId= function(what,where,callback){
  var cmd = "UPDATE main_data SET main_service_id='"+what+"' WHERE id = '"+where+"';"
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.copyCountryToSurchargeWhereNincs = function(invid,callback){
  var cmd = "UPDATE main_data_surcharge INNER JOIN main_data ON main_data_surcharge.main_trackingnumber=main_data.trackingnumber SET main_data_surcharge.receiver_country = main_data.receiver_country WHERE main_data_surcharge.receiver_country = '' AND main_data_surcharge.main_invoice_id = "+invid+";";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getVkHtTablesList = function(callback){
  var cmd = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE (table_name LIKE 'vk_%' OR table_name LIKE 'ht_%') and table_schema = 'plutus';";
    pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getSelectedInvoiceData = function(invid, callback){
  //var cmd = "SELECT * FROM main_data WHERE main_invoice_id ="+invid+";";
  //var cmd = "SELECT main_data.*,main_supplier.alpha3,main_supplier.id as alpha3_id FROM main_data LEFT JOIN main_invoice on main_invoice_id = main_invoice.id LEFT JOIN main_supplier on main_supplier_id = main_supplier.id WHERE main_invoice_id = "+invid+";";
  var cmd = "SELECT main_data.*,main_supplier.alpha3,main_supplier.id as alpha3_id, main_customer.weightenteredbit FROM main_data LEFT JOIN main_invoice on main_invoice_id = main_invoice.id LEFT JOIN main_supplier on main_supplier_id = main_supplier.id LEFT JOIN main_customer on main_customer.id = main_data.main_customer_id WHERE main_invoice_id = "+invid+";";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getSelectedInvoiceSurcharge = function(invid,callback){
  var cmd = "SELECT main_data_surcharge.*,main_data.main_customer_id FROM main_data_surcharge LEFT JOIN main_data ON main_trackingnumber=main_data.trackingnumber WHERE main_data_surcharge.main_invoice_id=?;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,[invid],function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.powerNetQueryPst = function(zone,table,weight,callback){
  //console.log(zone, table, weight)
  var cmd = "SELECT "+zone+" FROM "+table+" WHERE kg >= '"+weight+"' ORDER BY kg LIMIT 1;";
  //console.log(cmd);
  pool.getConnection(function(err,connection){
    connection.query(cmd, function(err,result){
      if(err){
        //console.log(cmd);
        callback(err);
        return;
      }
      connection.release();
      callback(null, result[0][zone]);
    })
  })
}

exports.powerQueryPST = function(zone,table,weight,callback){
  var cmd = "SELECT "+zone+" FROM "+table+" WHERE weight >= '"+weight+"' ORDER BY weight LIMIT 1;";
  //console.log(cmd);
  pool.getConnection(function(err,connection){
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.powerQuery = function(country,table,weight,callback){
  var cmd1 = "SELECT "+table+" FROM main_customer_zone LEFT JOIN main_country on main_country_id=main_country.id WHERE main_country.alpha2='"+country+"';";
  pool.getConnection(function(err,connection){
    connection.query(cmd1,function(err,result){
      if(err){
        console.log(country + '-' + table + '-' + weight+ '-pwrqry');
        callback(err);
        return;
      }
      /*console.log(country);
      console.log(table);
      console.log(weight);
      console.log(result[0]);*/
      /*console.log(country + '|' + weight);
      console.log(result[0]);
      console.log('_________');*/
      //console.log(result[0][table]==null);
      if(result[0][table]==null){
        //console.log('ERROR(powerquery no zone): ' + country + ' | ' + table + '|' + weight);
        callback('ERROR(powerquery no zone): ' + country + ' | ' + table + ' | ' + weight);
        connection.release();
      }else{
        var cmd2 = "SELECT z"+result[0][table]+" FROM "+table+" WHERE weight >= '"+weight+"' ORDER BY weight LIMIT 1;";
        connection.query(cmd2,function(err,result2){
          //console.log(result2.length);
          if(err){
            callback(err);
            return;
          }
          //console.log(result2);
          //console.log('___');
          if(result2.length==0){
            var cmd3 = "SELECT min(weight) as perkg,z"+result[0][table]+" FROM "+table+";SELECT max(weight) as maxkg, z"+result[0][table]+" FROM "+table+" WHERE weight = (SELECT max(weight) FROM "+table+");";
            //var cmd3 ="SELECT z"+result[0][table]+" FROM "+table+" WHERE weight = max(weight);"
            //console.log(cmd3);
            connection.query(cmd3,function(err,result3){
              if(err){
                callback(err);
                return;
              }
              //console.log(result3);
              //console.log(weight);
              //console.log('___');
              if(result3[0][0].perkg!==-0.5 && result3[0][0].perkg!==-1){
                console.log('ERROR(powerquery no perkg price): ' + table);
                callback(null,result2);
              }else{
                multiPriceCalc(weight,result3[0][0].perkg,result3[1][0].maxkg,result3[0][0]['z'+result[0][table]],result3[1][0]['z'+result[0][table]],function(finprice){
                  var tempfinprice = [{}];
                  tempfinprice[0]['z'+result[0][table]] = finprice.toFixed(2);
                  callback(null,tempfinprice);
                });
              }
              //callback(null,result3);
            });
          }else{
            callback(null,result2);
          }
          connection.release();
        })
      }
    })
  })
}


exports.getDataForVAT = function(invoiceid, callback){
  var cmd = "SELECT md.id,mc.ustidnr,mc.country AS fromcountry,md.receiver_country AS tocountry FROM main_data AS md LEFT JOIN main_customer AS mc ON mc.id = md.main_customer_id WHERE main_invoice_id = ?;SELECT md.id,mc.ustidnr,mc.country AS fromcountry,md.receiver_country AS tocountry FROM main_data_surcharge AS md LEFT JOIN main_customer AS mc ON mc.id = md.main_customer_id WHERE main_invoice_id = ?;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,[invoiceid,invoiceid],function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getVATMatrix = function(callback){
  var cmd ="SELECT origin, destination, description,percentage,main_vat_code FROM vat_matrix as vm LEFT JOIN vat_code AS vc ON vm.main_vat_code = vc.code;";
  pool.getConnection(function(err,connection){
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.updateVATmainprice = function(data,callback){
  var queries = '';
  data.forEach(function(item){
    queries += mysql.format("UPDATE main_calculated_price SET main_vat_code = ?,origdest = ? WHERE main_data_id = ?;",[item.main_vat_code,item.origdest,item.id]);
  });
  pool.getConnection(function(err,connection){
    connection.query(queries,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback();
    });
  });
};

exports.updateVATmainsurcharge = function(data,callback){
  var queries = '';
  data.forEach(function(item){
    queries += mysql.format("UPDATE main_calculated_surcharge SET main_vat_code = ?,origdest = ? WHERE main_data_surcharge_id = ?;",[item.main_vat_code,item.origdest,item.id]);
  });
  pool.getConnection(function(err,connection){
    connection.query(queries,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback();
    });
  });
};

function multiPriceCalc(weight,perkg,maxkg,z21,z22,callback){
  var absperkg = Math.abs(perkg);
  var weightdiff = parseFloat(weight)-parseFloat(maxkg);
  if(absperkg === 1){
    weightdiff = Math.ceil(weightdiff);
  }else{
    weightdiff = Math.ceil(weightdiff*2)/2;
  }
  var calulatedprice = parseFloat(((weightdiff/absperkg)*z21)+z22);
  //console.log('finalprice: ' + calulatedprice.toFixed(2));
  callback(calulatedprice);
};

//OLD
exports.createPriceTables = function(customerid,callback){
  pool.getConnection(function(err,connection){
    var cmd = "CREATE TABLE `vk_exp_"+customerid+"` (`weight` decimal(4,2) NOT NULL DEFAULT '0.00',`z1` decimal(4,2) DEFAULT NULL,`z2` decimal(4,2) DEFAULT NULL,`z3` decimal(4,2) DEFAULT NULL,PRIMARY KEY (`weight`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;CREATE TABLE `vk_stdsingle_"+customerid+"` (`weight` decimal(4,2) NOT NULL DEFAULT '0.00',`z1` decimal(4,2) DEFAULT NULL,`z2` decimal(4,2) DEFAULT NULL,`z3` decimal(4,2) DEFAULT NULL,PRIMARY KEY (`weight`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;CREATE TABLE `vk_stdmulti_"+customerid+"` (`weight` decimal(4,2) NOT NULL DEFAULT '0.00',`z1` decimal(4,2) DEFAULT NULL,`z2` decimal(4,2) DEFAULT NULL,`z3` decimal(4,2) DEFAULT NULL,PRIMARY KEY (`weight`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;ALTER TABLE main_customer_zone ADD `vk_exp_"+customerid+"` TINYINT(2);ALTER TABLE main_customer_zone ADD `vk_stdsingle_"+customerid+"` TINYINT(2);ALTER TABLE main_customer_zone ADD `vk_stdmulti_"+customerid+"` TINYINT(2);"
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

function zonenrtoquery(zonenr){
  var zonequeryarr = [];
  for(var i=1;i<=zonenr;++i){
    zonequeryarr.push("`z"+i+"` decimal(9,2) DEFAULT NULL");
  }
  //console.log(zonequeryarr.join(","));
  return zonequeryarr.join(",");
}

exports.createPriceTable = function(tablename,zonenr,callback){
  pool.getConnection(function(err,connection){
    var cmd = "CREATE TABLE `"+tablename+"` (`weight` decimal(9,2) NOT NULL DEFAULT '0.00',"+zonenrtoquery(zonenr)+",PRIMARY KEY (`weight`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;ALTER TABLE main_customer_zone ADD `"+tablename+"` TINYINT(2);";
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      callback(false,result);
    })
  });
}

//OLD
exports.getSpecificCustomerZone = function(customerid, callback){
  pool.getConnection(function(err,connection){
  //var cmd = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='main_customer_zone' AND table_schema = 'plutus' AND column_name LIKE 'cust_"+customerid+"_%'; " ;
  //var cmd = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE table_name LIKE 'vk_%_"+customerid+"_%' and table_schema = 'plutus'";

  //'^vk_[a-z]*_"+customerid+"$'
  var cmd = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE table_name REGEXP '^vk_[a-z]*_"+customerid+"(_)?[0-9]?$' and table_schema = 'plutus'";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      if(result.length==0){
        connection.query
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getVkTablesName = function(customerid, callback){
  pool.getConnection(function(err,connection){
  var cmd = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE table_name REGEXP '^vk_"+customerid+"_[0-9]*$' and table_schema = 'plutus'";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      if(result.length==0){
        connection.query
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.deletePrice = function(tblname,callback){
  pool.getConnection(function(err,connection){
    var cmd = "DROP TABLE `"+tblname+"`; ALTER TABLE main_customer_zone DROP COLUMN `"+tblname+"`;";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
};

exports.getZoneAndPrice = function(customer,callback){
  //console.log(customer);
  var stringq = customer.join();
  //console.log(customer);
  pool.getConnection(function(err,connection){
  var cmd = "SELECT alpha2,mc.german_formal,"+customer+" FROM main_customer_zone AS mz LEFT JOIN main_country AS mc ON mz.main_country_id=mc.id ORDER By mc.german_formal ASC";
    connection.query(cmd,function(err,result){
      if(err){
        //console.log("ITT");
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getSurcharge = function(customer,callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT * FROM main_surcharge_price as msp LEFT JOIN main_surcharge as ms on msp.main_surcharge_id= ms.id WHERE msp.main_customer_id = ?";
    //var cmd = "SELECT * FROM main_surcharge AS ms LEFT JOIN main_surcharge_price AS msp ON ms.id= msp.main_surcharge_id WHERE msp.main_customer_id=? OR msp.main_customer_id IS NULL";
    var cmd = "SELECT ms.id AS main_surcharge_id, ms.sxs_surcharge, ms.spl_surcharge, msp.main_customer_id, msp.price FROM main_surcharge AS ms LEFT JOIN main_surcharge_price AS msp ON ms.id= msp.main_surcharge_id WHERE msp.main_customer_id=? OR msp.main_customer_id IS NULL";
    connection.query(cmd, [customer], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getSurchargeList = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT * from main_surcharge;";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

function bulkinsertsurcharge(surarr){
  var insupdtstr = [];
  for(var i=0,len=surarr.length;i<len;++i){
    insupdtstr.push("INSERT INTO main_surcharge_price (main_surcharge_id, main_customer_id, price) VALUES("+surarr[i].main_surcharge_id+", "+surarr[i].main_customer_id+", "+surarr[i].price+") ON DUPLICATE KEY UPDATE price="+surarr[i].price);
  }
  return insupdtstr;
}

exports.setSurcharge = function(surchargearr,callback){
  pool.getConnection(function(err,connection){
    var cmd = bulkinsertsurcharge(surchargearr).join(';');
    //console.log(cmd);
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

function bulkinsertzones(ob2,ob1){
  var updatearr = [];
  for(var i=0,len=ob2.length;i<len;++i){
      var tmpstr="";
      var liltmpstrarr = [];
      for(var j=0,len2=ob1.length;j<len2;++j){
          if(ob2[i].hasOwnProperty(ob1[j])){
              var liltmpstr = "";
              if(ob2[i][ob1[j]]===null || ob2[i][ob1[j]]===""){
                  liltmpstr = ob1[j]+" = NULL";
              }else{
                  liltmpstr = ob1[j]+" = "+ob2[i][ob1[j]];
              }
              liltmpstrarr.push(liltmpstr);
          }
      }
      if(ob2[i].hasOwnProperty('alpha2')){
        updatearr.push("UPDATE main_customer_zone INNER JOIN main_country ON ('"+ob2[i].alpha2+"' = main_country.alpha2) SET "+liltmpstrarr.join(',')+" WHERE main_country_id = main_country.id");
      }
  }
  return updatearr;
}

exports.setZone = function(zones,services,callback){
  //console.log(bulkinsertzones(zones,services).length);
  //callback(200);
  pool.getConnection(function(err,connection){

    //update main_customer_zone INNER JOIN main_country ON ('AT' = main_country.alpha2) SET vk_exp_1 = '4' WHERE main_country_id = main_country.id
    var cmd = bulkinsertzones(zones,services).join(';');
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

function bulkinsertinvoices(ob){
  return "('"+ob.date+"','"+ob.invoiceno + "','"+ob.status + "','"+ob.main_supplier_id + "','"+ob.datetarget + "')";
}

exports.addInvoices = function(invoicedata, callback){
  //console.log('mysql:', invoicedata);
  //callback(null, invoicedata);
  var query = "INSERT INTO main_invoice (date,invoiceno,status,main_supplier_id,datetarget) VALUES ";
  var valuearr = [];
  for(var i =0, len=invoicedata.length;i<len;++i){
    valuearr.push(bulkinsertinvoices(invoicedata[i]));
  }
  query+=valuearr.join(',');
  //console.log(query);
  pool.getConnection(function(err,connection){
    //var cmd = "INSERT INTO main_invoice SET ?";
    connection.query(query, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      //console.log(result);
      if(invoicedata.length === result.affectedRows){
        var sendthis = [];
        var insertidtouse = result.insertId;
        for(var j=0,len2=invoicedata.length;j<len2;++j){
          //invoicedata[j].id = insertidtouse;
          var thistopush = {};
          thistopush[invoicedata[j].invoiceno] = insertidtouse;
          //sendthis[j] = {invoicedata[j].invoiceno:insertidtouse};
          sendthis.push(thistopush);
          insertidtouse++;
        }
        //console.log('mysql2: ', invoicedata);
        callback(null,sendthis);
      }
    });
  });
}

function bulkinsertsurcharge_gls(ob){
  return "('"+ob.main_trackingnumber+"','"+ob.main_surcharge_id + "','"+ob.main_invoice_id + "')";
}

exports.addSurchargeGLS = function(surchargedata){
  var query = "SET GLOBAL max_allowed_packet=16777216;INSERT INTO main_data_surcharge (main_trackingnumber, main_surcharge_id, main_invoice_id) VALUES ";
  var valuearr = [];
  for(var i=0,len=surchargedata.length;i<len;++i){
    valuearr.push(bulkinsertsurcharge_gls(surchargedata[i]));
  }
  query+=valuearr.join(',');

  pool.getConnection(function(err,connection){
    connection.query(query, function(err,result){
      if(err){
        //callback(err);
        console.log(err);
        return;
      }
      connection.release();
    });
  });
}

function bulkinsertsurcharge(ob){
  //return "('"+ob.main_trackingnumber+"','"+ob.main_surcharge_id+"','"+ob.main_invoice_id+"','"+ob.netamount+"')";
  return "('"+ob.main_trackingnumber+"','"+ob.numberofpackets+"','"+ob.accountnumber+"','"+ob.main_invoice_id+"','"+ob.labeldate+"','"+ob.reference1+"','"+ob.reference2+"','"+ob.billoptioncode+"','"+ob.weight_billed+"','"+ob.weight_entered+"','"+ob.receiver_country+"','"+ob.receiver_state+"','"+ob.receiver_postalcode+"','"+ob.receiver_city+"','"+ob.receiver_contact+"','"+ob.receiver_company+"','"+ob.netamount+"','"+ob.main_surcharge_id+"')";
}

exports.addSurcharge = function(surchargedata){
  var query = "SET GLOBAL max_allowed_packet=16777216;INSERT INTO main_data_surcharge (main_trackingnumber, main_surcharge_id, main_invoice_id, netamount, numberofpackets, accountnumber, labeldate, reference1, reference2, billoptioncode, weight_billed, weight_entered, receiver_country, receiver_state, receiver_postalcode, receiver_city, receiver_contact, receiver_company) VALUES ?";
  var valuearr = [];
  pool.getConnection(function(err,connection){
    connection.query(query, [bulkinsertshipments_ups(surchargedata)], function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
    })
  })
}

/*exports.addSurcharge = function(surchargedata){
  //console.log(surchargedata);
  //var query = "INSERT INTO main_data_surcharge (main_trackingnumber, numberofpackets, accountnumber, main_invoice_id, labeldate, reference1, reference2, billoptioncode, weight_billed, weight_entered, receiver_country, receiver_state, receiver_postalcode, receiver_city, receiver_contact, receiver_company, netamount, main_surcharge_id) VALUES ?";
  //var query = "INSERT INTO main_data_surcharge (main_trackingnumber, main_surcharge_id, main_invoice_id, netamount) VALUES";
  var query = "INSERT INTO main_data_surcharge (main_trackingnumber, numberofpackets, accountnumber, main_invoice_id, labeldate, reference1, reference2, billoptioncode, weight_billed, weight_entered, receiver_country, receiver_state, receiver_postalcode, receiver_city, receiver_contact, receiver_company, netamount, main_surcharge_id) VALUES";
  var valuearr = [];
  for(var i=0,len=surchargedata.length;i<len;++i){
    valuearr.push(bulkinsertsurcharge(surchargedata[i]));
  }
  query+=valuearr.join(',');
  pool.getConnection(function(err,connection){
    connection.query(query, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
    })
  })
}*/

function bulkinsertshipments_gls(ob){
  return "('"+ob.accountnumber+"','"+ob.trackingnumber+"','"+ob.labeldate+"','"+ob.receiver_country+"','"+ob.receiver_postalcode+"','"+ob.weight_billed+"','"+ob.netamount+"','"+ob.reference1+"','"+ob.main_invoice_id+"','"+ob.numberofpackets+"','"+ob.tempservice+"')";
}

exports.addShipmentsGLS = function(shipmentsdata,callback){
  var query = "SET GLOBAL max_allowed_packet=16777216;INSERT INTO main_data (accountnumber,trackingnumber,labeldate,receiver_country,receiver_postalcode,weight_billed,netamount,reference1,main_invoice_id,numberofpackets,tempservice) VALUES ";
  var valuearr = [];
  for(var i=0,len=shipmentsdata.length;i<len;++i){
    valuearr.push(bulkinsertshipments_gls(shipmentsdata[i]));
  }
  query += valuearr.join(',');
  pool.getConnection(function(err,connection){
    if(err){
      //callback(err);
      console.log(err);
      return;
    }
    connection.query(query, function(err,result){
      if(err){
        //callback(err);
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

function bulkinsertshipments_dhl_old(ob){
  return "('"+ob.accountnumber+"', '"+ob.numberofpackets+"', '"+ob.netamount+"', '"+ob.vatcode+"', '"+ob.trackingnumber+"', '"+ob.weight_billed+"', '"+ob.reference1+"', '"+ob.labeldate+"', '"+ob.receiver_country+"', '"+ob.receiver_postalcode+"', '"+ob.receiver_city+"', '"+ob.receiver_contact+"', '"+ob.receiver_company+"', '"+ob.main_invoice_id+"')";
  //return "("+ob.accountnumber+", "+ob.numberofpackets+", "+ob.netamount+", "+ob.vatcode+", "+ob.trackingnumber+", "+ob.weight_billed+", "+ob.reference1+", "+ob.labeldate+", "+ob.receiver_country+", "+ob.receiver_postalcode+", "+ob.receiver_city+", "+ob.receiver_contact+", "+ob.receiver_company+", "+ob.main_invoice_id+")";
}

function bulkinsertshipments_dhl(shpmnt_data){
  var finalarr = [];

  for(var i=0, len=shpmnt_data.length;i<len;++i){
    var temparr = Object.keys(shpmnt_data[i]).map(function(k) { return shpmnt_data[i][k] });
    finalarr.push(temparr.slice(0));
  }

  return finalarr;
}

exports.addShipmentsDHL = function(shipmentsdata,callback){
  var query = "INSERT INTO main_data (accountnumber, numberofpackets, netamount, vatcode, trackingnumber, weight_billed, reference1,labeldate,receiver_country,receiver_postalcode,receiver_city,receiver_contact,receiver_company, main_invoice_id,tempservice) VALUES ?";
  var valuearr = [];
  /*console.log(shipmentsdata);
  for(var i=0,len=shipmentsdata.length;i<len;++i){
    valuearr.push(bulkinsertshipments_dhl(shipmentsdata[i]));
  }*/
  //console.log(bulkinsertvol2(shipmentsdata));
  //console.log(query);
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    //query +=valuearr.join(',');
    //console.log(query);
    connection.query(query,[bulkinsertshipments_dhl(shipmentsdata)],function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

function bulkinsertshipments_ups(shpmnt_data){
  var finalarr = [];
  for(var i=0,len=shpmnt_data.length;i<len;++i){
    var temparr = Object.keys(shpmnt_data[i]).map(function(k){return shpmnt_data[i][k]});
    finalarr.push(temparr.slice(0));
  }
  return finalarr;
}

exports.addShipmentsUPS = function(shipmentsdata,callback){
  var query = "SET GLOBAL max_allowed_packet=16777216; INSERT INTO main_data(accountnumber,labeldate,trackingnumber,reference1,reference2,billoptioncode,numberofpackets,weight_entered,weight_billed,tempservice,netamount,receiver_contact,receiver_company,receiver_city,receiver_state,receiver_postalcode,receiver_country,main_invoice_id) VALUES ?";
  var valuearr = [];

  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(query,[bulkinsertshipments_ups(shipmentsdata)],function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

exports.addShipmentsPST = function(shipmentsdata,callback){
  //console.log(shipmentsdata);
  var query = "INSERT INTO main_data(labeldate,trackingnumber,reference1,reference2,tempservice,receiver_postalcode,weight_billed,accountnumber,numberofpackets, main_invoice_id,receiver_country,netamount) VALUES ?;";
  var valuearr = [];

  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(query,[bulkinsertshipments_ups(shipmentsdata)],function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

exports.deleteInvoice = function(invid,callback){
  pool.getConnection(function(err,connection){
    var cmd = "DELETE FROM main_invoice WHERE id = ?;";
    connection.query(cmd,[invid],function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getCountriesGLS = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT alpha2, custom_gls FROM main_country WHERE custom_gls IS NOT NULL;";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.getCountriesDHL = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT alpha2, custom_dhl FROM main_country WHERE custom_dhl IS NOT NULL;";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.getInvoices = function(callback){
  pool.getConnection(function(err,connection){
    if(err) console.log(err);
    //var cmd = "SELECT * FROM invoicetable ORDER BY invoicedate DESC; SELECT a.invoiceno, (SELECT COUNT(b.invoiceno) FROM maintable AS b WHERE custid='0' AND b.invoiceno = a.invoiceno) AS count FROM maintable AS a GROUP BY a.invoiceno; SELECT a.invoiceno, (SELECT COUNT(b.invoiceno) FROM maintable AS b WHERE custid!='0' AND b.invoiceno = a.invoiceno) AS count FROM maintable AS a GROUP BY a.invoiceno;";
    //NEW
    //var cmd = "SELECT * FROM main_invoice ORDER BY date DESC; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a GROUP BY a.main_invoice_id; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a GROUP BY a.main_invoice_id;";
    //var cmd = "SELECT  mi.id, mi.invoiceno,mi.status, mi.date,YEAR(mi.datetarget) as upyear, MONTHNAME(mi.datetarget) as upmonth,ms.name FROM main_invoice AS mi LEFT JOIN main_supplier ms on mi.main_supplier_id=ms.id ORDER BY date DESC; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a GROUP BY a.main_invoice_id; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a GROUP BY a.main_invoice_id;SELECT YEAR(DATETARGET) as invyear,MONTHNAME(DATETARGET) as invmonth FROM main_invoice group by YEAR(datetarget),MONTH(datetarget) DESC LIMIT 0,3;SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data_surcharge AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data_surcharge AS a GROUP BY a.main_invoice_id;SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data_surcharge AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data_surcharge AS a GROUP BY a.main_invoice_id;";
    var cmd1 = "SET @rank=0;";
    //var cmd = "SELECT  mi.id, mi.invoiceno,mi.status, mi.date,YEAR(mi.datetarget) as upyear, MONTHNAME(mi.datetarget) as upmonth,ms.name FROM main_invoice AS mi LEFT JOIN main_supplier ms on mi.main_supplier_id=ms.id ORDER BY date DESC; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a GROUP BY a.main_invoice_id; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a GROUP BY a.main_invoice_id; SELECT invyear,invmonth FROM (SELECT @rank:=@rank+1 AS rank, YEAR(DATETARGET) as invyear,MONTHNAME(DATETARGET) as invmonth FROM main_invoice group by YEAR(datetarget),MONTH(datetarget) order by rank desc LIMIT 0,5) as tot;SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data_surcharge AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data_surcharge AS a GROUP BY a.main_invoice_id;SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data_surcharge AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data_surcharge AS a GROUP BY a.main_invoice_id;";
    var cmd2 = "SET @lastinvid := (SELECT id FROM main_invoice ORDER BY id DESC LIMIT 0,1);";
    var cmd = "SELECT  mi.id, mi.invoiceno,mi.status, mi.date,YEAR(mi.datetarget) as upyear, MONTHNAME(mi.datetarget) as upmonth,ms.name FROM main_invoice AS mi LEFT JOIN main_supplier ms on mi.main_supplier_id=ms.id ORDER BY date DESC; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a WHERE a.main_invoice_id>@lastinvid-100 GROUP BY a.main_invoice_id; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data AS a WHERE a.main_invoice_id>@lastinvid-100 GROUP BY a.main_invoice_id; SELECT invyear,invmonth FROM (SELECT @rank:=@rank+1 AS rank, YEAR(DATETARGET) as invyear,MONTHNAME(DATETARGET) as invmonth FROM main_invoice group by YEAR(datetarget),MONTH(datetarget) order by rank desc LIMIT 0,2) as tot; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data_surcharge AS b WHERE main_customer_id IS NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data_surcharge AS a WHERE a.main_invoice_id>@lastinvid-100 GROUP BY a.main_invoice_id; SELECT a.main_invoice_id, (SELECT COUNT(b.main_invoice_id) FROM main_data_surcharge AS b WHERE main_customer_id IS NOT NULL AND b.main_invoice_id = a.main_invoice_id) AS count FROM main_data_surcharge AS a WHERE a.main_invoice_id>@lastinvid-100 GROUP BY a.main_invoice_id;";
    connection.query(cmd1);
    connection.query(cmd2);
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getInvoiceUploadDate =function(callback){
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
    }
    //var query = "SELECT YEAR(DATETARGET) as invyear,MONTHNAME(DATETARGET) as invmonth FROM main_invoice WHERE YEAR(DATETARGET) = YEAR(CURDATE()) group by YEAR(datetarget),MONTH(datetarget) DESC LIMIT 0,3;";
    //var query = "SELECT YEAR(DATETARGET) as invyear,MONTHNAME(DATETARGET) as invmonth FROM main_invoice group by YEAR(datetarget),MONTH(datetarget) DESC;";
    var cmd = "SET @rank=0;";
    var query = "SELECT invyear,invmonth FROM (SELECT @rank:=@rank+1 AS rank, YEAR(DATETARGET) as invyear,MONTHNAME(DATETARGET) as invmonth FROM main_invoice group by YEAR(datetarget),MONTH(datetarget) order by rank desc) as tot;";
    connection.query(cmd);
    connection.query(query,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getCustomerIdForClosedInvoices = function(year,month,callback){
  pool.getConnection(function(err,connection){
    //old bad query
    //var query = "SELECT main_customer_id FROM main_data LEFT JOIN main_invoice ON main_data.main_invoice_id = main_invoice.id WHERE status=1 AND YEAR(main_invoice.datetarget)="+year+" AND MONTHNAME(main_invoice.datetarget)='"+month+"' GROUP BY main_customer_id;";
    //var query = "SELECT mall.main_customer_id FROM (SELECT main_customer_id,main_invoice_id,billed_status FROM main_data AS md UNION ALL SELECT main_customer_id,main_invoice_id,billed_status FROM main_data_surcharge AS mds) as mall LEFT JOIN main_invoice AS mi ON mall.main_invoice_id = mi.id WHERE mi.status =1 AND YEAR(mi.datetarget)="+year+" AND MONTHNAME(mi.datetarget)='"+month+"' AND mall.billed_status = '0' GROUP BY main_customer_id; SELECT md.main_customer_id from manually_data AS md WHERE md.main_invoice_nr IN (SELECT mi.invoiceno from manually_invoice AS mi WHERE YEAR(mi.datetarget)="+year+" AND MONTHNAME(mi.datetarget)='"+month+"') GROUP BY md.main_customer_id;";
    var query = "SELECT mall.main_customer_id FROM (SELECT main_customer_id,main_invoice_id,billed_status FROM main_data AS md WHERE md.billed_status='0' UNION ALL SELECT main_customer_id,main_invoice_id,billed_status FROM main_data_surcharge AS mds WHERE mds.billed_status='0') as mall LEFT JOIN main_invoice AS mi ON mall.main_invoice_id = mi.id WHERE mi.status =1 AND YEAR(mi.datetarget)="+year+" AND MONTHNAME(mi.datetarget)='"+month+"' GROUP BY main_customer_id;SELECT md.main_customer_id from manually_data AS md WHERE md.main_invoice_nr IN (SELECT mi.invoiceno from manually_invoice AS mi WHERE YEAR(mi.datetarget)="+year+" AND MONTHNAME(mi.datetarget)='"+month+"') and md.billed_status='0' GROUP BY md.main_customer_id;";

    connection.query(query, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      //console.log(result);
      callback(false,result);
    });
  })
}

exports.getCustomerClosedShipments = function(custid,year,month,callback){
  pool.getConnection(function(err,connection){
    //var query = "SELECT mcsp.*,main_data.tempservice, main_data.trackingnumber,main_data.numberofpackets,main_data.labeldate,main_data.reference1,main_data.reference2,main_data.weight_billed, main_data.receiver_country, main_data.receiver_postalcode,main_data.receiver_city,main_data.receiver_contact, main_data.receiver_company, main_invoice.datetarget,main_data.netamount as netshpmnt,main_data_surcharge.netamount as netsurchrg FROM (SELECT  mcp.main_data_id,'' as surcharge, mcp.pricevk, mcp.priceht FROM main_calculated_price as mcp UNION ALL SELECT mcs.main_data_id,main_surcharge.spl_surcharge as surcharge,mcs.pricevk,mcs.priceht FROM main_calculated_surcharge as mcs LEFT JOIN main_surcharge on main_surcharge_id=main_surcharge.id) as mcsp LEFT JOIN main_data on main_data.id = mcsp.main_data_id LEFT JOIN main_invoice on main_data.main_invoice_id=main_invoice.id LEFT JOIN main_data_surcharge on main_data.trackingnumber = main_data_surcharge.main_trackingnumber WHERE main_data.main_customer_id like "+custid+" and main_invoice.status = 1 and MONTHNAME(main_invoice.datetarget)='"+month+"' and YEAR(main_invoice.datetarget)="+year+" ORDER BY main_data.labeldate,main_data.trackingnumber,mcsp.surcharge;";
    //var query = "SELECT sus.* FROM (SELECT md.main_invoice_id, md.main_customer_id,md.trackingnumber,md.labeldate,md.reference1,md.reference2,md.weight_billed,md.numberofpackets,md.receiver_country, md.receiver_postalcode, md.receiver_city, md.receiver_contact, md.receiver_company, md.tempservice,md.netamount AS netek,mcp.pricevk AS netvk,mcp.priceht AS netht,mcp.main_vat_code,mcp.origdest FROM main_data AS md LEFT JOIN main_calculated_price AS mcp ON mcp.main_data_id = md.id UNION ALL SELECT mds.main_invoice_id, mds.main_customer_id,mds.main_trackingnumber,mds.labeldate,'','','','',receiver_country,'','','','',IF(LENGTH(ms.sxs_surcharge)>0,ms.sxs_surcharge,ms.spl_surcharge),mds.netamount AS netek, mcs.pricevk AS netvk, mcs.priceht AS netht,mcs.main_vat_code,mcs.origdest FROM main_data_surcharge AS mds LEFT JOIN main_surcharge AS ms ON ms.id = mds.main_surcharge_id LEFT JOIN main_calculated_surcharge AS mcs ON mcs.main_data_surcharge_id = mds.id) AS sus LEFT JOIN main_invoice AS mi ON sus.main_invoice_id=mi.id WHERE sus.main_customer_id="+custid+" AND mi.status=1 AND MONTHNAME(mi.datetarget)='"+month+"' AND YEAR(mi.datetarget)="+year+" ORDER BY sus.labeldate ASC, sus.trackingnumber,sus.netek DESC;"
    //var query = "SELECT sus.*,mi.main_supplier_id, vc.description,vc.percentage FROM (SELECT md.billed_status, md.main_invoice_id, md.main_customer_id,md.trackingnumber,md.labeldate,md.reference1,md.reference2,md.weight_billed,md.numberofpackets,md.receiver_country, md.receiver_postalcode, md.receiver_city, md.receiver_contact, md.receiver_company, md.tempservice,md.netamount AS netek,mcp.pricevk AS netvk,mcp.priceht AS netht,mcp.main_vat_code,mcp.origdest FROM main_data AS md LEFT JOIN main_calculated_price AS mcp ON mcp.main_data_id = md.id UNION ALL SELECT mds.billed_status, mds.main_invoice_id, mds.main_customer_id,mds.main_trackingnumber,mds.labeldate,mds.reference1,mds.reference2,'','',receiver_country,'','','','',IF(LENGTH(ms.sxs_surcharge)>0,ms.sxs_surcharge,ms.spl_surcharge),mds.netamount AS netek, mcs.pricevk AS netvk, mcs.priceht AS netht,mcs.main_vat_code,mcs.origdest FROM main_data_surcharge AS mds LEFT JOIN main_surcharge AS ms ON ms.id = mds.main_surcharge_id LEFT JOIN main_calculated_surcharge AS mcs ON mcs.main_data_surcharge_id = mds.id) AS sus LEFT JOIN vat_code as vc on sus.main_vat_code = vc.code LEFT JOIN main_invoice AS mi ON sus.main_invoice_id=mi.id WHERE sus.main_customer_id="+custid+" AND mi.status=1 AND MONTHNAME(mi.datetarget)='"+month+"' AND YEAR(mi.datetarget)="+year+" AND sus.billed_status='0' ORDER BY sus.labeldate ASC, sus.trackingnumber,sus.netek DESC;";
    var query = "SELECT sus.*,mi.main_supplier_id, vc.description,vc.percentage FROM (SELECT md.billed_status, md.main_invoice_id, md.main_customer_id,md.trackingnumber,md.labeldate,md.reference1,md.reference2,md.weight_billed,md.weight_entered,md.numberofpackets,md.receiver_country, md.receiver_postalcode, md.receiver_city, md.receiver_contact, md.receiver_company, md.tempservice,md.netamount AS netek,mcp.pricevk AS netvk,mcp.priceht AS netht,mcp.main_vat_code,mcp.origdest FROM main_data AS md LEFT JOIN main_calculated_price AS mcp ON mcp.main_data_id = md.id WHERE md.main_customer_id="+custid+" UNION ALL SELECT mds.billed_status, mds.main_invoice_id, mds.main_customer_id,mds.main_trackingnumber,mds.labeldate,mds.reference1,mds.reference2,'','','',receiver_country,'','','','',IF(LENGTH(ms.sxs_surcharge)>0,ms.sxs_surcharge,ms.spl_surcharge),mds.netamount AS netek, mcs.pricevk AS netvk, mcs.priceht AS netht,mcs.main_vat_code,mcs.origdest FROM main_data_surcharge AS mds LEFT JOIN main_surcharge AS ms ON ms.id = mds.main_surcharge_id LEFT JOIN main_calculated_surcharge AS mcs ON mcs.main_data_surcharge_id = mds.id WHERE mds.main_customer_id="+custid+") AS sus LEFT JOIN vat_code as vc on sus.main_vat_code = vc.code LEFT JOIN main_invoice AS mi ON sus.main_invoice_id=mi.id WHERE sus.main_customer_id="+custid+" AND mi.status=1 AND MONTHNAME(mi.datetarget)='"+month+"' AND YEAR(mi.datetarget)="+year+" AND sus.billed_status='0' ORDER BY sus.labeldate ASC, sus.trackingnumber,sus.netek DESC;";

    query += "SELECT unall.*,mf.name as supplier, vc.percentage, vc.code FROM (SELECT 1 as SortKey, md.labeldate, md.reference1,md.trackingnumber, md.manually_forwarder_id, md.main_customer_id, md.numberofpackets, ms.name as service, CONCAT(COALESCE(md.shipper_name1,''), ' ',COALESCE(md.shipper_name2,'')) as shippername, md.shipper_country, CONCAT(COALESCE(md.receiver_name1,''),' ',COALESCE(md.receiver_name2,'')) as receivername, md.receiver_country, md.weight,md.manually_ek,md.manually_vk,md.main_invoice_nr, vat FROM manually_data as md LEFT JOIN manually_service as ms on ms.id = md.manually_service_id UNION ALL SELECT 2 as SortKey, mds.labeldate, mds.reference1, mds.trackingnumber, mds.manually_forwarder_id,mds.main_customer_id,'',msur.name,'',mds.shipper_country,'', mds.receiver_country, '',mds.manually_ek, mds.manually_vk,mds.main_invoice_nr, vat FROM manually_data_surcharge as mds LEFT JOIN manually_surcharge as msur on msur.id = mds.manually_surcharge_id) as unall LEFT JOIN manually_forwarder as mf on mf.id=unall.manually_forwarder_id LEFT JOIN manually_invoice as mi on mi.invoiceno = unall.main_invoice_nr LEFT JOIN vat_matrix as vm on vm.id=unall.vat LEFT JOIN vat_code as vc on vm.main_vat_code=vc.code WHERE unall.main_customer_id="+custid+" AND MONTHNAME(mi.datetarget) = '"+month+"' AND YEAR(mi.datetarget)="+year+" ORDER BY unall.labeldate ASC, SortKey;";
    connection.query(query, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getCustomerClosedShipmentsUid = function(uid,callback){
  pool.getConnection(function(err,connection){
    var query = "SELECT sus.*,vc.description,vc.percentage FROM (SELECT md.billed_status, md.main_invoice_id, md.main_customer_id,md.trackingnumber,md.labeldate,md.reference1,md.reference2,md.weight_billed,md.numberofpackets,md.receiver_country, md.receiver_postalcode, md.receiver_city, md.receiver_contact, md.receiver_company, md.tempservice,md.netamount AS netek,mcp.pricevk AS netvk,mcp.priceht AS netht,mcp.main_vat_code,mcp.origdest FROM main_data AS md LEFT JOIN main_calculated_price AS mcp ON mcp.main_data_id = md.id UNION ALL SELECT mds.billed_status, mds.main_invoice_id, mds.main_customer_id,mds.main_trackingnumber,mds.labeldate,'','','','',receiver_country,'','','','',IF(LENGTH(ms.sxs_surcharge)>0,ms.sxs_surcharge,ms.spl_surcharge),mds.netamount AS netek, mcs.pricevk AS netvk, mcs.priceht AS netht,mcs.main_vat_code,mcs.origdest FROM main_data_surcharge AS mds LEFT JOIN main_surcharge AS ms ON ms.id = mds.main_surcharge_id LEFT JOIN main_calculated_surcharge AS mcs ON mcs.main_data_surcharge_id = mds.id) AS sus LEFT JOIN vat_code as vc on sus.main_vat_code = vc.code LEFT JOIN main_invoice AS mi ON sus.main_invoice_id=mi.id WHERE sus.billed_status='"+uid+"' ORDER BY sus.labeldate ASC, sus.trackingnumber,sus.netek DESC;"
    connection.query(query, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.setGetUidMarkAsBilled = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT uid FROM main_billed ORDER BY uid DESC LIMIT 1";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      if(result.length===0 || (result[0].uid.toString().substring(0,4)!=new Date().getFullYear().toString())){
        var str = "" + new Date().getFullYear();
        var pad = '0000000001';
        var ans = str + pad.substring(str.length, pad.length);
        //automatikusan generált számlaszám
        //YYYYCID001
        callback(false,ans);
      }else{
        //van és jó év növelés 1 el
        callback(false, result[0].uid+1);
      }
      connection.release();
      //callback(false,'');
    })
  });
};

exports.getMainBilled = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT mb.*,mc.name,mc.debitoren,mc.ustidnr FROM main_billed as mb LEFT JOIN main_customer AS mc on mb.main_customer_id = mc.id ORDER BY mb.billedon DESC";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
};

exports.addMarkAsBilled = function(data,callback){
  pool.getConnection(function(err,connection){
    var cmd = "INSERT INTO main_billed SET ?";
    connection.query(cmd,[data],function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false);
    })
  })
}

exports.addToDataAndSurchargeBilled = function(data,callback){
  //console.log('________________________');
  //console.log(data);
  if(data.table==1){
    //console.log('data');
    var cmd = "UPDATE main_data SET billed_status='"+data.uid+"' WHERE trackingnumber = '"+data.trackingnumber+"';";
  }else{
    var cmd = "UPDATE main_data_surcharge SET billed_status='"+data.uid+"' WHERE main_trackingnumber = '"+data.trackingnumber+"';";
    //console.log('surcharge');
  }
  pool.getConnection(function(err,connection){
    if(err) console.log(err);
    //callback(false,'ok');
    connection.query(cmd,function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getDetailInvoiceUnid = function(invno, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT MainId, TrackingNumber,AccountNumber,LabelDate,ShipmentReference1,ShipmentReference2 FROM maintable WHERE InvoiceNo LIKE ? AND CustID='0';";
    //NEW
    var cmd = "SELECT id, trackingnumber,accountnumber,labeldate,reference1,reference2 FROM main_data WHERE main_invoice_id LIKE ? AND main_customer_id IS NULL;";
    connection.query(cmd, [invno], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.getDetailInvoiceUnidSur = function(invno, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT MainId, TrackingNumber,AccountNumber,LabelDate,ShipmentReference1,ShipmentReference2 FROM maintable WHERE InvoiceNo LIKE ? AND CustID='0';";
    //NEW
    //var cmd = "SELECT id, main_trackingnumber, labeldate FROM main_data_surcharge WHERE main_invoice_id LIKE ? AND main_customer_id IS NULL;";
    var cmd = "SELECT mds.id, mds.main_trackingnumber, mds.labeldate, ms.spl_surcharge as surcharge FROM main_data_surcharge as mds LEFT JOIN main_surcharge as ms on ms.id= mds.main_surcharge_id WHERE main_invoice_id LIKE ? AND main_customer_id IS NULL;";
    connection.query(cmd, [invno], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.getDetailInvoiceIden = function(invno, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT MainId, TrackingNumber,AccountNumber,LabelDate,ShipmentReference1,ShipmentReference2,CustId FROM maintable WHERE InvoiceNo LIKE ? AND CustId!='0';";
    //var cmd = "SELECT MainId, TrackingNumber,AccountNumber,LabelDate,ShipmentReference1,ShipmentReference2,CustomerName FROM maintable left join customertable on CustId=CustomerID WHERE InvoiceNo LIKE ? AND CustId!='0';";
    //NEW
    var cmd = "SELECT md.id, md.trackingnumber,md.accountnumber,md.labeldate,md.reference1,md.reference2,md.main_customer_id,mc.name FROM main_data AS md LEFT JOIN main_customer AS mc ON md.main_customer_id = mc.id WHERE main_invoice_id LIKE ? AND main_customer_id IS NOT NULL;";
    connection.query(cmd, [invno], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.getDetailInvoiceIdenSur = function(invno, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT MainId, TrackingNumber,AccountNumber,LabelDate,ShipmentReference1,ShipmentReference2,CustId FROM maintable WHERE InvoiceNo LIKE ? AND CustId!='0';";
    //var cmd = "SELECT MainId, TrackingNumber,AccountNumber,LabelDate,ShipmentReference1,ShipmentReference2,CustomerName FROM maintable left join customertable on CustId=CustomerID WHERE InvoiceNo LIKE ? AND CustId!='0';";
    //NEW
    //var cmd = "SELECT md.id, md.main_trackingnumber,md.accountnumber,md.labeldate,md.reference1,md.reference2,md.main_customer_id,mc.name FROM main_data_surcharge AS md LEFT JOIN main_customer AS mc ON md.main_customer_id = mc.id WHERE main_invoice_id LIKE ? AND main_customer_id IS NOT NULL;";
    var cmd = "SELECT md.id, md.main_trackingnumber,md.accountnumber,md.labeldate,md.reference1,md.reference2,md.main_customer_id,ms.spl_surcharge as surcharge,mc.name FROM main_data_surcharge AS md LEFT JOIN main_customer AS mc ON md.main_customer_id = mc.id LEFT JOIN main_surcharge as ms on md.main_surcharge_id=ms.id WHERE main_invoice_id LIKE ? AND main_customer_id IS NOT NULL;";
    connection.query(cmd, [invno], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.getNoCustInvoices = function(invno, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT MainId as id, AccountNumber as accnr, UPPER(ShipmentReference1) as ref1, UPPER(ShipmentReference2) as ref2 FROM maintable WHERE InvoiceNo = ? AND CustID=0"
    //NEW
    var cmd = "SELECT id, accountnumber as accnr, UPPER(reference1) as ref1, UPPER(reference2) as ref2, receiver_country as country FROM main_data WHERE main_invoice_id = ? AND main_customer_id IS NULL"
    connection.query(cmd, [invno], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
      //console.log(result);
    });
  });
}

exports.getNoCustInvoicessur = function(invno, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT MainId as id, AccountNumber as accnr, UPPER(ShipmentReference1) as ref1, UPPER(ShipmentReference2) as ref2 FROM maintable WHERE InvoiceNo = ? AND CustID=0"
    //NEW
    var cmd = "SELECT id, accountnumber as accnr, UPPER(reference1) as ref1, UPPER(reference2) as ref2, receiver_country as country FROM main_data_surcharge WHERE main_invoice_id = ? AND main_customer_id IS NULL"
    connection.query(cmd, [invno], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
      //console.log(result);
    });
  });
}

exports.getPrefixes = function(callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT custid, UPPER(customerreference) as customerreference FROM customerreferencetable"
    //NEW
    var cmd = "SELECT main_customer_id, UPPER(reference) as customerreference FROM main_reference"
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.getAccounts = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT main_customer_id, UPPER(accountnumber) as accnr, main_supplier_id FROM main_customer_account"
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.setFoundCustomers = function(datatoset, callback){
  //console.log(datatoset);
  pool.getConnection(function(err,connection){
    var cmd = "";
    //var cmd = "UPDATE maintable SET "
    datatoset.forEach(function(item){
      //cmd +=mysql.format("UPDATE maintable SET custid = '"+item.custid+"' WHERE mainid = '"+item.mainid+"'; ");
      //NEW
      cmd +=mysql.format("UPDATE main_data SET main_customer_id = '"+item.custid+"' WHERE id = '"+item.mainid+"'; ");
    });
    //console.log(cmd);
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.setFoundCustomerssur = function(datatoset, callback){
  //console.log(datatoset);
  pool.getConnection(function(err,connection){
    var cmd = "";
    //var cmd = "UPDATE maintable SET "
    datatoset.forEach(function(item){
      //cmd +=mysql.format("UPDATE maintable SET custid = '"+item.custid+"' WHERE mainid = '"+item.mainid+"'; ");
      //NEW
      cmd +=mysql.format("UPDATE main_data_surcharge SET main_customer_id = '"+item.custid+"' WHERE id = '"+item.mainid+"'; ");
    });
    //console.log(cmd);
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.setFoundCustomerssurTrack = function(datatoset, callback){
  //console.log(datatoset);
  pool.getConnection(function(err,connection){
    var cmd = "";
    //var cmd = "UPDATE maintable SET "
    datatoset.forEach(function(item){
      //cmd +=mysql.format("UPDATE maintable SET custid = '"+item.custid+"' WHERE mainid = '"+item.mainid+"'; ");
      //NEW
      cmd +=mysql.format("UPDATE main_data_surcharge SET main_customer_id = '"+item.custid+"' WHERE main_trackingnumber = '"+item.tracking+"'; ");
    });
    console.log(cmd);
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

/*exports.updateCustomer = function(datatoset, callback){
  pool.getConnection(function(err,connection){
    var cmd = "";

    datatoset.forEach(function(item){
      cmd += mysql.format("UPDATE maintable SET ")
    })
  });
}*/

exports.getCustomers = function(callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT * FROM customertable;";
    //NEW
    var cmd = "SELECT * FROM main_customer ORDER by name ASC;";
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.addCustomer = function(data, callback){
  pool.getConnection(function(err, connection){
    //var cmd = "INSERT INTO customertable SET ?"
    //NEW
    var cmd = "INSERT INTO main_customer SET ?"
    console.log(cmd, [data]);
    connection.query(cmd, [data], function(err, result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
    //console.log(data);
    //connection.release();
    //callback(false, 'OK');
  })
}

exports.removeCustomer = function(data, callback){
  pool.getConnection(function(err, connection){
    //var cmd = "DELETE FROM customertable WHERE CustomerID = ?"
    //NEW
    var cmd = "DELETE FROM main_customer WHERE id = ?"
    console.log(cmd, [data]);
    connection.query(cmd, [data], function(err, result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.updateCustomer = function(data, callback){
  var id = data.id;
  delete data.id;
  pool.getConnection(function(err, connection){
    //var cmd = "UPDATE customertable SET ? WHERE CustomerID = ?"
    //NEW
    var cmd = "UPDATE main_customer SET ? WHERE id = ?"
    connection.query(cmd, [data, id], function(err, result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.getReference = function(id, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT customerreference, id FROM customerreferencetable where custid = ?;SELECT * FROM customertable where customerid = ? ;";
    //NEW
    var cmd = "SELECT reference, id FROM main_reference where main_customer_id = ?;SELECT * FROM main_customer where id = ? ;SELECT main_customer_account.id, main_customer_id, main_supplier.name, main_customer_account.accountnumber FROM main_customer_account LEFT JOIN main_supplier on main_supplier_id = main_supplier.id WHERE main_customer_id = ?;";
    connection.query(cmd, [id, id, id], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.addReference = function(idref, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "INSERT INTO customerreferencetable SET ?"
    //NEW
    var cmd = "INSERT INTO main_reference SET ?"
    connection.query(cmd, [idref], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.addAccount = function(custacc, callback){
  pool.getConnection(function(err,connection){
    var cmd = "INSERT INTO main_customer_account SET ?"
    connection.query(cmd, [custacc], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.removeReference = function(idref, callback){
  pool.getConnection(function(err,connection){
    //var cmd = "DELETE FROM customerreferencetable WHERE ?"
    //NEW
    var cmd = "DELETE FROM main_reference WHERE ?";
    connection.query(cmd, [idref], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.removeAccount = function(idacc,callback){
  pool.getConnection(function(err,connection){
    var cmd = "DELETE FROM main_customer_account WHERE ?";
    connection.query(cmd, [idacc], function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getSuppliers = function(callback){
  pool.getConnection(function(err,connection){
    //var cmd = "SELECT * FROM suppliertable"
    //NEW
    var cmd = "SELECT * FROM main_supplier";
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getServices = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT * FROM main_service";
    connection.query(cmd, function(err,result){
      if(err){
        cosnole.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.getSplAndService = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT * FROM main_service;SELECT main_supplier_alpha3 FROM main_service GROUP BY main_supplier_alpha3";
    connection.query(cmd, function(err,result){
      if(err){
        cosnole.log(err);
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.setUnsetSelected = function(rowid, callback){
  pool.getConnection(function(err,connection){
    var cmd = "UPDATE main_data SET main_customer_id = NULL WHERE id = ?";
    connection.query(cmd,[rowid], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.setUnsetSelectedSur = function(rowid, callback){
  pool.getConnection(function(err,connection){
    var cmd = "UPDATE main_data_surcharge SET main_customer_id = NULL WHERE main_trackingnumber = ?";
    connection.query(cmd,[rowid], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  });
}

exports.addServiceSupplier = function(tblrowcolname, callback){
  console.log("nem kéne ide futni " + tblrowcolname);
  pool.getConnection(function(err,connection){
    var cmd = "CREATE TABLE `"+tblrowcolname+"` (`weight` decimal(4,2) NOT NULL DEFAULT '0.00',`z1` decimal(4,2) DEFAULT NULL,`z2` decimal(4,2) DEFAULT NULL,`z3` decimal(4,2) DEFAULT NULL,PRIMARY KEY (`weight`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;ALTER TABLE main_customer_zone ADD `"+tblrowcolname+"` TINYINT(2);";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.getPrice = function(ident, callback){
  //console.log('IDENT LENGTH:'+ident.length);
  var queryarr = [];
  for(var i=0,len=ident.length;i<len;++i){
    queryarr.push("SELECT * FROM `"+ident[i]+"`");
  }
  pool.getConnection(function(err,connection){
    //var options = {sql: "SELECT * FROM `"+ident[0]+"`;SELECT * FROM `"+ident[1]+"`", nestTables:true};
    //var options = {sql: "SELECT * FROM `"+ident[0]+"`;"};
    var options = {sql: queryarr.join(';')};
    connection.query(options, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      //delete result[0].ignore;
      if(ident.length===1){
        result = [result];
      }
      callback(false,result);
    });
  })
}

exports.getZoneNumbers = function(tablename, callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT column_name FROM information_schema.columns WHERE table_name='"+tablename+"' AND column_name!='weight';";
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.addPriceZone = function(tblname,newzonenr, callback){
  pool.getConnection(function(err,connection){
    var cmd = "ALTER TABLE `"+tblname+"` ADD COLUMN `z"+newzonenr+"`  decimal(4,2) NULL DEFAULT NULL;"
    //console.log(cmd);
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.removePriceZone = function(tblname,newzonenr, callback){
  pool.getConnection(function(err,connection){
    var cmd = "ALTER TABLE `"+tblname+"` DROP COLUMN `z"+newzonenr+"`;"
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

function bulkinsertpricezone(tbl,data){
  var temparr = [];
  for(var items in data){
    var duplarr = [];
    if(data.hasOwnProperty(items)){
      for(var items2 in data[items]){
        if(data[items].hasOwnProperty(items2)){
          if(items2!='weight'){
            duplarr.push(items2 + "="+data[items][items2]);
          }
        }
      }
      //console.log(duplarr.join);
      temparr.push("INSERT INTO `"+tbl+"` ("+Object.keys(data[items]).join(',')+") VALUES("+Object.keys(data[items]).map(function(_){if(data[items][_]===null)return "null"; else return "'"+data[items][_]+"'";})+") ON DUPLICATE KEY UPDATE "+duplarr.join(',')+"");
    }
  }
  return temparr;
}

exports.setPriceZone = function(tblname,datatoset,callback){
  //console.log(tblname);
  //console.log(datatoset);
  //bulkinsertpricezone(tblname,datatoset);
  pool.getConnection(function(err,connection){
    var cmd = "TRUNCATE TABLE "+tblname+";" + bulkinsertpricezone(tblname,datatoset).join(';');
    console.log(cmd);
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
}

//EXPIRATION
exports.addPriceExpiration = function(thingstoadd,callback){
  pool.getConnection(function(err,connection){
    var cmd = "INSERT INTO main_priceexpiration SET ?";
    connection.query(cmd, [thingstoadd], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getPriceExpiration = function(ident, callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT * FROM main_priceexpiration WHERE table_name=? ORDER BY id DESC LIMIT 0,1";
    connection.query(cmd, [ident], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

exports.getExpirydate = function(customer, callback){
  var customercool = "vk\\_" + customer + "\\_";
  pool.getConnection(function(err,connection){
    var cmd = "SELECT * FROM (SELECT id, table_name, UNIX_TIMESTAMP(dateexpiration) as epoch_time, dateexpiration FROM main_priceexpiration WHERE table_name like '%"+customercool+"%' ORDER BY id desc) x GROUP BY table_name";
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}
//EXPIRATION

exports.getThingsNeedsToBeDone = function(customer, callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT note FROM customer_billingnotes WHERE main_customer_id = '"+customer+"';";
    connection.query(cmd, function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  });
}

//OLD
exports.removeServiceSupplier = function(removewhat, callback){
  pool.getConnection(function(err,connection){
    var cmd = "DROP TABLE `"+removewhat+"`; ALTER TABLE main_customer_zone DROP COLUMN `"+removewhat+"`;";
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getTodoList = function(callback){
  pool.getConnection(function(err,connection){
    var cmd = "SELECT * FROM todo;"
    connection.query(cmd,function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.addTodoList = function(itemtotadd, callback){
  pool.getConnection(function(err,connection){
    var cmd = "INSERT INTO todo SET ?";
    connection.query(cmd, [itemtotadd], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.setClosedTodo=function(itemidtoset, callback){
  pool.getConnection(function(err,connection){
    var cmd = "UPDATE todo SET status=1 WHERE id=?;";
    connection.query(cmd, [itemidtoset], function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    });
  })
}

exports.setInvoiceClosed = function(invid,callback){
  pool.getConnection(function(err,connection){
    var cmd = "UPDATE main_invoice SET status=1 WHERE id=?;";
    connection.query(cmd, [invid],function(err,result){
      if(err){
        callback(err);
        return;
      }
      connection.release();
      callback(false,result);
    })
  })
}

exports.getManuallyccCountryList = function(callback){
  var cmd = "SELECT alpha2 as id, german_formal as name FROM main_country;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyccCustomerList = function(callback){
  var cmd = "SELECT id,name FROM main_customer;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

exports.getManuallyccForwarder = function(callback){
  var cmd = "SELECT id, name FROM manually_forwarder;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null, result);
    });
  });
};

exports.getManuallyccServices = function(callback){
  var cmd = "SELECT id, name FROM manually_service;";
  pool.getConnection(function(err,connection){
    if(err){
      console.log(err);
      return;
    }

    connection.query(cmd, function(err,result){
      if(err){
        console.log(err);
        return;
      }
      connection.release();
      callback(null,result);
    });
  });
};

// NEGATÍV PROFIT NÉLKÜL, SZÁZALÉK > ?
exports.getPositivProfit1 = function (szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio, callback) {
    pool.getConnection(function (err, connection) {
        var cmd = "select md.main_customer_id, md.trackingnumber, md.numberofpackets, md.weight_billed, md.receiver_country, md.tempservice, md.labeldate, md.netamount, mc.pricevk, mc.priceht, mcust.name, mi.datetarget from ((main_data as md left join main_calculated_price as mc on mc.main_data_id=md.id) left join main_customer as mcust on md.main_customer_id = mcust.id) left join main_invoice as mi on md.main_invoice_id = mi.id where (mc.pricevk " + szazalekrelacio + " ( md.netamount +  (md.netamount * '" + szazalek + "'))  OR mc.priceht " + szazalekrelacio + " (md.netamount + (md.netamount * '" + szazalek + "' ))) and (md.netamount " + netamountrelacio + " '" + netamount + "') and (mi.datetarget between '" + fromdatum + "' and '" + todatum + "') and (md.netamount < mc.priceht or md.netamount < mc.pricevk) order by mcust.name LIMIT 1000;";
        connection.query(cmd, [szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            connection.release();
            callback(false, result);
        })
    })
}

//NEGATÍV PROFIT NÉLKÜL, SZÁZALÉK < ?
exports.getPositivProfit2 = function (szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio, callback) {
    pool.getConnection(function (err, connection) {
        var cmd = "select md.main_customer_id, md.trackingnumber, md.numberofpackets, md.weight_billed, md.receiver_country, md.tempservice, md.labeldate, md.netamount, mc.pricevk, mc.priceht, mcust.name, mi.datetarget from ((main_data as md left join main_calculated_price as mc on mc.main_data_id=md.id) left join main_customer as mcust on md.main_customer_id = mcust.id) left join main_invoice as mi on md.main_invoice_id = mi.id where (mc.pricevk " + szazalekrelacio + " ( md.netamount +  (md.netamount * '" + szazalek + "'))  AND mc.priceht " + szazalekrelacio + " (md.netamount + (md.netamount * '" + szazalek + "' ))) and (md.netamount " + netamountrelacio + " '" + netamount + "') and (mi.datetarget between '" + fromdatum + "' and '" + todatum + "') and (md.netamount < mc.priceht or md.netamount < mc.pricevk) order by mcust.name LIMIT 1000;";
        connection.query(cmd, [szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            connection.release();
            callback(false, result);
        })
    })
}

//NEGATÍV PROFITTAL, SZÁZALÉK > ?
exports.getProfit1 = function (szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio, callback) {
    pool.getConnection(function (err, connection) {
        var cmd = "select md.main_customer_id, md.trackingnumber, md.numberofpackets, md.weight_billed, md.receiver_country, md.tempservice, md.labeldate, md.netamount, mc.pricevk, mc.priceht, mcust.name, mi.datetarget from ((main_data as md left join main_calculated_price as mc on mc.main_data_id=md.id) left join main_customer as mcust on md.main_customer_id = mcust.id) left join main_invoice as mi on md.main_invoice_id = mi.id where (mc.pricevk " + szazalekrelacio + " ( md.netamount +  (md.netamount * '" + szazalek + "'))  OR mc.priceht " + szazalekrelacio + " (md.netamount + (md.netamount * '" + szazalek + "' ))) and (md.netamount " + netamountrelacio + " '" + netamount + "') and (mi.datetarget between '" + fromdatum + "' and '" + todatum + "') order by mcust.name LIMIT 1000;";
        connection.query(cmd, [szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            connection.release();
            callback(false, result);
        })
    })
}

//NEGATÍV PROFITTAL, SZÁZALÉK < ?
exports.getProfit2 = function (szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio, callback) {
    pool.getConnection(function (err, connection) {
        var cmd = "select md.main_customer_id, md.trackingnumber, md.numberofpackets, md.weight_billed, md.receiver_country, md.tempservice, md.labeldate, md.netamount, mc.pricevk, mc.priceht, mcust.name, mi.datetarget from ((main_data as md left join main_calculated_price as mc on mc.main_data_id=md.id) left join main_customer as mcust on md.main_customer_id = mcust.id) left join main_invoice as mi on md.main_invoice_id = mi.id where (mc.pricevk " + szazalekrelacio + " ( md.netamount +  (md.netamount * '" + szazalek + "'))  AND mc.priceht " + szazalekrelacio + " (md.netamount + (md.netamount * '" + szazalek + "' ))) and (md.netamount " + netamountrelacio + " '" + netamount + "') and (mi.datetarget between '" + fromdatum + "' and '" + todatum + "') order by mcust.name LIMIT 1000;";
        connection.query(cmd, [szazalek, netamount, fromdatum, todatum, szazalekrelacio, netamountrelacio], function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            connection.release();
            callback(false, result);
        })
    })
}
