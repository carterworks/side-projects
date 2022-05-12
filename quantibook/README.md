# Quantibook—A journal for quantifiable events

Have you ever wanted to track the number of pushups you do in a week (that one is easy: 0)? What about the number of tacos you eat in a year (I’m afraid to count it) or the last time you saw *Napolean Dynamite* (2 years ago?)? Maybe you want to track the overall trend of your daily crossword completion time. For all these events, Quantibook helps you keep track of them.

Quantibook is designed to keep track of “quantifiable events”. What does that mean? It’s something that happened that has an associated number. Inspired by the [“quantified self” movement](https://en.wikipedia.org/wiki/Quantified_self) and [Reddit’s /r/DataIsBeautiful community](https://www.reddit.com/r/DataIsBeautiful), Quantibook is a generic system for all of life’s little numbers.

Is this just [InfluxDB](https://www.influxdata.com/) and [Grafana](https://grafana.com/) for humans? Absolutely. If you want to use those, go ahead. Quantibook is aimed at a much smaller, more personal scale that is easier to set up.

## Goals:

* Speed. It should be quick and easy to create a new journal entry. If it takes a long time, people are less likely to do it. Minimize the time-to-entry as much as possible.
* Portablity. Let’s face it: trends and technologies come and go. At some point, Quantibook will fall by the wayside. Data shouldn’t be trapped inside Quantibook. It should be exportable in a standardized format. Since the world runs on spreadsheets, that format is CSV.
* Ease of access. Related to “speed”, if it takes a long time to create an entry, people are less likely to create them. That's why Quantibook should meet people where they are and offer a multitude of interfaces to entering and reacting with data like a CLI interface, a REST API, and a web app (and maybe a mobile app, if the web app isn’t enough for mobile users).
