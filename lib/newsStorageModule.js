var mongoWrapper = require("./mongoWrapper");
var _newsIdCollection;
var _newsDataCollection;

var availableNewsId = [];

module.exports = {
  initializeModule: function(mongoUrl, newsIdCollection, newsDataCollection, callback) {
    _newsIdCollection    = newsIdCollection;
    _newsDataCollection  = newsDataCollection;
    mongoWrapper.initializeClient(mongoUrl, function(err, result){
      if(err) throw err;
      else {
        mongoWrapper.findObjectsAsArray(_newsIdCollection, {}, function(err, result){
          if(err) {
            callback(err, null);
          } else {
            result.forEach(function(newsIdObject){
              availableNewsId.push(newsIdObject.hurriyetId);
            });
            var  isSucceed = true;
            callback(null, isSucceed);
          }
        }); 
      }
    });
  },
  isOldData:function(hurriyetId){
    var isDataPresentInDb = true;
    if(availableNewsId.indexOf(hurriyetId) > -1){
      return isDataPresentInDb;
    } else {
      isDataPresentInDb = false;
      return isDataPresentInDb;
    }
  },
  addNews:function(detailedNewsData, extractedKeywords, callback){
    mongoWrapper.insertObject(_newsIdCollection, {"hurriyetId": detailedNewsData.Id} ,function(err, result){
      if(!err) {
        mongoWrapper.insertObject(_newsDataCollection, {"detailedNews": detailedNewsData, "extractedKeywords": extractedKeywords} ,function(err, result){
          if(!err) {
            availableNewsId.push(detailedNewsData.Id);
            var isSucceed = true;
            callback(null, isSucceed);
          } else {
            callback(err, null);
          }
        });
      } else {
        callback(err, null);
      }
    });
  },
};