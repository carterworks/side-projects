package main

import (
	"strings"
)

func dayTwoPartOne(input string) int {
	ids := strings.Split(input, ", ")
	occuresTwice, occuresThrice := 0, 0

	for _, id := range ids {
		letterToCount := make(map[string]int)
		for _, char := range strings.Split(id, "") {
			letterToCount[char]++
		}
		countToLetter := make(map[int][]string)
		for letter, count := range letterToCount {
			letters := countToLetter[count]
			letters = append(letters, letter)
			countToLetter[count] = letters
		}
		if _, thriceExists := countToLetter[3]; thriceExists {
			occuresThrice++
		}

		if _, twiceExists := countToLetter[2]; twiceExists {
			occuresTwice++
		}
	}

	return occuresTwice * occuresThrice
}

func dayTwoPartTwo(input string) string {
	a := strings.Split(input, ", ")

	for i := range a {
		for j := i + 1; j < len(a); j++ {
			first := strings.Split(a[i], "")
			second := strings.Split(a[j], "")

			differences := -1

			for index, char := range first {
				if char != second[index] {
					if differences == -1 {
						differences = index
					} else {
						differences = -1
						break
					}
				}
			}
			if differences != -1 {
				return strings.Join(append(first[:differences], first[differences+1:]...), "")
			}
		}
	}
	return ""
}
