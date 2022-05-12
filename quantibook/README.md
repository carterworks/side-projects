# Quantibook—A journal for quantifiable events

Have you ever wanted to track the number of pushups you do in a week (that one is easy: 0)? What about the number of tacos you eat in a year (I’m afraid to count it) or the last time you saw *Napolean Dynamite* (2 years ago?)? Maybe you want to track the overall trend of your daily crossword completion time. For all these events, Quantibook helps you keep track of them.

Quantibook is designed to keep track of “quantifiable events”. What does that mean? It’s something that happened that has an associated number. Inspired by the [“quantified self” movement](https://en.wikipedia.org/wiki/Quantified_self) and [Reddit’s /r/DataIsBeautiful community](https://www.reddit.com/r/DataIsBeautiful), Quantibook is a generic system for all of life’s little numbers.

Is this just [InfluxDB](https://www.influxdata.com/) and [Grafana](https://grafana.com/) for humans? Absolutely. If you want to use those, go ahead. Quantibook is aimed at a much smaller, more personal scale that is easier to set up.

## Goals:

* Speed. It should be quick and easy to create a new journal entry. If it takes a long time, people are less likely to do it. Minimize the time-to-entry as much as possible.
* Portablity. Let’s face it: trends and technologies come and go. At some point, Quantibook will fall by the wayside. Data shouldn’t be trapped inside Quantibook. It should be exportable in a standardized format. Since the world runs on spreadsheets, that format is CSV.
* Ease of access. Related to “speed”, if it takes a long time to create an entry, people are less likely to create them. That's why Quantibook should meet people where they are and offer a multitude of interfaces to entering and reacting with data like a CLI interface, a REST API, and a web app (and maybe a mobile app, if the web app isn’t enough for mobile users).
* Open source. There are too many apps out there and apps die, end, or are abandoned all the time. Making an open-source project ensures that the project lives longer (or at least is usable) longer than my attention span. It also ensures the project is free.

## Non-goals

* Multiple user accounts. That's a lot of hassle that I don't want to worry about for a small, self-hosted project. Just make another category (if I decide that an event can have multiple categories).
* Hosted option. I don't want to host anything. You do it and protect it with HTTP BASIC authentication. Maybe I can be convinced to create an API key authorization flow for the API, but no more than that.

## Similar projects and alternatives

There are lots of solutions in the health area, like Apple Health, Google Fit, Strava, etc. Those are probably better if you want to track health information automatically. There are countless ones for specific niches, like diet (like [MyFitnessPal](https://www.myfitnesspal.com/)) or exercise. If a niche solutions work better for your niche, go use it. Quantibook aims to be more general.

Likewise, there are a few that integrate with third party services, like [Exist](https://exist.io/) and [Zeno](https://zenobase.com/). Integration is not a goal of Quantibook, since that would interfer with the project being open source. I don't want everyone to have to get their own API keys.

[chrono.me](https://www.chrono.me/) is also very similar (and beautiful). Go use it! It looks good! I just wanted a open-source, self-hosted product. chrono.me is hosted on Firebase and I'm not sure that I can get my data out of it.

There are several apps that do the same basic task as Quantibook. They are app-only and therefore do not fulfill Quantibook’s portability goal.
* [Reporter](http://reporter-app.com/)–An iPhone app that sends you a survey randomly throughout the day.
* [AskMeEvery](https://www.askmeevery.com/)–Get a survey question every day by email.
* [Logsit](http://www.logsit.com/)
* [LifeMetrics](https://lifemetrics.io/)
* 
