package main

import (
	"errors"
	"fmt"
	tg "github.com/go-telegram-bot-api/telegram-bot-api"
	"github.com/leekchan/accounting"
	"math/big"
	"regexp"
	"strings"
)

// Bot is a BotAPI (https://godoc.org/github.com/go-telegram-bot-api/telegram-bot-api#BotAPI) coupled with an UpdateConfig (https://godoc.org/github.com/go-telegram-bot-api/telegram-bot-api#UpdateConfig)
type Bot struct {
	*tg.BotAPI
	UpdateConfig   *tg.UpdateConfig
	Ledger         *Ledger
	moneyFormatter *accounting.Accounting
}

// NewBot generates a new Telegram Bot
func NewBot(token string, debug bool, interval int) (*Bot, error) {
	bot, err := tg.NewBotAPI(token)
	if err != nil {
		return nil, err
	}
	bot.Debug = debug

	updateConfig := tg.NewUpdate(0)
	updateConfig.Timeout = interval

	ac := accounting.DefaultAccounting("$", 2)
	l := NewLedger()

	return &Bot{
		BotAPI:         bot,
		UpdateConfig:   &updateConfig,
		Ledger:         l,
		moneyFormatter: ac,
	}, nil
}

// Start the bot and commence receiving updates
func (b *Bot) Start() error {
	ch, err := b.getUpdatesChan()
	if err != nil {
		return err
	}

	for u := range ch {
		if u.Message == nil {
			continue
		}

		if !u.Message.IsCommand() {
			continue
		}
		err = b.processCommand(&u)

		if err != nil {
			return err
		}
	}

	return nil
}

func (b *Bot) getUpdatesChan() (tg.UpdatesChannel, error) {
	ch, err := b.BotAPI.GetUpdatesChan(*b.UpdateConfig)
	if err != nil {
		return nil, err
	}

	return ch, nil
}

func (b *Bot) processCommand(c *tg.Update) error {
	switch c.Message.Command() {
	case "expense":
		return b.expense(c)
	case "income":
		return b.income(c)
	case "balance":
		return b.balance(c)
	case "delete":
		return b.delete(c)
	}

	return nil
}

func (b *Bot) expense(c *tg.Update) error {
	args := c.Message.CommandArguments()

	amount, _, err := b.parseArgs(args)
	if err != nil {
		return b.send(c.Message.Chat.ID, "I didn't understand that. Is there really any money in there?")
	}

	userID := c.Message.From.ID

	balance := b.Ledger.Subtract(userID, amount)

	message := fmt.Sprintf("📉 New balance: %s", b.moneyFormatter.FormatMoney(balance))
	return b.send(c.Message.Chat.ID, message)
}

func (b *Bot) income(c *tg.Update) error {
	args := c.Message.CommandArguments()

	amount, _, err := b.parseArgs(args)
	if err != nil {
		return b.send(c.Message.Chat.ID, "I didn't understand that. Is there really any money in there?")
	}

	userID := c.Message.From.ID

	balance := b.Ledger.Add(userID, amount)

	message := fmt.Sprintf("📈 New balance: %s", b.moneyFormatter.FormatMoney(balance))
	return b.send(c.Message.Chat.ID, message)
}

func (b *Bot) balance(c *tg.Update) error {
	userID := c.Message.From.ID

	balance := b.Ledger.GetBalance(userID)

	message := fmt.Sprintf("💵 Balance is %s", b.moneyFormatter.FormatMoney(balance))
	return b.send(c.Message.Chat.ID, message)
}

func (b *Bot) delete(c *tg.Update) error {
	userID := c.Message.From.ID

	b.Ledger.Delete(userID)

	message := fmt.Sprintf("❌ Deleted all transaction history and reset balance")
	return b.send(c.Message.Chat.ID, message)
}

func (b *Bot) parseArgs(args string) (*big.Rat, string, error) {
	amountMatcher := regexp.MustCompile(`^\$?[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?`)

	if !amountMatcher.MatchString(args) {
		return nil, "", errors.New("Message has no currency value")
	}

	amountStr := strings.TrimSpace(amountMatcher.FindString(args))
	amountStr = regexp.MustCompile(`\$`).ReplaceAllString(amountStr, "")
	note := strings.TrimSpace(amountMatcher.ReplaceAllString(args, ""))

	amount := new(big.Rat)
	amount.SetString(amountStr)

	return amount, note, nil
}

func (b *Bot) send(channelID int64, msgText string) error {
	msg := tg.NewMessage(channelID, msgText)
	if _, err := b.Send(msg); err != nil {
		return err
	}
	return nil
}
