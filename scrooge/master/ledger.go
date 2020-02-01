package main

import (
	"math/big"
)

// Ledger keeps track of the balance for users
type Ledger struct {
	accounts map[int]*big.Rat
}

// NewLedger produces a new ledger
func NewLedger() *Ledger {
	accounts := make(map[int]*big.Rat)
	return &Ledger{accounts: accounts}
}

// Add adds an amount to the user's account and returns the new amount
func (l *Ledger) Add(userID int, amount *big.Rat) *big.Rat {
	currentAmount, present := l.accounts[userID]
	if !present {
		currentAmount = new(big.Rat)
	}
	l.accounts[userID] = currentAmount.Add(currentAmount, amount)
	return l.GetBalance(userID)
}

// Subtract subtracts an amount from the user's account and returns the new amount
func (l *Ledger) Subtract(userID int, amount *big.Rat) *big.Rat {
	currentAmount, present := l.accounts[userID]
	if !present {
		currentAmount = new(big.Rat)
	}
	l.accounts[userID] = currentAmount.Add(currentAmount, amount)
	return l.GetBalance(userID)
}

// GetBalance gets the balance of a current user's account
func (l *Ledger) GetBalance(userID int) *big.Rat {
	currentAmount, present := l.accounts[userID]
	if !present {
		currentAmount = new(big.Rat)
		l.accounts[userID] = currentAmount
	}
	return currentAmount
}

// Delete removes a user's balance. There is no going back
func (l *Ledger) Delete(userID int) {
	delete(l.accounts, userID)
}
