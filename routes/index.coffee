express = require("express")
request = require 'request'
cheerio = require 'cheerio'
reply = require '../controllers/reply'
router = express.Router()

# GET home page. 
router.get "/", (req, res, next) ->
  res.render "index",
    title: "Super Uber Awesome OneRent Autoreply Email Service"

router.post '/', (req, res) ->
  console.log 'message received'
  email = req.body
  to = email.to
  from = email.from
  text = email.text
  console.log 'From: ' + from
  fromAddress = from.match("<(.*)>")[1]
  fromDomain = from.split('@')[1]
  fromName = from.split(' ')[0]
  if /craigslist/.test fromDomain #CRAIGSLIST 
    console.log 'This is from Craigslist'
    craigslistID = to.match("-(.*)@")[1]
    console.log craigslistID
    request 'http://www.onerent.co/api/property/availableproperties', (err, res, body) ->
      propertyList = JSON.parse body
      replyTest = /Section 8/.test text
      for i of propertyList
        apiCLID = propertyList[i].craigslistId
        if (apiCLID is craigslistID) and (replyTest is false)
          propertyID = propertyList[i].id
          managerID = propertyList[i].managerId
          if managerID is "557779495bf385030060c196"
            managerNumber = '(925) 596-1308'
            console.log 'This is Ray'
          if managerID is '558b429c112fa403006fe0f1'
            managerNumber = '(669) 251-9324'
            console.log 'This is Matt'
          console.log propertyID
          console.log managerNumber
          reply.sendEmail fromName, fromAddress, propertyID, managerNumber

  else if (/zillow/.test fromDomain) or (/trulia/.test fromDomain)
    if  /trulia/.test fromDomain
      fromName = ''
    request 'http://www.onerent.co/api/property/availableproperties', (err, res, body) ->
      propertyList = JSON.parse body
      replyTest = /Section 8/.test text
      #console.log replyTest is false
      for i of propertyList
        apiAddress = propertyList[i].street
        regex = new RegExp(apiAddress)
        if (regex.test text) and (replyTest is false)
          propertyID = propertyList[i].id
          managerID = propertyList[i].managerId
          if managerID is "557779495bf385030060c196"
            managerNumber = '(925) 596-1308'
            console.log 'This is Ray'
          if managerID is '558b429c112fa403006fe0f1'
            managerNumber = '(669) 251-9324'
            console.log 'This is Matt'
          console.log propertyID
          console.log managerNumber
          reply.sendEmail fromName, fromAddress, managerNumber
  res.end()

module.exports = router