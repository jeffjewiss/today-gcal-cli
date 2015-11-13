#! /usr/bin/env node
'use strict';

const async = require('async')
const chalk = require('chalk')
const columnify = require('columnify')
const request = require('request')
const ical = require('ical')
const URL = require('url')

const conf = require('rc')('todaygcal', {
  columnSplitter: ' | ',
  timeFormat: {
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }
})

const valid = url => {
  let parsedUrl = URL.parse(url)
  return parsedUrl.protocol && parsedUrl.host
}

const printEvents = events => {
  if (events.length < 1) {
    return console.log(chalk.dim('You have no events scheduled today, time to relax!'))
  }

  console.log(columnify(events.map(event => {
    return {
      time: event.start.toLocaleTimeString('en-CA', conf.timeFormat),
      title: chalk.bold.blue(event.summary),
      location: chalk.yellow(event.location),
      calendar: chalk.gray(event.calendarName || '')
    }
  }), {
    columnSplitter: conf.columnSplitter
  }))
}

module.exports = function() {
  if (!conf.calendars || Object.keys(conf.calendars).length < 1) {
    console.log(chalk.red('Please define at least one calendar .ics URL in your .todaygcalrc file under the calendars property:\n\n[calendars]\n  home = <url>'))
    return false
  }

  const now = Date.now()
  const oneHour = 1000 * 60 * 60
  const oneDay = oneHour * 24
  const calendarNames = Object.keys(conf.calendars)
  const url = conf.calendars[calendarNames[0]]
  let eventsToPrint = []

  async.parallel(calendarNames.map(calendarName => {
    return (callback) => {
      request(conf.calendars[calendarName], (error, request, body) => {
        if (error) {
          console.log(chalk.red('Sorry, there was an error requesting you calendar:\n' + error))
          return callback(error)
        }

        let cal = ical.parseICS(body)
        let events = Object.keys(cal)
        .filter(function (key) {
          let event = cal[key]
          return event.summary && event.start > now-oneHour && event.start < now+oneDay
        })
        .map(function (key) {
          cal[key].calendarName = calendarName
          return cal[key]
        })

        callback(null, events)
      })
    }
  }),
  (error, results) => {
    results.forEach(eventList => {
      eventsToPrint = eventsToPrint.concat(eventList)
    })

    eventsToPrint.sort((e1, e2) => {
      return e1.start - e2.start
    })

    printEvents(eventsToPrint)
  })
}()
