var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function(bot) {
  return function(msg, match) {
    console.log(msg.text);
    
    bot.sendPhoto(msg.chat.id, 'https://s.iw.ro/gateway/g/ZmlsZVNvdXJjZT1odHRwcyUzQSUyRiUy/RnMuaXcucm8lMkZnYXRld2F5JTJGZyUy/RlptbHNaVk52ZFhKalpUMW9kSFJ3SlRO/QkpUSkdKVEpHJTJGYzNSdmNtRm5aVEEz/ZEhKaGJuTmpiMlJsY2k1eVkzTXQlMkZj/bVJ6TG5KdkpUSkdjM1J2Y21GblpTVXlS/akl3TVRjbCUyRk1rWXdNaVV5UmpJeEpU/SkdOelF6T0RnMlh6YzBNemc0JTJGTmw5/MmFXNTBkUzFtWWk1cWNHY21kejAzT0RB/bWFEMDAlMkZOREFtYUdGemFEMWtPRGhp/TlRSaFl6Y3hZak5rTWpVMVlUZzBaRGxp/TmpnMFptWXhNalJrT0ElM0QlM0QudGh1/bWIuanBnJnc9ODAwJmhhc2g9YWIyNzg3/OWEzMDc4Yjc0Y2E0NmE0OGMyYzYwNzQ3NmE=.thumb.jpg', {
      caption: 'N-AM!'
    });
  };
};

module.exports = Command;
