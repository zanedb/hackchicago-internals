// TODO
// 1. remove QR code display (use API call that uploads all data, then generate QR codes server-side (firebase))
// 2. add link to view/hide attendee preview and then add upload button (uploads attendees in JSON format to API, which uploads to firebase)
// 3. handle empty attendees db
// 4. add check in functionality
// 5. add option to update user data

// initialize firebase
var config = {
  apiKey: "AIzaSyDEzPcXyHB7_eutmvxMKnDI_Yu5XgRpBoY",
  authDomain: "hackchicago-internals.firebaseapp.com",
  databaseURL: "https://hackchicago-internals.firebaseio.com",
  projectId: "hackchicago-internals",
  storageBucket: "hackchicago-internals.appspot.com",
  messagingSenderId: "264691182006"
};
firebase.initializeApp(config);
// initialize db
const database = firebase.database();

// on load
$(document).ready(function() {
  // check for redirect token
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // get Google Access Token
      let googleAccessToken = result.credential.accessToken;
      console.log('Logged in with email ' + result.user.email + ' and token '+googleAccessToken+'.');
    } else {
      console.log('Logged in with email '+result.user.email+' and no access token.');
    }
    // signed-in user info
    let user = result.user;
  }).catch(function(error) {
    // handle error
    if (error.code === 'auth/account-exists-with-different-credential') {
      alert('You have already signed up with a different auth provider for that email. This error should not occur.');
    } else if (error.code === 'auth/user-disabled') {
      $('#login-error').text('Your account is disabled :/');
    } else if (error.code !== undefined) {
      $('#login-error').text('An error occurred: '+error.code+'.');
    }
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var uid = user.uid;
      var providerData = user.providerData;
      if (email.split('@')[1] !== 'hackchicago.io') {
        $('#login-status').html('Error: Please login with a <u>hackchicago.io</u> email address.<br/><button onclick="toggleSignIn();">Sign Out</button>')
      } else {
        $('#login-status').html('Welcome, <u>'+displayName+'</u>! You\'re logged in as <u>'+email+'</u>.<br/><button onclick="toggleSignIn();">Sign Out</button>');
        $('#all').show();
      }
    } else {
      // User is signed out.
      $('#login-status').html('You\'re not logged in.<br/><button onclick="toggleSignIn();">Log In with Google</button>')
    }
  });
});

// login/signout user
function toggleSignIn() {
  if (!firebase.auth().currentUser) {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // redirect user to signin
    firebase.auth().signInWithRedirect(provider);
  } else {
    // if user is signed in, sign out
    firebase.auth().signOut();
    $('#all').hide();
  }
}

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
  if (element == '#view' && $(element).css('display') !== 'none')
    loadData();
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

// BELOW TWO FUNCTIONS: https://stackoverflow.com/a/21648161
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
// decode hex to text
String.prototype.hexDecode = function(){
  var j;
  var hexes = this.match(/.{1,4}/g) || [];
  var back = "";
  for(j = 0; j<hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return back;
}

function display(data) {
  let attendeeListHTML = '<button id="uploadAttendees" onclick="uploadData();">Upload Attendees</button><div id="uploadAttendeesStatus"></div><br/>';
  for (let i = 0; i < data.length; i++) {
    attendeeListHTML += data[i][1] /* <- first name */ + " " + data[i][2] /* <- last name */ + " - " + data[i][3] /* <- email */ + "&emsp;<br/><br/>";
  }

  $("#output").html(attendeeListHTML);
}

function uploadData() {
  if (master[0] != null) {
    $('#uploadAttendeesStatus').text('Uploading..');
    let errorCode = '';
    for (let i = 0; i < master.length; i++) {
      // set user vars
      let fname = master[i][1];
      let lname = master[i][2];
      let email = master[i][3];
      let hexEncoded = ("hackchicago2018" + "/" + fname + "/" + lname + "/" + email).toUpperCase().hexEncode().toUpperCase();
      let hexDecoded = hexEncoded.hexDecode();

      // upload attendee data to Firebase
      firebase.database().ref('attendees/' + hexEncoded).set({
        fname: fname,
        lname: lname,
        email: email,
        hexEncoded: hexEncoded,
        hexDecoded: hexDecoded
      }).catch(function(error) {
        $('#uploadAttendeesStatus').text('Error: '+error.code);
      });
    }
    console.log(errorCode)
    // display results of operation
    if ($('#uploadAttendeesStatus').text() === 'Uploading..') $('#uploadAttendeesStatus').text('Successfully uploaded!');
  } else {
    alert('No data available!')
  }
}

function loadData() {
  $('#view-output').html('');
  $('#view-status').text('Loading..');

  var query = firebase.database().ref('attendees/').orderByChild('fname');
  query.once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        let fname = childSnapshot.child('fname').val();
        let lname = childSnapshot.child('lname').val();
        let email = childSnapshot.child('email').val();
        let hexEncoded = childSnapshot.child('hexEncoded').val();

        $('#view-output').append(`<li><a href="javascript: expandAttendee('`+hexEncoded+`')">`+fname+` `+lname+`</a></li><div class="hidden" id="attendee-`+hexEncoded+`"><br/>First Name: `+fname+`<br/>Last Name: `+lname+`<br/>Email: <a href="mailto:`+email+`">`+email+`</a><br/>QR Code: <div style="text-decoration: underline;" id="attendee-qrcode-`+hexEncoded+`">Loading..</div></div><br/>`);
      });
    }).catch(function(error) {
      $('#view-status').text('Error: '+error.code);
    });
  $('#view-status').text('');
}

function expandAttendee(id) {
  // display info
  $('#attendee-'+id).toggle();
  if ($('#attendee-'+id).css('display') !== 'none') {
    // generate QR code
    $('#attendee-qrcode-'+id).html('');
    $('#attendee-qrcode-'+id).qrcode(id);
  }
}

function deleteAttendee(id) {

}

function editAttendee(id) {

}
