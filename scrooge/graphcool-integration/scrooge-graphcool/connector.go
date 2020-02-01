package main

import (
	"github.com/machinebox/graphql"
	log "github.com/sirupsen/logrus"
	"math/big"
)

// Connector connects to the DB backend
type Connector struct {
	client *graphql.Client
	url    string
}

// NewAPI returns a new Connector client
func NewConnector() *Connector {
	client := graphql.NewClient(graphcoolURL)
	return &Connector{url: graphcoolURL, client: client}
}

// GetBalance from the graphcool backend
func (c *Connector) AddTransaction(userID int, amount *big.Rat, note string) {
	log.WithField("url", graphcoolURL)
}
