sendgrid = require('sendgrid')('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')
request = require 'request'
moment = require 'moment-timezone'
mong=require('../routes/emailSchema');
mongoose = require 'mongoose'
Emails = mong.autoreply
mongoose.connect('mongodb://vyomesh:awesome123@proximus.modulusmongo.net:27017/iz6atywA')

exports.sendEmail = (name, from, propertyID, managerNumber) ->
  replyTo = from
  propertyURL = 'http://onerent.co/api/property/' + propertyID
  request propertyURL, (err, res, body) ->
    if err
      console.log err
    else
      property = JSON.parse body
      bedrooms = property.bedrooms
      bathrooms = property.bathrooms
      showtimes = 'Please schedule a showtime here: http://onerent.co/property/' + propertyID
      leaseLength = property.leaseTermMonths
      rent = '$' + property.monthlyRent
      deposit = '$' + property.deposit
      parkingOptions = property.features.parking #array
      if property.requiredIncomeMultiplier
        incomeRequirement = '$' + property.monthlyRent*property.requiredIncomeMultiplier
      else
        incomeRequirement = '$' + property.monthlyRent*2.5
      address = property.street + ", " + property.city + " " + property.zip
      availableDate = property.availableDate
      browseURL = 'http://onerent.co/property/' + property.id
      catPolicy = 'Not allowed'
      if property.petPolicy.catsAllowed is true
        catPolicy = 'Allowed'
      dogPolicy = 'Not allowed'
      if property.petPolicy.dogsAllowed is true
        dogPolicy = 'Allowed'
      utilities = []
      for i of property.features.utiliesPaidByOwner
        utilities.push property.features.utiliesPaidByOwner[i]
      if utilities.length is 0
        utilities = 'None'
      else
        utilities = utilities.join(', ')  
      emailReply = new sendgrid.Email
        to: replyTo
        from: 'pm@onerent.co'
        fromname: 'OneRent'
        subject: 'Thank you for your interest in OneRent!'
        text: ' '

      emailReply.setFilters
        'templates':
          'settings':
            'enable': 1
            'template_id': '635c1f0f-1617-405f-b178-00940cd658fa'

      #emailReply.addSubstitution ':name', 'Andrew'
      emailReply.smtpapi.header.sub =
        ':name': [name]
        ':bedrooms': [bedrooms]
        ':bathrooms': [bathrooms]
        ':address': [address]
        ':showingtimes': [showtimes]
        ':leaseLength': [leaseLength]
        ':parkingOptions': [parkingOptions.join(', ')]
        ':rent': [rent]
        ':deposit': [deposit]
        ':income': [incomeRequirement]
        ':propertyURL': [browseURL]
        ':cats': [catPolicy]
        ':dogs': [dogPolicy]
        ':utilities': [utilities]
        ':managerNumber': [managerNumber]
        ':availableDate': [availableDate]

      sendgrid.send emailReply, (err, json) ->
        if err
          console.log err
        console.log json
        replyLog = new Emails()
        replyLog.sentTo = name + ': ' + from
        replyLog.timeSent = new Date 
        replyLog.messageStatus = json.message
        replyLog.save (err) ->
          if err
            console.log err
          else
            console.log 'Email logged'

