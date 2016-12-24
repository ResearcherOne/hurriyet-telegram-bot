var mongoWrapper = require('./mongoWrapper.js');

module.exports = {
  initializeModule: function(options, callback){
    mongoWrapper.initializeClient(options.mongoUrl, callback);
    
  },
  addToNotificationList: function(keyword, userId, callback) {
    
  },
  newKeywordWithUser: function(keyword, userId, callback) {
    
  },
  isKeywordExist
}