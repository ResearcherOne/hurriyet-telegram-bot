const appConfig = {
  hurriyetApiKey: "3d6c4857fdff4fa58051493e20da9050",
  fetchLimit: 10,
  fetchIntervalInMinutes: 1
};

const Hurriyet          = require('hurriyet');
const hurriyetApi       = new Hurriyet(appConfig.hurriyetApiKey);
const newsStorageModule = require('./lib/newsStorageModule.js');

function removeOldNews() {
  
}

let fetchLatestNewsTask = setInterval(function() {
  hurriyetApi.Articles.getAll({limit:appConfig.fetchLimit},function(err, result) {
    if(!newsStorageModule.isOldNews()) {
      //fetchNewsWithId
      //extractKeywords
      //addNews(newsData, extractedKeywords)
        //processedNews
      //extractedKeywords.forEach
        //if(keywordExists)
          //notifyUsers
        
    } else {
      //that news is already fetched.
    }

  });
}, appConfig.fetchIntervalInMinutes * 60 * 1000);