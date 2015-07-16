express = require("express")
request = require 'request'
cheerio = require 'cheerio'
reply = require '../controllers/reply'
router = express.Router()

# GET home page. 
router.get "/", (req, res, next) ->
  res.render "index",
    title: "Super Uber Awesome OneRent Autoreply Email Servie"

router.post '/', (req, res) ->
  console.log 'message received'
  email = req.body
  from = email.from
  text = email.text
  console.log from
  fromAddress = from.match("<(.*)>")[1]
  fromDomain = from.split('@')[1]
  fromName = from.split(' ')[0]
  if /onerent/.test fromDomain #CRAIGSLIST 
    console.log 'This is from Craigslist'
    $ = cheerio.load email.html
    arrayOfLinks = []
    $('a').filter () ->
      data = $(this)
      arrayOfLinks.push data.text()
    craigsLink = arrayOfLinks[arrayOfLinks.length-3]
    #console.log craigslink
    testlink = 'http://sfbay.craigslist.org/eby/apa/5115444072.html'
    request craigsLink,(err, res, html) ->
      if err
        console.log err
      else
        propertyID = html.match('Property ID: (.*)</')[1]
        console.log propertyID
        reply.sendEmail fromName, fromAddress, propertyID

  else  
    request 'http://www.onerent.co/api/property/availableproperties', (err, res, body) ->
      propertyList = JSON.parse body
      for i of propertyList
        apiAddress = propertyList[i].street
        regex = new RegExp(apiAddress)
        if regex.test text
          propertyID = propertyList[i].id
          console.log propertyID
          reply.sendEmail fromName, fromAddress, propertyID
  res.end()



module.exports = router