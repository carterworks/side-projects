GOCMD=go
BUILD_OUTPUT=build/ftfybot
BUILD_ARGS=-v -o $(BUILD_OUTPUT)

all: build

build:
	$(GOCMD) build $(BUILD_ARGS)

clean: 
	rm $(BUILD_OUTPUT)

install:
	$(GOCMD) install
