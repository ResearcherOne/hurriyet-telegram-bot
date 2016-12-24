const Hurriyet          = require('hurriyet');
const newsStorageModule = require('./newsStorageModule.js');
let hurriyetApi;

let _fetchLimit;
let _fetchIntervalInMinutes;
let _newsAddedCallback;

function extractKeywordsFromNews(detailedNewsData) {
  return detailedNewsData.Description.split(" ");
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = {
  initializeModule: function(mongoUrl, hurriyetApiKey, fetchIntervalInMinutes, fetchLimit, newsIdCollection, newsDataCollection, callback) {
    hurriyetApi             = new Hurriyet(hurriyetApiKey);
    _fetchIntervalInMinutes = fetchIntervalInMinutes;
    _fetchLimit             = fetchLimit;
    
    newsStorageModule.initializeModule(mongoUrl, newsIdCollection, newsDataCollection, function(err, result){
      if(err) throw err;
      let fetchLatestNewsTask = setInterval(function() {
        hurriyetApi.Articles.getAll({limit:_fetchLimit}, function(err, result) {
          if(!err) {
            result.forEach(function(newsData){
              const newsId = newsData.Id;
              if(!newsStorageModule.isOldData(newsId)) {
                console.log("THAT IS NEWS ID: "+newsId);
                
                var extractedKeywords = extractKeywordsFromNews(newsData);
                newsStorageModule.addNews(newsData, extractedKeywords, function(err, result){
                  if(!err) {
                    _newsAddedCallback(null, {"newsData": newsData, "extractedKeywords": extractedKeywords});    
                  } else {
                    _newsAddedCallback(err, null);
                  }
                });
                /*
                setTimeout(function(){
                hurriyetApi.Articles.getFromId(newsId, function(err, detailedNewsData){
                  console.log("THAT ONE: "+JSON.stringify(detailedNewsData));
                  if(!err) {
                    var extractedKeywords = extractKeywordsFromNews(detailedNewsData);
                    newsStorageModule.addNews(detailedNewsData, extractedKeywords, function(err, result){
                      if(!err) {
                        _newsAddedCallback(null, {"newsData": detailedNewsData, "keywords": extractedKeywords});    
                      } else {
                        _newsAddedCallback(err, null);
                      }
                    });
                  } else {
                    console.log("error occoured during fetching detailed news data.");
                  }
                });
                }, randomInt (500, 3000));
                */
                
                
                
                
              } else {
                //That news is already fetched. Just ignore it.
              }
            });
          } else {
            callback(err, null);
          }

        });
      }, _fetchIntervalInMinutes * 60 * 500);
      callback(null, result);
    });
  },
  setNewsAddedCallback: function(newsAddedCallback){
    _newsAddedCallback = newsAddedCallback;
  }
};