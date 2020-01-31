App = 
{
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    App.generate()
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

  generate: function() {
    var SMlength=Math.floor(Math.random() * (13 - 8) ) + 8; 
    console.log("SMlength"+SMlength);
    
    var words;
    words=["bird", "clock", "boy", "plastic", "duck", "teacher", "lady", "professor", "hamster", "dog", "beautiful", "lazy", "professional", "lovely", "dumb", "rough", "soft", "hot", "vibrating", "slimy", "kicked", "ran", "flew", "dodged", "sliced", "rolled", "died", "breathed", "slept", "killed"]

    // generate random numbers
    var randomString = '';
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
  
    randomString = randomString +" "+words[index];
}
$('#secret_msg').html(randomString)

var RNlength=Math.floor(Math.random() * (7 - 4) ) + 4; 
    console.log("RNlength"+RNlength);


var randomNo = '';
for(let i = 1; i <= RNlength; i++) {
    let randomDigit = Math.floor(Math.random() * 10);
    console.log(randomDigit);
    randomNo = randomNo + randomDigit;
}
$('#secret_no').html(randomNo)
var strConcat=randomString.concat(randomNo);
console.log("concat"+strConcat);
// var crypto = require('crypto');
// var hash = crypto.createHash('sha256');
// hash.update('darshee');
$('#hash').html("hash will be generated")

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
 await App.voting.giveRightToVote(lines[0],lines[1],lines[2],{from: web3.eth.accounts[0],gas:3000000});
    //alert('added');
    
  }
  
      
 },

/*registerVoter: async() =>{
var r = document.getElementById("Id").value;
var v = await App.voting.voters(r)
//contractInstance.giveRightToVote(r, {from: web3.eth.accounts[0]});
if(v[0]==r)
{
  alert("Already given the right");
}
else
{
await App.voting.giveRightToVote(r)
}
 },*/

voterRegistration: async()=>{
var r = document.getElementById("Voterid").value;
var v = await App.voting.voters(r)
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
$("#ID").html("Your Account ID: "+account);
//$("#bal").html("Balance: "+web3.eth.getBalance(account)/Math.pow(10,18));
await App.voting.registerToVote(r);
}
 },

 voteForCandidate: async()=> {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10) {
    dd = '0'+dd
  } 
  if(mm<10) {
    mm = '0'+mm
  } 
  today = dd + '/' + mm + '/' + yyyy;

if(dd>ddV && mm>=mmV && yyyy>=yyyyV){    
    alert("Voting is closed");    
  }
  else if(dd<ddS && mm<=mmS && yyyy<=yyyyS)
  {
    alert("Voting starts on "+dateS);
  }
  else{
    var r = document.getElementById("vvid").value;
    var account = await App.voting.voters(r)[4];
    $("#ID").html("Your Account ID: "+account);
    if(await App.voting.voters(r)[1]==true)
    {
      alert("You have already voted");
    }
    else
    {
    var e = document.getElementById("candidate").value;
    var candidateName = e;  
    await App.voting.vote(e, {from: account}); 
    }
  }
}


}

$(() => {
  $(window).load(() => {
    App.load()
  })
})
