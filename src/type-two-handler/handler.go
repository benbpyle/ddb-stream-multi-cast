package main

import (
	"context"
	"strconv"

	"os"

	"github.com/aws/aws-lambda-go/lambda"

	log "github.com/sirupsen/logrus"
)

var (
	isLocal bool
)

func handler(ctx context.Context, e interface{}) (interface{}, error) {
	log.WithFields(log.Fields{
		"body": e,
	}).Debug("Printing out the body")

	return e, nil

}

func main() {
	lambda.Start(handler)
}

func init() {
	isLocal, _ = strconv.ParseBool(os.Getenv("IS_LOCAL"))

	log.SetFormatter(&log.JSONFormatter{
		PrettyPrint: isLocal,
	})

	setLevel(os.Getenv("LOG_LEVEL"))
}

func setLevel(level string) {
	//	_ = os.Setenv("LOG_LEVEL", "debug")
	switch level {
	case "error":
		log.SetLevel(log.ErrorLevel)
	case "info":
		log.SetLevel(log.InfoLevel)
	case "debug":
		log.SetLevel(log.DebugLevel)
	case "trace":
		log.SetLevel(log.TraceLevel)
	default:
		log.SetLevel(log.DebugLevel)
	}
}
