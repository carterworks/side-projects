package main

import (
	"errors"
	"fmt"
	"log"
	"strings"
)

var (
	triggerWords = make(map[string]string)
)

// addWord adds a word to the triggerWords list
func addWord(word, replacement string) error {
	value, ok := triggerWords[word]
	if ok {
		log.Printf("word already being replace with %v", value)
		return errors.New("word already being replaced with " + value)
	}
	triggerWords[word] = replacement
	log.Printf("Added word %v, replacing with %v", word, replacement)
	return nil
}

func handleMessage(message string) (bool, string) {
	ok, wordToReplace := needsReplacement(message)
	if !ok {
		log.Print("The message no needs replacement")
		return false, ""
	}
	log.Printf("Message contains '%v'", wordToReplace)
	return true, editMessage(message, wordToReplace)
}

// needsReplacement determines if the word needs fixing.
// In other words, needsReplacement detemines if the parameter is in the list
// of words that need fixing.
func needsReplacement(message string) (bool, string) {
	for word := range triggerWords {
		if strings.Contains(message, word) {
			return true, word
		}
	}
	return false, ""
}

func editMessage(message, word string) string {
	replacement := fmt.Sprintf("~~%v~~ %v", word, triggerWords[word])
	newString := strings.Replace(message, word, replacement, -1)
	return newString
}
