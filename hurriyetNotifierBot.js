const appConfig = {
  hurriyetApiKey: "3d6c4857fdff4fa58051493e20da9050",
  fetchLimit: 5,
  fetchIntervalInMinutes: 1,
  newsIdCollection: "newsIdCollection", 
  newsDataCollection: "newsDataCollection",
  
  keywordListName:      "keywordList",        //chatter
  notificationListName: "notificationLists",  //chatter
  userCollectionName:   "userCollection",     //chatter
  
  
  mongoUrl: "mongodb://umut:yoyo123@ds145128.mlab.com:45128/hurriyet-hao",
  telegramApiKey: "316839828:AAGQ_zU14CB-iQ36X10e4bH28v20MVkT_kc"
};

var chatterModule  = require("./lib/chatterModule");
var hurriyetModule = require("./lib/hurriyetModule");

let latestNewsRequestReceivedCallback = function(userId) {
  var maxNewsCount = 3;
  hurriyetModule.getLatestNews(maxNewsCount, function(err, result){
    if(!err) {
      let message = "Gündemden "+result.length+" haber:";
      chatterModule.sendMessageToUser(userId,message);  
      result.forEach(function(newsData){
        setTimeout(function(){
          chatterModule.sendMessageToUser(userId,"\n " + newsData.Url);
        },100);
      });
    } else {
      chatterModule.sendMessageToUser(userId,"Oops, sistemde bir hata oluştu :(");
    }
  })
};

let fetchRequestReceivedCallback = function(newsCount) {
  hurriyetModule.cacheLatestNews(newsCount);
  console.log("newsCount "+newsCount+" is going to be fetched");
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function notifyAllRelatedUsers(keyword, url){
  chatterModule.getNotificationList(keyword, function(err, notificationList){
        if(!err) {
          var message = keyword + " hakkinda yeni bir haber buldum. \n" + url;
          notificationList.forEach(function(userId) {
            var delayMillis = randomInt(500, 5000);
            setTimeout(function() {
              console.log("userId: "+userId+ " " + message);
              chatterModule.sendMessageToUser(userId, message);
            }, delayMillis);
          });
        } else {
          throw err;
        }
      });
}

var newsAddedCallback = function(err, result){
  var newsData          = result.newsData;
  var newsDescription   = newsData.Description;
  var newsTitle         = newsData.Title;
  
  chatterModule.pushAdminNotification("Yeni bir haber sisteme eklendi, "+newsTitle);
  var userKeywords = chatterModule.getUserKeywords();
  userKeywords.forEach(function(userKeyword) {
    if(newsDescription.includes(userKeyword) || newsTitle.includes(userKeyword)) {
      notifyAllRelatedUsers(userKeyword, newsData.Url);
    }
  });
};

chatterModule.initializeModule(appConfig.telegramApiKey, appConfig.mongoUrl, appConfig.notificationListName, appConfig.keywordListName, appConfig.userCollectionName, function(err, result) {
  if(!err) {
    hurriyetModule.initializeModule(appConfig.mongoUrl,appConfig.hurriyetApiKey, appConfig.fetchIntervalInMinutes, appConfig.fetchLimit, appConfig.newsIdCollection, appConfig.newsDataCollection, function(err, result) {
      if(!err) {
        if(newsAddedCallback) {
          hurriyetModule.setNewsAddedCallback(newsAddedCallback);
          chatterModule.setLatestNewsRequestReceivedCallback(latestNewsRequestReceivedCallback);
          chatterModule.setFetchRequestReceivedCallback(fetchRequestReceivedCallback);
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