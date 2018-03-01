  $.ajax({
    url: '/getinvoices',
    type: 'POST',
    dataType: 'json',
    success: function(responseText, statusText, xhr){
      //console.log(responseText);
    },
    complete: function(data){
      var resultHTML = '';
      $.each(JSON.parse(data.responseText), function(key,value){
        resultHTML += '<tr>';
        for(prop in value){
          if(!value.hasOwnProperty(prop)){
            continue;
          }
          //console.log(prop);
          resultHTML +='<td>'+value[prop]+'</td>';
        }
        resultHTML += '</tr>';
      });
      $('#a').html(resultHTML);
      /*for(obj in data.responseText){
        console.log(obj);
      }*/
      //console.log(typeof(data.responseText));
      /*var resultHTML = '';
      $.each(JSON.parse(data.responseText), function(key,value){
        $.each(key, function(val)){
          resultHTML += '<td>'+val+'</td>';
        }
      });
      console.log(resultHTML);
      $('#a').html(resultHTML);*/
      /*for(obj in JSON.parse(data.responseText)){
        console.log(obj);
      }*/
    },
    error: function(xhr,text,err){
      console.log(err);
    }
  });