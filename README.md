today-gcal-cli
==============

Check a number of Google calendars for the day’s events from your command line.

CLI Usage
---------

```console
$ today-gcal

TIME      | TITLE                   | LOCATION | CALENDAR
12:00 EST | Lunch with Jane         | Lakeview | Personal
14:30 EST | Brainstorming session   |          | Work
```

Installation
------------

    $ npm install -g @jeffjewiss/today-gcal-cli

Configuration
-------------

Create a `.todaygcalrc` file in your home directory. It should contain at least 1 private .ics URL for a calendar:

```
[calendars]
  work = <.ics URL>
```

License
-------

MIT
