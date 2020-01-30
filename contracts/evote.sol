pragma solidity >=0.4.22 <0.6.0;
contract evote {

    struct Voter {
        uint vid;
        bool voted;
        uint8 vote;
        bool registered;
        address vadd;
    }
    
    struct Candidate {
        uint cid;
        string name;
        uint voteCount;
    }
    //add secret hash and ref no.
    struct VoterId {
        uint eid;
    }
    
    address admin;
    uint256 public voterCount=0;
    mapping(uint => Voter) public voters;
    mapping(address=> VoterId) public voterids;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;
   
    constructor() public {
        admin = msg.sender;
        addCandidate("Candidate 1");
    addCandidate("Candidate 2");
    addCandidate("Candidate 3");
        }
        
    function addCandidate (string memory _name) private {
    candidatesCount ++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }
    
    function giveRightToVote(uint toVoter) public {
        if (msg.sender != admin) return;
        voterCount+=1;
        voters[toVoter].vid = toVoter;
        
    }
    //need to include otp thing
    function registerToVote(uint toVoter) public {
        if(voters[toVoter].vid!=0 && voters[toVoter].registered==false){
        voterids[msg.sender].eid=toVoter;
        voters[toVoter].registered=true;
        voters[toVoter].vadd=msg.sender;
        }
        
    }
    
    function vote(uint8 toCandidate) public {
        uint voterid;
        voterid=voterids[msg.sender].eid;
        if (voters[voterid].voted || toCandidate > candidatesCount || voters[voterid].registered==false) return;
        
        voters[voterid].voted = true;
        
        voters[voterid].vote = toCandidate;
        candidates[toCandidate].voteCount += 1;
    }
    
    function winner() public view returns (uint8 _winner) {
        uint256 winnerVoteCount = 0;
        for (uint8 cand = 1; cand < candidatesCount; cand++)
            if (candidates[cand].voteCount > winnerVoteCount) {
                winnerVoteCount = candidates[cand].voteCount;
                _winner = cand;
            }
    }
    
}