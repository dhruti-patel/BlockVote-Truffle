var Election = artifacts.require("./evote.sol");
//This makes an artifact which in truffle means creating an abstraction to communicate with our smart contracts.

contract("Election", function(accounts) {
  var electionInstance;

  before(async () => {
    this.election = await Election.deployed()
  })

  it('deploys successfully', async () => {
    const address = await this.election.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })

  it("initializes all the candidates", function() {
    return Election.deployed().then(function(instance) {
        electionInstance = instance
        electionInstance.addCandidate(100, "Devendra Fadnavis", 1, "Maharashtra", "BJP", 0)
        electionInstance.addCandidate(200, "Vijay Rupani", 2, "Gujarat", "BJP", 0)
      return instance.candidatesCount();
    }).then(function(count1) {
      assert.equal(count1, 2);
    });
  });

  it("initializes all the eligible voters", function() {
    return Election.deployed().then(function(instance) {
        electionInstance = instance
      electionInstance.giveRightToVote(100, "darshee.m@somaiya.edu", 1, "Maharashta")
      electionInstance.giveRightToVote(200, "darshee.m013@gmail.com", 2, "Gujarat")
      return instance.voterCount();
    }).then(function(count2) {
      assert.equal(count2, 2);
    });
  });

  it("it initializes the candidates with the correct values", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      
      return electionInstance.candidates(100);
    }).then(function(candidate) {
      assert.equal(candidate[0], 100, "contains the correct id");
      assert.equal(candidate[1], "Devendra Fadnavis", "contains the correct name");
      assert.equal(candidate[2], 0, "contains 0 votes before election");
      assert.equal(candidate[3], 1, "contains the correct constituency id");
      assert.equal(candidate[4], "Maharashtra", "contains the correct constituency name");
      assert.equal(candidate[5], "BJP", "contains the correct party name");
      return electionInstance.candidates(200);
    }).then(function(candidate) {
        assert.equal(candidate[0], 200, "contains the correct id");
        assert.equal(candidate[1], "Vijay Rupani", "contains the correct name");
        assert.equal(candidate[2], 0, "contains 0 votes before elections");
        assert.equal(candidate[3], 2, "contains the correct constituency id");
        assert.equal(candidate[4], "Gujarat", "contains the correct constituency name");
        assert.equal(candidate[5], "BJP", "contains the correct party name");
    });
  });

  it("allows only eligible voter to register", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      vId = 100;
      return electionInstance.registerToVote(vId);
    }).then(function(registered) {
      assert(registered, "the voter was marked as rergistered");
  });
});

  it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
    
      candidateId = 100;
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });

  it("throws an exception for invalid candiates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      
      return electionInstance.vote(99, { from: accounts[1] })
    }).then(function(voted) {
        assert(voted, "the voter couldn't vote");
        return electionInstance.candidates(100);
      }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(200);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
    });
  });

  it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidate1 = 100;
      candidateId = 200;
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(function(voted) {
        assert(voted, "the voter was marked as voted");
        return electionInstance.candidates(candidateId);
      }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 0, "accepts first vote");
      // Try to vote again
      electionInstance.vote(candidateId, { from: accounts[1] })
      return electionInstance.candidates(100);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(200);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
    });
  });
});