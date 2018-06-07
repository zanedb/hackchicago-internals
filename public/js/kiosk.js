// TODO
// 1. remove QR code display (use API call that uploads all data, then generate QR codes server-side (firebase))
// 2. add link to view/hide attendee preview and then add upload button (uploads attendees in JSON format to API, which uploads to firebase)

// on load
$(document).ready(function() {
  fetch('/api/attendees')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      if(json.error == "No attendees found") {
        // no attendees available
        $('#status').text('No attendees available, add some below:');
        $('#add').show();
      }
    });
});

function toggle(element) {
  $(element).toggle();
  
  if (element == '#qrcode') {
    if ($(element).css('display') == 'none')
      $('#toggleQR').html('Show QR Code');
    else
      $('#toggleQR').html('Hide QR Code');
  }
  if (element == '#output') {
    if ($(element).css('display') == 'none')
      $('#toggleOutput').html('Show Output');
    else
      $('#toggleOutput').html('Hide Output');
  }
}

var master = [];

function parse() {
  var x = document.getElementById("roster");
  var txt = "";
  if ('files' in x) {
    if (x.files.length == 0) {
      txt = "Select one or more files.";
    } else {
      for (var i = 0; i < x.files.length; i++) {
        CSV.fetch({
          file: x.files[i]
        }).done(function(dataset) {
          master = dataset.records;
          display(master);
        });
      }
    }
  }
}

// encode text to hex
String.prototype.hexEncode = function(){
  var hex, i;
  var result = "";
  for (i=0; i<this.length; i++) {
    hex = this.charCodeAt(i).toString(16);
    result += ("000"+hex).slice(-4);
  }

  return result;
}

function display(data) {
  let txt = '';
  for (var i = 0; i < data.length; i++) {
    txt += data[i][1] + " - " + data[i][2] + " - " + data[i][3] + "&emsp;<br/><br/>";
  }

  $("#output").html(txt);
}


function generateHex(id) {
  return ("hackchicago2018" + "/" + master[id][1] + "/" + master[id][2] + "/" + master[id][3]).toUpperCase().hexEncode();
}
