// decode
String.prototype.hexDecode = function() {
  var j;
  var hexes = this.match(/.{1,4}/g) || [];
  var back = "";
  for (j = 0; j < hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return back;
}

function parse() {
  var x = document.getElementById("qr");
  if ('files' in x) {
    if (x.files.length == 0) {} else {
      for (var i = 0; i < x.files.length; i++) {
        QCodeDecoder()
          .decodeFromImage(x.files[i], function(er, res) {
            console.log(res);
          });
      }
    }
  }
}
