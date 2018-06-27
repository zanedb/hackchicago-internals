// TODO
// Handle no attendees
// Add option to edit attendee data
// Add option to create attendees
// Fix QR code generation
// Rename /kiosk to /attendees
// Handle case of empty database
// Add checkin page

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

let auth_key = null;

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
      // user is signed in
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var uid = user.uid;
      var providerData = user.providerData;

      // get Auth key
      const query = firebase.database().ref('keys/');
      query.once("value")
        .then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            auth_key = childSnapshot.val();

            if (email.split('@')[1] === 'hackchicago.io') {
              if(auth_key !== null) {
                // user can access an auth key
                $('#login-status').html('Welcome, <u>'+displayName+'</u>! You\'re logged in as <u>'+email+'</u>.<br/><button onclick="toggleSignIn();">Sign Out</button>');
                $('#all').show();
              } else {
                $('#login-status').html('Unfortunately, the email <u>'+email+'</u> does not have the required permissions.<br/><button onclick="toggleSignIn();">Sign Out</button>');
                $('#all').show();
              }
            } else {
              $('#login-status').html('Error: Please login with a <u>hackchicago.io</u> email address.<br/><button onclick="toggleSignIn();">Sign Out</button>');
              $('#all').show();
            }
          });
        });
        
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
  if (element == '#view' && $(element).css('display') !== 'none') loadData();
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
    for (let i = 0; i < master.length; i++) {
      const attendeeData = {
        timestamp: master[i][0],
        fname: master[i][1],
        lname: master[i][2],
        email: master[i][3],
        phone: master[i][4],
        grade: master[i][5],
        gender: master[i][6],
        school: master[i][7],
        city: master[i][8],
        state: master[i][9],
        shirtSize: master[i][10],
        dietRestrictions: master[i][11],
        note: master[i][12],
        ref: master[i][13],
        internalNotes: master[i][16]
      };

      for(let i = 0; i < Object.keys(attendeeData).length; i++) {
        if(attendeeData[Object.keys(attendeeData)[i]] == null) attendeeData[Object.keys(attendeeData)[i]] = '';
      }

      console.log(attendeeData);
      fetch('https://hackchicago.herokuapp.com/api/v1/attendees', {
        body: attendeeData,
        headers: {
          'Auth': auth_key
        },
        method: 'POST'
      }).then(res => res.json())
        .then(res => {
          $('#uploadAttendeesStatus').text(res.message);
          if(res.message === 'Attendee created!' && $('#view').css('display') !== 'none') loadData();
        })
        .catch(err => $('#uploadAttendeesStatus').text('Error: '+err));
    }
  } else {
    $('#uploadAttendeesStatus').text('No data available.')
  }
}

function loadData() {
  $('#view-output').html('');
  $('#view-status').text('Loading..');

  fetch('https://hackchicago.herokuapp.com/api/v1/attendees', {
    headers: {
      'Auth': auth_key
    },
    method: 'GET'
  }).then(res => res.json())
    .then(res => {
      console.log('Success:', res)
      for(let i = 0; i < res.length; i++) {
        const fname = res[i].fname;
        const lname = res[i].lname;
        const email = res[i].email;
        const phone = res[i].phone;
        const location = `${res[i].city}, ${res[i].state}`;
        const timestamp = res[i].timestamp;
        const dietRestrictions = res[i].dietRestrictions;
        const schoolInfo = `Grade ${res[i].grade} at ${res[i].school}`;
        const gender = res[i].gender;

        const hexEncoded = ("hackchicago2018" + "/" + fname + "/" + lname + "/" + email).toUpperCase().hexEncode().toUpperCase();
        const id = res[i]._id;

        // generate HTML for each attendee
        $('#view-output').append(`
          <li><a href="javascript: expandAttendee('${id}', '${hexEncoded}')">${fname} ${lname}</a></li>
          <div class="hidden" id="attendee-${id}">
            <br/>Gender: ${gender}
            <br/>Email: <a href="mailto:${email}">${email}</a>
            ${phone !== '' ? `<br/>Phone: <a href="tel:${phone}">${phone}</a>` : ''}
            <br/>Location: ${location}
            <br/>Date of Signup: ${timestamp}
            ${dietRestrictions !== '' ? `<br/><b>Diet Restrictions</b>: ${dietRestrictions}` : ''}
            <br/>School Info: ${schoolInfo}
            <br/>QR Code: <div style="text-decoration: underline;" id="attendee-qrcode-${id}">Loading..</div>
            <br/>
            <div class="buttons">
              <button onclick="deleteAttendee('${id}')">Delete Attendee</button><h5 id="attendee-status-${id}"></h5>
              <!--<button onclick="editAttendee('${id}', '${fname}', '${lname}', '${email}')" id="attendee-edit-${id}">Edit Attendee</button>-->
            </div>
          </div><br/>
        `);
        $('#view-status').text('');
      }
    })
    .catch(err => $('#view-status').text('Error: '+err));
    //$('#view-status').html(`No attendees found.. <a href="javascript: toggle('#add');">Add some?</a>`);
}

function expandAttendee(id, hexEncoded) {
  // display info
  $('#attendee-'+id).toggle();
  if ($('#attendee-'+id).css('display') !== 'none') {
    // generate QR code
    $('#attendee-qrcode-'+id).html('');
    $('#attendee-qrcode-'+id).qrcode(hexEncoded);
  }
}

function deleteAttendee(id) {
  // delete attendee
  fetch(`https://hackchicago.herokuapp.com/api/v1/attendees/id/${id}`, {
    headers: {
      'Auth': auth_key
    },
    method: 'DELETE'
  }).catch(err => $('attendee-status-'+id).text(`Error: ${err}`));
  // refresh list
  loadData();
}

function editAttendee(id, fname, lname, email) {

}
