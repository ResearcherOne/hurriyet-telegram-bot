const Hurriyet          = require('hurriyet');
const newsStorageModule = require('./newsStorageModule.js');
let hurriyetApi;

let _fetchLimit;
let _fetchIntervalInMinutes;
let _newsAddedCallback;

function extractKeywordsFromNews(detailedNewsData) {
  console.log("\n Description: "+detailedNewsData.Description);
  return detailedNewsData.Description.split(" ");
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

let fetchLatestNews = function() {
  hurriyetApi.Articles.getAll({limit:_fetchLimit}, function(err, result) {
    if(!err) {
      if(result) {
        result.forEach(function(newsData){
          const newsId = newsData.Id;
          if(!newsStorageModule.isOldData(newsId)) {
            var extractedKeywords = extractKeywordsFromNews(newsData);
            newsStorageModule.addNews(newsData, extractedKeywords, function(err, result){
              if(!err) {
                _newsAddedCallback(null, {"newsData": newsData, "extractedKeywords": extractedKeywords});    
              } else {
                _newsAddedCallback(err, null);
              }
            });         
          } else {
            //That news is already fetched. Just ignore it.
          }
        });
      } else {
        console.log("There is something wrong with the result: "+JSON.stringify(result));
      }
    } else {
      console.log("Error occoured!");
    }
  });
};

module.exports = {
  initializeModule: function(mongoUrl, hurriyetApiKey, fetchIntervalInMinutes, fetchLimit, newsIdCollection, newsDataCollection, callback) {
    hurriyetApi             = new Hurriyet(hurriyetApiKey);
    _fetchIntervalInMinutes = fetchIntervalInMinutes;
    _fetchLimit             = fetchLimit;
    
    newsStorageModule.initializeModule(mongoUrl, newsIdCollection, newsDataCollection, function(err, result){
      if(!err) {
        let fetchLatestNewsTask = setInterval(function() {
          fetchLatestNews();
            }, _fetchIntervalInMinutes * 60 * 500);
        
        
        
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  },
  setNewsAddedCallback: function(newsAddedCallback){
    _newsAddedCallback = newsAddedCallback;
  },
  getLatestNews: function(newsCount, callback) {
    hurriyetApi.Articles.getAll({limit:newsCount}, callback);
  },
  cacheLatestNews: function(newsCount){
    _fetchLimit = newsCount;
    fetchLatestNews()
  }
};