App = 
{
  loading: false,
  contracts: {},
  db:firebase.firestore(),
  gen_otp:null,
  secretMsg:null, refNo:0,
  login_attempts: 3,
  qOTP:null, eOTP:null, resend:0, re_email:null,mins: 15,secs:15 * 60,startDate:0,endDate:0,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    //await App.voteForCandidate()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const voting = await $.getJSON('evote.json')
    App.contracts.evote = TruffleContract(voting)
    App.contracts.evote.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.voting = await App.contracts.evote.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderCandidates: async () => {
    // Load the total task count from the blockchain
    var voterid = document.getElementById("vvid").value;
    //var voterid =100
    var v = await App.voting.voters(voterid);
    const con_id= v[6].toNumber();
    const candidateCount = await App.voting.candidatesCount()
    var candidatesList = $("#candidatesList")
    candidatesList.empty()
    
    // Render out each task with a new task template
    for (var i = 1; i <= candidateCount; i++) {
      // Fetch the task data from the blockchain
      console.log(i+""+i*100)
      var key = i*100
      const candidate = await App.voting.candidates(key)
      const cid = candidate[0].toNumber()
      console.log("candidates cid:"+cid)
      const can_name = candidate[1]
      const party_name = candidate[5]
      const constituencyId = candidate[3].toNumber()
      const constituencyName = candidate[4]
      console.log("voter's con name:"+con_id)
      console.log("candidates con name:"+constituencyId)
      console.log("candidates con name:"+constituencyName)
      //var check = con_name.localeCompare(constituencyId)
      //console.log("string match:"+check)
      
      if(con_id == constituencyId)
      {
        console.log(i+" "+cid+" "+can_name)
        var candidateTemplate = "<tr><td><input type='radio' name='ok' id='candidate' value= "+ cid+ ">" + can_name + "</td><td>" + party_name +  "</td><td><img class='rounded-circle' src='./static/"+party_name+".png' height='100' width='100'></td></tr>"
        candidatesList.append(candidateTemplate);
      }
      else{
        console.log("else part")
        continue;
      }
    }
  },

  getList: async () => {
    // Load the total task count from the blockchain
    const c_id = document.getElementById("cid").value;
    
    const candidateCount = await App.voting.candidatesCount()
    var candidatesResult = $("#candidatesResult")
    candidatesResult.empty()
    // Render out each task with a new task template
    for (var i = 1; i <= candidateCount; i++) {
      // Fetch the task data from the blockchain
      console.log(i+""+i*100)
      var key = i*100
      const candidate = await App.voting.candidates(key)
      const cid = candidate[0].toNumber()
      console.log("candidates cid:"+cid)
      const can_name = candidate[1]
      const votes = candidate[2]
      const party_name = candidate[5]
      const constituencyId = candidate[3].toNumber()
      const constituencyName = candidate[4]
      
      if(c_id == constituencyId)
      {
        console.log(i+" "+cid+" "+can_name)
        var candidateTemplate = "<tr><td>" + can_name + "</td><td>" + party_name +  "</td><td><img class='rounded-circle' src='./static/"+party_name+".png' height='100' width='100'></td>></tr>"
        candidatesResult.append(candidateTemplate);
      }
      else{
        console.log("else part")
        continue;
      }
    }
    //console.log(await App.voting.endVote())
  },

  getResults: async () => {
    // Load the total task count from the blockchain
    const c_id = document.getElementById("cid").value;
    
    const candidateCount = await App.voting.candidatesCount()
    var candidatesResult = $("#candidatesResult")
    candidatesResult.empty()
    // Render out each task with a new task template
    for (var i = 1; i <= candidateCount; i++) {
      // Fetch the task data from the blockchain
      console.log(i+""+i*100)
      var key = i*100
      const candidate = await App.voting.candidates(key)
      const cid = candidate[0].toNumber()
      console.log("candidates cid:"+cid)
      const can_name = candidate[1]
      const votes = candidate[2]
      const party_name = candidate[5]
      const constituencyId = candidate[3].toNumber()
      const constituencyName = candidate[4]
      
      if(c_id == constituencyId)
      {
        console.log(i+" "+cid+" "+can_name)
        var candidateTemplate = "<tr><td>" + can_name + "</td><td>" + party_name +  "</td><td><img class='rounded-circle' src='./static/"+party_name+".png' height='100' width='100'></td><td>"+votes+"</td></tr>"
        candidatesResult.append(candidateTemplate);
      }
      else{
        console.log("else part")
        continue;
      }
    }
    console.log(await App.voting.endVote())
  },


  generate: async()=> {
    var SMlength=Math.floor(Math.random() * (13 - 8) ) + 8; 
    console.log("SMlength"+SMlength);
    
    var words;
    words=["bird", "clock", "boy", "plastic", "duck", "teacher", "lady", "professor", "hamster", "dog", "beautiful", "lazy", "professional", "lovely", "dumb", "rough", "soft", "hot", "vibrating", "slimy", "kicked", "ran", "flew", "dodged", "sliced", "rolled", "died", "breathed", "slept", "killed"]

    // generate random numbers
    var randomString = '';
    secretMsg = '';
    var flag;

    for(let i = 1; i <= SMlength; i++) 
    {
    flag=0;
    while(flag==0)
      {
        var index=Math.floor(Math.random() * (words.length - 0) ) + 0;  //generatig random index
        console.log("index"+index);
        
        if(Boolean(randomString.includes(words[index]))==false)
        flag=1;
      }
      if(i==1){
        randomString = randomString +""+words[index];
      }
      else{
        randomString = randomString +" "+words[index];
      }   
}
var Ins= "IMPORTANT: Store this secret message and number, it will needed during login, it wont be available again."
$('#instruction').html(Ins)
$('#secret_msg').html(randomString)
secretMsg = randomString;

var RNlength=Math.floor(Math.random() * (7 - 4) ) + 4; 
    console.log("RNlength"+RNlength);


var randomNo = '';
refNo = '';
for(let i = 1; i <= RNlength; i++) {
    let randomDigit = Math.floor(Math.random() * 10);
    console.log(randomDigit);
    randomNo = randomNo + randomDigit;
}
$('#secret_no').html(randomNo)
refNo = randomNo;
var strConcat=randomString.concat(randomNo)
console.log(strConcat)
var account = web3.currentProvider.selectedAddress
  var hash = await App.voting.testKeccak(strConcat)
  //var x = await App.voting.voterids(account);
  console.log(hash)
  await App.voting.storeHash(hash);
  },

  secretEmail: async() =>{
    vid = document.getElementById("Voterid").value;
    var v = await App.voting.voters(vid);
    // secretMsg= document.getElementById("secret_msg").value ;
    // refNo= document.getElementById("secret_no").value ;
    // store vid, email, secret msg and ref no
  
    App.db.collection("values").doc(vid).set({
      email: v[5],
      secretMsg: secretMsg,
      refNo: refNo
    })
    .then(function() {
      console.log("Document with values successfully written!");
    })
    .catch(function(error) {
      console.error("Error writing values to document: ", error);
    });
  
  },
  
  deleteValues: async() =>{
    vid = document.getElementById("Voterid").value;
  
    // store vid, email, secret msg and ref no
  
    db.collection("values").doc(vid).delete().then(function() {
      console.log("Document successfully deleted!");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
  });
  
  },

registerVoter: async(lines)=>
{
  
  
  //alert('register voter');
  if(isNaN(lines[0]))
    
    {
    //alert('not a number :'+lines[0]); 
    }
    else{
      
    //alert('is a number'+lines[0]);  
      
    }
    
    
    if(typeof lines[1] == 'string')
    
    {
    //alert('is string :'+lines[1]);  
    }
    else{
      
    //alert('else :'+lines[1]); 
      
    }
    
    if(typeof lines[2] == 'string')
    
    {
      //alert('is string :'+lines[2]);
      
    }
    else{
      //alert('else :'+lines[2]);
      
      
    }
  
console.log(lines);
//var balance= web3.eth.getBalance(web3.eth.accounts[0]);
var v = await App.voting.voters(lines[0])
//contractInstance.giveRightToVote(r, {from: web3.eth.accounts[0]});
if(v[0]==lines[0])
{
  alert("Already given the right");
}
else
{
 await App.voting.giveRightToVote(lines[0],lines[1],lines[2],lines[3],{from: web3.eth.accounts[0],gas:3000000});
    //alert('added');
    
  }
  
      
 },
 registerCandidate: async(lines)=>
{
  
console.log(lines);
//var balance= web3.eth.getBalance(web3.eth.accounts[0]);
var v = await App.voting.candidates(lines[0])
var votes = 0;
//contractInstance.giveRightToVote(r, {from: web3.eth.accounts[0]});
if(v[0]==lines[0])
{
  alert("Already registered");
}
else
{
 await App.voting.addCandidate(lines[0],lines[1],lines[2],lines[3],lines[4],votes,{from: web3.eth.accounts[0],gas:3000000});
    //alert('added');
    
  //uint toCandidate, string memory _name, uint _constid, string memory _constname, string memory _partyname, uint votes
  }
  
      
 },



voterRegistration: async()=>{
var r = document.getElementById("Voterid").value;
var v = await App.voting.voters(r);
if (v[3]==true)
{
  alert("You are already registered");
}
else if(v[0]==0)
{
  alert("You are not a valid voter");
}
else
{
var account = web3.currentProvider.selectedAddress
console.log(account)
$("#ID").html("Your Account ID: "+account);
//$("#bal").html("Balance: "+web3.eth.getBalance(account)/Math.pow(10,18));
//await App.voting.registerToVote(r);
}
 },
modalDisplayVote: async()=>{
  // Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("loginvote");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}
},
 checkLogin: async()=>{
  var account = web3.currentProvider.selectedAddress
  var r = document.getElementById("vvid").value;
  var secret_message = document.getElementById("sec_msg").value;
  var secret_number = document.getElementById("sec_num").value;

  var pass= secret_message.concat(secret_number)
  console.log(pass)
  //const content = $('#newTask').val()
  var hash_new = await App.voting.testKeccak(pass)
  console.log(hash_new)
  var v = await App.voting.voters(r);
  var x = await App.voting.voterids(account);
  var currentTime= Math.floor(new Date().getTime()/1000.0);
  var svd= await App.voting.startVote();
  var evd= await App.voting.endVote();
  //var check = x[2].localeCompare(secret_message)
  console.log(x[1])
  //v[3]==true && v[0] == x[0] && 
  if(currentTime>svd && currentTime<=evd)
   {
     if(v[3]==false) alert("You are not registered")
     else if(x[0]==r)
     {
  if (v[3]==true && hash_new == x[1])
  {
    alert("You have successfully logged in");
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("canDiv").style.display = "block";
    // var account = web3.currentProvider.selectedAddress
    // console.log(account)
  $("#ID").html("Your account ID: "+v[4]);
    await App.renderCandidates();
  }
  else
  {
    App.login_attempts=App.login_attempts-1;
    if(App.login_attempts==0)
    {
     alert("No Login Attempts Available");
      document.getElementById("loginDiv").style.display = "none";
      document.getElementById("blocked").style.display = "block";
      document.getElementById("vvid").disabled=true;
      document.getElementById("sec_msg").disabled=true;
      document.getElementById("sec_num").disabled=true;
      document.getElementById("login").disabled=true;
      
    }
    else
    {
     alert("Sorry, Wrong Credentials, Login Failed Now Only "+App.login_attempts+" Login Attempts Available");
    }
  }
}
else
{
  alert("Metamask account doesn't match with the registered account")
}
}
else if(currentTime>evd)
  {
   alert("Voting period is over :( ");
  }
  else
  {
    alert("Voting is not started yet.")
    console.log(v[1])
  }

   },

 voteForCandidate: async()=> {
     var r = document.getElementById("vvid").value;
     var v = await App.voting.voters(r);
    var account = await App.voting.voters(r)[4];
    console.log(account)
     $("#ID").html(account);
    if(v[1]==true)
    {
      alert("You have already voted");
      document.getElementById("canDiv").style.display = "none";
      document.getElementById("thankyou").style.display = "block";
    }
    else
    {
    //var e = document.getElementById("candidate").value;
    var ele = document.getElementsByName('ok'); 
              
            for(i = 0; i < ele.length; i++) { 
                if(ele[i].checked) 
                var e = ele[i].value; 
            } 
    console.log("e:"+e)
    //var candidateName = e;  
    await App.voting.vote(e);
    document.getElementById("canDiv").style.display = "none";
    document.getElementById("thankyou").style.display = "block";
    //alert("Thank you for Voting!")
    //{from: account} 
    }
 
 },

checkRegistration: async()=>
{
  var vid1 = document.getElementById("Voterid").value;
  var vt = await App.voting.voters(vid1); 
  console.log(vid1);
  console.log(vt[0]);
  var currentTime= Math.floor(new Date().getTime()/1000.0);
  var svd= await App.voting.startVote();
  var evd= await App.voting.endVote();
  if (currentTime<svd)
  {
  if(vid1==null || vid1=="")
  alert("Enter vid");
else if(vt[0]==0)
{
  alert("You are not a valid voter");
}
else if (vt[3]==true)
{
  alert("You are already registered");
}
  else
  {
    App.generateOTP();
  // var ref = App.db.collection("orders").doc(vid);

  // ref.get().then(function(doc) {
  //     if (doc.exists) {
  //         alert("Voter already registered");
  //     } else {
  //       App.generateOTP();
  //     }
  // }).catch(function(error) {
  //     console.log("Error getting document:", error);
  // });
  }
}
else if(currentTime>evd)
{
  alert("Voting period is over")
}
else
{
  alert("The registrations are closed")
}
},

generateOTP: async()=>
 {
  
  var string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  gen_otp='';
    
  // Find the length of string 
  var len = string.length; 
  for (let i = 0; i < 6; i++ ) { 
      gen_otp += string[Math.floor(Math.random() * len)]; 
  } 

  console.log(gen_otp)

  App.storeData()
  App.countdown()
} ,

storeData: async()=>
{
  var vid = document.getElementById("Voterid").value;
  var v = await App.voting.voters(vid);
  if(App.resend==0) //first time opt generation
  {
    console.log("gen_otp",gen_otp);
  App.db.collection("orders").doc(vid).set({
  email: v[5],
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

    App.db.collection("orders").doc(vid).set({
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
},

countdown: async()=> { 
  setTimeout('App.Decrement()', 60); 
}, 

//Decrement function decrement the value. 
Decrement: async()=> { 
  if (document.getElementById) { 
      minutes = document.getElementById("minutes"); 
      seconds = document.getElementById("seconds"); 

      document.getElementById("counter").style.display = "block";

      //if less than a minute remaining 
      //Display only seconds value. 
      if (seconds < 59) { 
          seconds.value = App.secs; 
      } 

      //Display both minutes and seconds 
      //getminutes and getseconds is used to 
      //get minutes and seconds 
      else { 
          minutes.value = App.getminutes(); 
          seconds.value = App.getseconds(); 
      } 
      //when less than a minute remaining 
      //colour of the minutes and seconds 
      //changes to red 
      if (App.mins < 1) { 
          minutes.style.color = "red"; 
          seconds.style.color = "red"; 
      } 
      //if seconds becomes zero, 
      //then page alert time up 
      if (App.mins < 0) { 
          alert('time up'); 
          minutes.value = 0; 
          seconds.value = 0; 
      } 
      //if seconds > 0 then seconds is decremented 
      else { 
          App.secs--; 
          setTimeout('App.Decrement()', 1000); 
      } 
  } 
}, 

getminutes: async()=> { 
  //minutes is seconds divided by 60, rounded down 
  App.mins = Math.floor(App.secs / 60); 
  return App.mins; 
} ,

getseconds: async()=> { 
  //take minutes remaining (as seconds) away  
  //from total seconds remaining 
  return App.secs - Math.round(App.mins * 60); 
} ,
modalDisplay: async()=>{
  // Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("register");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}
},
checkOTP: async()=>
{
  //console.log(document.getElementById("rModal"));
  var vid = document.getElementById("Voterid").value;
  var docRef = App.db.collection("orders").doc(vid);

  docRef.get().then(async(doc)=> {
      if (doc.exists) {
          //console.log("Document data:", doc.data());
          App.qOTP = doc.get("otp"); // otp stored in firestore
          console.log("qotp ",App.qOTP);

          App.eOTP = document.getElementById("otp").value; //otp entered by user
          console.log("eotp ",App.eOTP);
          if(App.qOTP == App.eOTP)
          {
           await App.voting.registerToVote(vid);
           alert("voter registered");
           App.generate();
          //window.location.assign("secretMsg.html");
        }
          else 
          alert("OTP does not match or timeout");

      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
  
},

resendOTP: async()=>
{
  

  var vid = document.getElementById("Voterid").value;

  if(vid==null || vid=="")
  alert("Enter vid");
  else
  {
  var reRef = App.db.collection("orders").doc(vid);

    reRef.get().then(function(doc) {
        if (doc.exists) {
            //console.log("Document data:", doc.data());
            re_email = doc.get("email"); // otp stored in firestore
            console.log("re_email ",re_email);
            App.resend=1;
            App.generateOTP();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            window.alert("Register first");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        alert("Register first");
    });
  }
  
},
checkTime: async()=>{
  //alert("hii");
  var currentTime= Math.floor(new Date().getTime()/1000.0);
  var evd= await App.voting.endVote();
  var svd= await App.voting.startVote();
  console.log(evd);
  console.log(currentTime);
  var account = web3.currentProvider.selectedAddress
  var admin_account= await App.voting.admin();
  if (account!=admin_account) alert("You don't have rights to access this option")
  else
  {
  if (currentTime>evd) 
    {
      //document.getElementById("results").disabled = false;
      alert("Your results are ready!!!");
      window.location.replace("./admin_results.html");
}
else if(currentTime<=svd)
{
  alert("No results to show")
}
  else 
    {//document.getElementById("results").disabled = true;
  alert("Voters are voting yet.Please Wait!!!");

}
}
},
getVoterInfo: async() =>{
  var vid = document.getElementById("vid").value;
  var v = await App.voting.voters(vid); 
  var registered = v[3]
  var voted = v[1]
  console.log(registered+" "+voted)
  $('#registered').html(registered.toString())
  $('#voted').html(voted.toString())

},

cancelReg: async() =>{
  var vid = document.getElementById("vid2").value;
  var v = await App.voting.voters(vid); 
  var registered = v[3]
  var voted = v[1]
  console.log(registered+" "+voted)
  var account = web3.currentProvider.selectedAddress
  var admin_account= await App.voting.admin();
  if (account!=admin_account) alert("You don't have rights to access this option")
  else
  {
  if(v[1]== true){
    alert("The citizen has already voted")
  }
  else if(v[3]== false){
    alert("The citizen has not registered")
  }
  else{
    await App.voting.cancelReg(vid);
  }
}

},

setVotingDates: async() =>{
var svd= document.getElementById("svd").value;
var evd= document.getElementById("evd").value;
var currentTime= Math.floor(new Date().getTime()/1000.0);
var sdo = new Date(svd);
var edo = new Date(evd);
// var so= sdo.toUTCString();
// var eo= edo.toUTCString();
var s= Date.UTC(sdo.getUTCFullYear(),sdo.getUTCMonth(),sdo.getUTCDate(),sdo.getUTCHours(),sdo.getUTCMinutes());
var e= Date.UTC(edo.getUTCFullYear(),edo.getUTCMonth(),edo.getUTCDate(),edo.getUTCHours(),edo.getUTCMinutes());
if (s>=e) alert("Invalid date and time selected")
else
{
await App.voting.setDates(s/1000.0,e/1000.0);
// App.startDate=svd;
// App.endDate=evd;
console.log("start"+ await App.voting.startVote())
console.log("end" + await App.voting.endVote())
console.log("current" + currentTime)
//console.log(sdo.getUTCFullYear(),sdo.getUTCMonth(),sdo.getUTCDate(),sdo.getUTCHours(),sdo.getUTCMinutes())
}
}


}
$(() => {
  $(window).load(() => {
    App.load()
  })
})
