package main

import (
	"testing"
)

func test(t *testing.T, input, expected interface{}, partTested string) {
	if input != expected {
		t.Errorf("%s:, Result was incorrect, got: %v, want: %v", partTested, input, expected)
	}
}

type testCase struct {
	input    string
	expected interface{}
}
