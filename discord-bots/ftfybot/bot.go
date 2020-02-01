package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/bwmarrin/discordgo"
)

// runBot runs the discord bot
func runBot(token string) {
	discord, err := discordgo.New("Bot " + token)
	if err != nil {
		log.Fatal("error creating Discord session,", err)
		return
	}
  
	// FIXME: Make configurable through a mention and commands
	addWord("Mormon", "Member of the Church of Jesus Christ of Latter-Day Saints")
	addWord("alot", "a lot")
	addWord("MoTab", "TabCats")
  
	openConnection(discord)
	defer closeConnection(discord)
	addHandlers(discord)

	// Wait here until CTRL-C or other term signal is received.
	log.Print("Bot is now running.  Press CTRL-C to exit.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
	<-sc
}

// addHandlers adds the event listeners to the different discord events, such
// as MessageCreate. Each handler should be an anonmyous function that
// calls the route function on a new thread.
func addHandlers(discord *discordgo.Session) {
	discord.AddHandler(func(s *discordgo.Session, m *discordgo.MessageCreate) {
		go routeMessageCreate(s, m)
	})
	log.Print("Added handler for MessageCreate")
}

// closeConnection cleanly closes down the Discord session.
func closeConnection(discord *discordgo.Session) {
	discord.Close()
	log.Print("Closed connection to Discord")
}

// openConnection opens a websocket connection with discord
func openConnection(discord *discordgo.Session) {
	err := discord.Open()
	if err != nil {
		log.Fatal("error opening connection,", err)
		return
	}
	log.Print("Opened discord connection")
}

// routeMessageCreate handles all the possible operations when a message is created
func routeMessageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	// Ignore all messages created by the bot itself
	if m.Author.ID == s.State.User.ID {
		return
	}
	log.Printf("Received a message")
	hasReplacement, message := handleMessage(m.Content)
	if hasReplacement {
		log.Print("Message needs replacing")
		message = fmt.Sprintf("%v I think you meant:\n%v", m.Author.Mention(), message)
		_, err := s.ChannelMessageSend(m.ChannelID, message)
		if err != nil {
			log.Fatal("error sending message", err)
		}
		log.Print("Sent message with replacement")
	}
}
