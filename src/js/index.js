var db = firebase.firestore();


var gen_otp, vid, qOTP, eOTP, resend=0, re_email;
//set minutes 
var mins = 15; 
//calculate the seconds 
var secs = mins * 60; 

document.getElementById("register").disabled = true;
document.getElementById("otp").disabled = true;
document.getElementById("counter").style.display = "none";


function checkRegistration()
{


  vid = document.getElementById("Voterid").value;
  if(vid==null || vid=="")
  window.alert("Enter vid");
  else
  {
  var ref = db.collection("orders").doc(vid);

  ref.get().then(function(doc) {
      if (doc.exists) {
          window.alert("Voter already registered");
      } else {
        generateOTP();
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
  }
}

function generateOTP()
 {
  
  var string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  gen_otp='';
    
  // Find the length of string 
  var len = string.length; 
  for (let i = 0; i < 6; i++ ) { 
      gen_otp += string[Math.floor(Math.random() * len)]; 
  } 

  console.log(gen_otp)

  storeData()
  countdown()
} 

function storeData()
{
  vid = document.getElementById("Voterid").value;
  
  if(resend==0) //first time opt generation
  {
  db.collection("orders").doc(vid).set({
  email: "mbhavinipiyush@gmail.com",
  otp:gen_otp
})
.then(function() {
  console.log("Document successfully written!");
})
.catch(function(error) {
  console.error("Error writing document: ", error);
});
  }
  else
  {

    db.collection("orders").doc(vid).set({
      email: re_email,
      otp:gen_otp
    })
    .then(function() {
      console.log("otp successfully updated!");
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });



  }

document.getElementById("register").disabled = false;
document.getElementById("otp").disabled = false;
}

function countdown() { 
  setTimeout('Decrement()', 60); 
} 

//Decrement function decrement the value. 
function Decrement() { 
  if (document.getElementById) { 
      minutes = document.getElementById("minutes"); 
      seconds = document.getElementById("seconds"); 

      document.getElementById("counter").style.display = "block";

      //if less than a minute remaining 
      //Display only seconds value. 
      if (seconds < 59) { 
          seconds.value = secs; 
      } 

      //Display both minutes and seconds 
      //getminutes and getseconds is used to 
      //get minutes and seconds 
      else { 
          minutes.value = getminutes(); 
          seconds.value = getseconds(); 
      } 
      //when less than a minute remaining 
      //colour of the minutes and seconds 
      //changes to red 
      if (mins < 1) { 
          minutes.style.color = "red"; 
          seconds.style.color = "red"; 
      } 
      //if seconds becomes zero, 
      //then page alert time up 
      if (mins < 0) { 
          alert('time up'); 
          minutes.value = 0; 
          seconds.value = 0; 
      } 
      //if seconds > 0 then seconds is decremented 
      else { 
          secs--; 
          setTimeout('Decrement()', 1000); 
      } 
  } 
} 

function getminutes() { 
  //minutes is seconds divided by 60, rounded down 
  mins = Math.floor(secs / 60); 
  return mins; 
} 

function getseconds() { 
  //take minutes remaining (as seconds) away  
  //from total seconds remaining 
  return secs - Math.round(mins * 60); 
} 

function checkOTP()
{
  var docRef = db.collection("orders").doc(vid);

  docRef.get().then(function(doc) {
      if (doc.exists) {
          //console.log("Document data:", doc.data());
          qOTP = doc.get("otp"); // otp stored in firestore
          console.log("qotp ",qOTP);

          eOTP = document.getElementById("otp").value; //otp entered by user
          
          if(qOTP == eOTP && mins>0)
          window.location.assign("secretMsg.html");
          else 
          window.alert("OTP does not match or timeout");

      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
  
}

function resendOTP()
{
  

  vid = document.getElementById("Voterid").value;

  if(vid==null || vid=="")
  window.alert("Enter vid");
  else
  {
  var reRef = db.collection("orders").doc(vid);

    reRef.get().then(function(doc) {
        if (doc.exists) {
            //console.log("Document data:", doc.data());
            re_email = doc.get("email"); // otp stored in firestore
            console.log("re_email ",re_email);
            resend=1;
            generateOTP();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            window.alert("Register first");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        window.alert("Register first");
    });
  }
  
}