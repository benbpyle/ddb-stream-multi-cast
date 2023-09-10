package main

import (
	"context"
	"fmt"
	"strconv"

	"os"

	ddlambda "github.com/DataDog/datadog-lambda-go"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	log "github.com/sirupsen/logrus"
)

var (
	isLocal bool
)

func handler(ctx context.Context, e []events.DynamoDBEventRecord) (interface{}, error) {
	log.WithFields(log.Fields{
		"body": e,
	}).Debug("Printing out the body")

	if len(e) != 1 {
		return nil, fmt.Errorf("wrong number of entries supplied")
	}

	// fhirPatient, err := buildPatientEvent(&e[0])

	// if err != nil {
	// 	log.WithFields(log.Fields{
	// 		"err": err,
	// 	}).Error("Something bad happened when building the Patient Payload")

	// 	return nil, err
	// }

	// log.WithFields(log.Fields{
	// 	"fhirPatient": fhirPatient,
	// }).Debug("Printing out the payload")

	return e[0], nil

}

func main() {
	lambda.Start(ddlambda.WrapFunction(handler, dataDogConfig()))
}

func init() {
	isLocal, _ = strconv.ParseBool(os.Getenv("IS_LOCAL"))

	log.SetFormatter(&log.JSONFormatter{
		PrettyPrint: isLocal,
	})

	setLevel(os.Getenv("LOG_LEVEL"))
}

func dataDogConfig() *ddlambda.Config {
	return &ddlambda.Config{
		DebugLogging:                false,
		EnhancedMetrics:             true,
		DDTraceEnabled:              true,
		MergeXrayTraces:             false,
		CircuitBreakerInterval:      0,
		CircuitBreakerTimeout:       0,
		CircuitBreakerTotalFailures: 0,
	}
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
