BINARY_DIR=bin
BINARY_NAME=main
 
all: build test
 
build:
	go build -o ${BINARY_DIR}/${BINARY_NAME} main.go

build_all:
	GOARCH=amd64 GOOS=darwin go build -o ${BINARY_DIR}/${BINARY_NAME}-darwin main.go
	GOARCH=amd64 GOOS=linux go build -o ${BINARY_DIR}/${BINARY_NAME}-linux main.go
	GOARCH=amd64 GOOS=window go build -o ${BINARY_DIR}/${BINARY_NAME}-windows.exe main.go
 
test:
	go test -v ./...
 
run:
	go build -o ${BINARY_DIR}/${BINARY_NAME} main.go
	./${BINARY_DIR}/${BINARY_NAME} 
 
clean:
	go clean
	rm -r ${BINARY_DIR}