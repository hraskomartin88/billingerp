var db = require('../config/mysql');
/*
 * GET home page.
 */

exports.index = function(req,res){
  res.render('index');
}

exports.getinvoices = function(req, res){
  var i =0;
  db.getInvoices(function(err,result){
    if(err){
      console.log(err);
      return;
    }
    i++
    console.log(result);
    console.log(i);
    //res.write(result);
  });
  //res.render('index');
};

exports.partials = function (req, res) {
  var data = req.params.data;
  res.render('partials/' + name);
};