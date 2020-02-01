package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	token := os.Getenv("DISCORD_TOKEN")
	discord, err := discordgo.New("Bot " + token)
	if err != nil {
		log.Fatal("error creating Discord session,", err)
		return
	}
	err = discord.Open()
	if err != nil {
		log.Fatal("error opening connection,", err)
		return
	}
	log.Print("Opened discord connection")
	defer discord.Close()

	discord.AddHandler(onMessageCreate)

	// Wait here until CTRL-C or other term signal is received.
	log.Print("Bot is now running.  Press CTRL-C to exit.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
	<-sc
}

func onMessageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	if m.Author.ID == s.State.User.ID {
		return
	}
	message := m.Content
	log.Printf("The last char is %v", message[len(message)-1])
	if message[len(message)-1] != '?' {
		return
	}
	url := getSearch(message)
	newMessage := fmt.Sprintf("*marked as duplicate*\n%v", url)
	_, err := s.ChannelMessageSend(m.ChannelID, newMessage)
	if err != nil {
		log.Fatal("error sending message", err)
	}
}

func getSearch(message string) string {
	message = strings.Replace(message, " ", "+", -1)
	url := fmt.Sprintf("http://lmgtfy.com/?q=site%%3Astackoverflow.com+%v", message)
	return url
}
