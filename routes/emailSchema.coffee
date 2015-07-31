mongoose = require 'mongoose'
connection = mongoose.createConnection('mongodb://vyomesh:awesome123@proximus.modulusmongo.net:27017/iz6atywA')
emailSchema = mongoose.Schema

autoReplySchema = new emailSchema(
  sentTo: String
  timeSent: String
  messageStatus: String
  )

mongoose.model 'EmailReplies', autoReplySchema
module.exports.autoreply = mongoose.model('EmailReplies')

