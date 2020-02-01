package main

import (
	"flag"
	log "github.com/sirupsen/logrus"
)

var token string
var debugMode bool
var interval int
var graphcoolURL string

func init() {
	flag.StringVar(&token, "token", "", "Telegram Bot API token. Required")
	flag.BoolVar(&debugMode, "debug", false, "Debug mode. Default: false")
	flag.IntVar(&interval, "interval", 60, "Interval to poll for updates. Default: 60")
	flag.StringVar(&graphcoolURL, "url", "", "The URL to the graphcool backend. Required")

	flag.Parse()
	if token == "" {
		log.Panic("-token is required")
	}
	if graphcoolURL == "" {
		log.Panic("-url is required")
	}
}

func main() {
	b, err := NewBot(token, debugMode, interval)
	if err != nil {
		log.WithError(err).Fatal("Failed to initialize Scrooge")
	}
	log.Info("Starting Scrooge...")

	err = b.Start()
	if err != nil {
		log.WithError(err).Fatal("Failed to start Scrooge")
	}
}
