package main

import (
	"strconv"
	"strings"
)

func dayOnePartOne(input string) int {
	shiftStrings := strings.Split(input, ", ")
	result := 0

	for _, shift := range shiftStrings {
		num, _ := strconv.Atoi(shift)
		result += num
	}
	return result
}

func dayOnePartTwo(input string) int {
	shiftStrings := strings.Split(input, ", ")
	occurances := make(map[int]bool)
	result := 0
	i := 0
	for {
		if occurances[result] == true {
			return result
		}
		occurances[result] = true
		num, _ := strconv.Atoi(shiftStrings[i])
		result += num
		i = (i + 1) % len(shiftStrings)
	}
	return -1
}
