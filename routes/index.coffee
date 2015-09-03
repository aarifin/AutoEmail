express = require("express")
request = require 'request'
cheerio = require 'cheerio'
reply = require '../controllers/reply'
vow = require 'vow'
router = express.Router()

# GET home page. 
router.get "/", (req, res, next) ->
  res.render "index",
    title: "Super Uber Awesome OneRent Autoreply Email Service"

getPostingBody = (url) ->
  deferred = vow.defer()
  request url, (err, response, html) ->
    $ = cheerio.load html

    $('#postingbody').filter () ->
      data = $(this)
      postingBody = data.html()
      deferred.resolve postingBody
  return deferred.promise()


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
  URL = text.match("http(.*)html")[0]
  if (/craigslist/.test fromDomain) and !(/robot/.test from)
    console.log 'This is from Craigslist'
    getPostingBody(URL).then (postingBody) ->
      request 'http://www.onerent.co/api/property/availableproperties', (err, res, body) ->
        propertyList = JSON.parse body
        replyTest = /Section 8/.test text
        for i of propertyList
          street = propertyList[i].street
          street = street.split(' ')[1]
          apiStreet = RegExp(street)
          streetTest = apiStreet.test postingBody
          if (streetTest) and (replyTest is false)
            console.log apiStreet
            propertyID = propertyList[i].id
            managerID = propertyList[i].managerId
            if managerID is "557779495bf385030060c196"
              managerNumber = '(925) 596-1308'
              console.log 'This is Ray'
            if managerID is '558b429c112fa403006fe0f1'
              managerNumber = '(669) 251-9324'
              console.log 'This is Matt'
            if managerID is '55d29096f467c60300e841cb'
              managerNumber = '(415) 595-9585'
              console.log 'This is Clay'
            if managerID is '55dba1d760d8a303000873e3'
              managerNumber = '(408) 420-0758'
              console.log 'This is Justin'
            if managerID is '55d231e969a6050300429048'
              managerNumber = '(805) 722-9637'
              console.log 'This is Dylan'
            if managerID is '55a06b2f1c5c49030076d481'
              managerNumber = '(512) 749-8696'
              console.log 'This is Tucker'
            console.log propertyID
          #   reply.sendEmail fromName, fromAddress, propertyID, managerNumber

  else if (/zillow/.test fromDomain) or (/trulia/.test fromDomain)
    if  /trulia/.test fromDomain
      fromAddress = text.match("Email: (.*);")[1]
      fromName = text.match("From: (.*) ")[1]
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
          if managerID is '55d29096f467c60300e841cb'
            managerNumber = '(415) 595-9585'
            console.log 'This is Clay'
          if managerID is '55dba1d760d8a303000873e3'
            managerNumber = '(408) 420-0758'
            console.log 'This is Justin'
          if managerID is '55d231e969a6050300429048'
            managerNumber = '(805) 722-9637'
            console.log 'This is Dylan'
          if managerID is '55a06b2f1c5c49030076d481'
            managerNumber = '(512) 749-8696'
            console.log 'This is Tucker'
          console.log 'Reply sent to: ' + fromAddress
          console.log 'Property ID: ' + propertyID
          reply.sendEmail fromName, fromAddress, propertyID, managerNumber
  res.end()

module.exports = router