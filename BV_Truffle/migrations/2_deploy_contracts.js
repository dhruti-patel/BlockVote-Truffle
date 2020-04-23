var evote = artifacts.require("./evote.sol");

module.exports = function(deployer) {
  deployer.deploy(evote);
};
