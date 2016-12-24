const appConfig = {
  hurriyetConfig: {
  },
  chatterConfig: {
    storageConfig: {
      url: "mongodb://umut:yoyo123@ds145128.mlab.com:45128/hurriyet-hao",
      collectionName: "notificationLists",
      userCollection: 
    },
    telegram: {
      telegramApiKey: "315275698:AAF6ED0BY4P2n8PiT0FsddkLREaXLpbxFS0"
    }
  }
};

var chatterModule = require("./lib/chatterModule");
var hurriyetModule = require("./lib/hurriyetModule");

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var newsAddedCallback = function(newsData, extractedKeywords){
  var userKeywords = chatterModule.getUserKeywords();
  extractedKeywords.forEach(function(extractedKeyword){
    if (userKeywords.indexOf(extractedKeyword) > -1) {
      chatterModule.getNotificationList(extractedKeyword, function(err, notificationList){
        if(!err) {
          var message = extractedKeyword + " hakkinda yeni bir haber buldum. \n" + newsData.Url;
          notificationList.forEach(function(userId) {
            var delayMillis = randomInt(500, 5000);
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

chatterModule.initializeModule(appConfig.chatterConfig,function(err, result) {
  if(!err) {
    hurriyetModule.initializeModule(appConfig.hurriyetConfig, function(err, result) { //fetchIntervalInMins, 
      if(!err) {
        hurriyetModule.setNewsAddedCallback(newsAddedCallback);
        console.log("Application is started.");
      } else {
        throw err;
      }
    });
  } else {
    throw err;
  }
});