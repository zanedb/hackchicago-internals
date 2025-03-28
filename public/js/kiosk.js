// TODO
// Handle no attendees
// Add option to edit attendee data
// Add option to create attendees
// Fix QR code generation
// Rename /kiosk to /attendees
// Handle case of empty database
// Add checkin page

let apiCallData = null;

// on load
$(document).ready(function() {
  // clear values
  $('#email').val('');
  $('#token').val('');
});

// login/signout user
function toggleSignIn() {
  $('#all').hide();
}

$('#loginForm').submit(function () {
  if($('#token').val() !== '' && $('#email').val() !== '') {
    const email = $('#email').val();
    const token = $('#token').val();
    fetch('http://localhost:8080/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        token: token
      }),
      credentials: 'include'
    })
      .then((data) => {
        console.log(data)
        if(data.status === 200) {
          $('#login-section').hide();
          $('#all').show();
        } else {
          $('#login-status').text('Invalid token.');
        }
        return false;
      })
      .catch((err) => {
        console.log(err)
        $('#login-status').text('Authentication failed.');
      });
      
  } else if($('#email').val() !== '') {
    const email = $('#email').val();
    fetch('http://localhost:8080/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email
      }),
      credentials: 'include'
    })
      .then((data) => {
        if(data.status === 200) {
          $('#emailShow').hide();
          $('#tokenShow').show();
          $('#login-status').text('Check your email for a token.');
        } else {
          $('#login-status').text('Invalid email.');
        }
      })
      .catch((err) => {
        $('#login-status').text('Authentication failed.');
      });
  } else {
    $('#login-status').text('An error occurred.');
  }

  return false;
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

/*function uploadData() {
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

      fetch('https://api.hackchicago.io/v1/attendees', {
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
}*/

function loadData() {
  $('#view-output').html('');
  $('#view-status').text('Loading..');

  fetch('http://localhost:8080/v1/attendees', {
    method: 'GET',
    credentials: 'include'
  }).then(res => res.json())
    .then(resJson => { 
      apiCallData = resJson;
      console.log(resJson)

      if($('#attendeeSearch').val() !== '')
        search($('#attendeeSearch').val(), apiCallData);
      else
        displayData(apiCallData);
    })
    .catch(err => $('#view-status').text('Error: '+err));
    //$('#view-status').html(`No attendees found.. <a href="javascript: toggle('#add');">Add some?</a>`);
}
$('#attendeeSearch').keypress(function(e) {
  if (e.which == 13) {
    const numButtons = $("ul#view-output button.approveButton:first-child").length;
    if (numButtons == 1) {
      $("ul#view-output button.approveButton:first-child").click();
    } else if (numButtons == 0) {
      $('#view-status').text("No matching attendee.");
      failTone.play();
    } else {
      $('#view-status').text("Not the only one in list! Manually approve.");
      failTone.play();
    }
    return;
  }
});

$('#attendeeSearch').on( 'input', function() {
  const searchQuery = $('#attendeeSearch').val(); 
  search(searchQuery, apiCallData);
});

function search(query, data) {
  if(query !== '') {
    // go through and add "fullname" param that concatenates first + last name, for search purposes
    for(let i = 0; i<data.length;i++) {
      data[i].fullname = `${data[i].fname} ${data[i].lname}`;
    }
    // fuse options
    const options = {
      shouldSort: true,
      threshold: 0.2,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "_id",
        "school",
        "fullname",
        "email",
        "city",
        "state"
      ]
    };
    // perform search & display results
    const fuse = new Fuse(data, options);
    const fuseSearchData = fuse.search(query);
    if(fuseSearchData.length !== 0) {
      displayData(fuseSearchData);
    } else {
      $('#view-output').html('');
      $('#view-status').text('No results found');
    }
  } else {
    displayData(data);
  }
}

function displayData(res) {
  $('#view-output').html('');
  $('#view-status').text('Loading..');
  let htmlOutput = '';

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
    const internalNotes = res[i].internalNotes;
    const note = res[i].note;
    const isApproved = res[i].isApproved;

    const hexEncoded = ("hackchicago2018" + "/" + fname + "/" + lname + "/" + email).toUpperCase().hexEncode().toUpperCase();
    const id = res[i]._id;

    // generate HTML for each attendee
    htmlOutput += `
      <div id="attendee-info-${id}">
        <li>${fname} ${lname}</li>
        <br/>Email: <a href="mailto:${email}">${email}</a>
        ${phone !== '' ? `<br/>Phone: <a href="tel:${phone}">${phone}</a>` : ''}
        <br/>Gender: ${gender}
        <div class="buttons">
          ${isApproved !== true ? `<button class="approveButton" onclick="approveAttendee('${id}')" id="approval-button-${id}">Approve Attendee</button><h5 id="attendee-approval-status-${id}"></h5>` : `<button style="background-color: #4CAF50;">Approved</button>`}
        </div>
        <br/><a href="javascript: expandAttendee('${id}', '${hexEncoded}')">More Info</a>
        <div class="hidden" id="attendee-${id}">
          <br/>Location: ${location}
          <br/>Date of Signup: ${timestamp}
          ${dietRestrictions !== '' ? `<br/><b>Diet Restrictions</b>: ${dietRestrictions}` : ''}
          <br/>School Info: ${schoolInfo}
          ${note !== '' ? `<br/><b>Note</b>: ${note}` : ''}
          ${internalNotes !== '' ? `<br/><b>Internal Notes</b>: ${internalNotes}` : ''}
          <br/>QR Code: <div style="text-decoration: underline;" id="attendee-qrcode-${id}">Loading..</div>
          <br/>
          <div class="buttons">
            <button onclick="deleteAttendee('${id}')">Delete Attendee</button><h5 id="attendee-status-${id}"></h5>
            <!--<button onclick="editAttendee('${id}', '${fname}', '${lname}', '${email}')" id="attendee-edit-${id}">Edit Attendee</button>-->
          </div>
        </div>
      </div><br/>
    `;
  }
  $('#view-status').text(`${res.length} ${res.length === 1 ? 'result' : 'results' }`);
  $('#view-output').html(htmlOutput);
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
  const deletePopup = confirm('Are you sure you want to delete this attendee? PLEASE BE VERY CAREFUL!')
  if (deletePopup) {
    // delete attendee
    fetch(`https://api.hackchicago.io/v1/attendees/id/${id}`, {
      headers: {
        'Auth': auth_key
      },
      method: 'DELETE'
    }).catch(err => $('attendee-status-'+id).text(`Error: ${err}`));
    // refresh list
    loadData();
  }
}

var successTone = document.createElement('audio');
successTone.setAttribute('src', '../tones/success.m4a');
var failTone = document.createElement('audio');
failTone.setAttribute('src', '../tones/fail.m4a');

function approveAttendee(id) {
  $(`#approval-button-${id}`).text('Loading..');
  // approve attendee
  fetch(`https://api.hackchicago.io/v1/attendees/id/${id}/approve`, {
    headers: {
      'Auth': auth_key
    },
    method: 'GET'
  }).then(res => res.json())
    .then(res => {
      if(res.message === 'Attendee approved!') {
        $(`#attendee-approval-status-${id}`).text('');
        $(`#approval-button-${id}`).text('Approved');
        $(`#approval-button-${id}`).attr('onclick','');
        $(`#approval-button-${id}`).removeClass('approveButton');
        $(`#approval-button-${id}`).css('background-color','#4CAF50');
        $('#attendeeSearch').val('');
        successTone.play();
      } else {
        if (res.message === `You’ve already sent this email to the subscriber.`) {
          $(`#approval-button-${id}`).text('Email already sent');
          $(`#approval-button-${id}`).attr('onclick','');
        } else {
          $(`#attendee-approval-status-${id}`).text(res.message);
        }
        failTone.play();
      }
    })
    .catch(err => $(`approval-button-${id}`).text(`Error: ${err}`));
  // refresh list
  //loadData();
}

function editAttendee(id, fname, lname, email) {

}
