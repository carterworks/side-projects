package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	discordAuthToken := os.Getenv("DISCORD_TOKEN")
	runBot(discordAuthToken)
}

func loadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}
