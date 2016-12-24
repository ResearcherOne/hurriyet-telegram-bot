const appConfig = {
  hurriyetApiKey: "3d6c4857fdff4fa58051493e20da9050",
  fetchLimit: 10,
  fetchIntervalInMinutes: 1,
  newsIdCollection: "newsIdCollection", 
  newsDataCollection: "newsDataCollection",
  
  keywordListName: "keywordList",             //chatter
  notificationListName: "notificationLists",  //chatter
  
  
  mongoUrl: "mongodb://umut:yoyo123@ds145128.mlab.com:45128/hurriyet-hao",
  telegramApiKey: "315275698:AAF6ED0BY4P2n8PiT0FsddkLREaXLpbxFS0"
};

var chatterModule  = require("./lib/chatterModule");
var hurriyetModule = require("./lib/hurriyetModule");

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var newsAddedCallback = function(err, result){
  console.log("hurriyetNotifierBot - newsAddedCallback")
  var newsData          = result.newsData;
  var extractedKeywords = result.extractedKeywords;
  console.log("HERE EXTRACTED KEYWORDS: "+JSON.stringify(extractedKeywords));
  var userKeywords = chatterModule.getUserKeywords();
  extractedKeywords.forEach(function(extractedKeyword){
    if (userKeywords.indexOf(extractedKeyword) > -1) {
      console.log("hurriyetNotifierBot - getNotificationList 1")
      chatterModule.getNotificationList(extractedKeyword, function(err, notificationList){
        console.log("hurriyetNotifierBot - getNotificationList 2")
        if(!err) {
          var message = extractedKeyword + " hakkinda yeni bir haber buldum. \n" + newsData.Url;
          notificationList.forEach(function(userId) {
            var delayMillis = randomInt(500, 5000);
            console.log("YEYAAAAAAAAA!!!");
            setTimeout(function() {
              chatterModule.sendMessageToUser(userId, message);
            }, delayMillis);
          });
        } else {
          throw err;
        }
      });
    }
  });
};

chatterModule.initializeModule(appConfig.telegramApiKey, appConfig.mongoUrl, appConfig.notificationListName, appConfig.keywordListName ,function(err, result) {
  if(!err) {
    hurriyetModule.initializeModule(appConfig.mongoUrl,appConfig.hurriyetApiKey, appConfig.fetchIntervalInMinutes, appConfig.fetchLimit, appConfig.newsIdCollection, appConfig.newsDataCollection, function(err, result) {
      if(!err) {
        if(newsAddedCallback) {
          hurriyetModule.setNewsAddedCallback(newsAddedCallback);
        } else {
          throw new Error("DAFFFFUQ");
        }
        console.log("Application is started.");
      } else {
        throw err;
      }
    });
  } else {
    throw err;
  }
});