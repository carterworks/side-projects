BINARY_DIR=bin
BINARY_NAME=main
ENTRYPOINT=src/main.go
 
all: build test
 
build:
	go build -o ${BINARY_DIR}/${BINARY_NAME} ${ENTRYPOINT}

build_all:
	GOARCH=amd64 GOOS=darwin go build -o ${BINARY_DIR}/${BINARY_NAME}-darwin ${ENTRYPOINT}
	GOARCH=amd64 GOOS=linux go build -o ${BINARY_DIR}/${BINARY_NAME}-linux ${ENTRYPOINT}
	GOARCH=amd64 GOOS=window go build -o ${BINARY_DIR}/${BINARY_NAME}-windows.exe ${ENTRYPOINT}
 
test:
	go test -v ./...
 
run:
	go build -o ${BINARY_DIR}/${BINARY_NAME} ${ENTRYPOINT}
	./${BINARY_DIR}/${BINARY_NAME} 
 
clean:
	go clean
	rm -r ${BINARY_DIR}