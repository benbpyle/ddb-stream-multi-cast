package main

import (
	"fmt"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

type Item interface {
	GetItemType() string
}

type CustomEvent struct {
	EventType     string `json:"eventType"`
	CorrelationId string `json:"eventId"`
	Body          Item   `json:"body"`
}

type ItemOne struct {
	Id        string `json:"id"`
	Sk        string `json:"sk"`
	PatientId string `json:"patientId"`
	Name      string `json:"name"`
	ItemType  string `json:"itemType"`
}

type ItemTwo struct {
	Id        string `json:"id"`
	Address   string `json:"address"`
	ItemType  string `json:"itemType"`
	Sk        string `json:"sk"`
	PatientId string `json:"patientId"`
	AddressId string `json:"addressId"`
}

func (i *ItemOne) GetItemType() string {
	return i.ItemType
}

func (i *ItemTwo) GetItemType() string {
	return i.ItemType
}

func Convert(r *events.DynamoDBEventRecord) (*CustomEvent, error) {
	if v, ok := r.Change.NewImage["itemType"]; ok {
		itemType := v.String()
		if itemType == "" {
			return nil, fmt.Errorf("(itemType) not present on entity")
		}

		if itemType == "Patient" {
			i := r.Change.NewImage["id"]
			n := r.Change.NewImage["name"]
			t := r.Change.NewImage["itemType"]
			s := r.Change.NewImage["sk"]
			pid := r.Change.NewImage["patientId"]

			change := fmt.Sprintf("Patient%s", strings.Title(strings.ToLower(r.EventName)))
			return &CustomEvent{
				EventType:     change,
				CorrelationId: r.EventID,
				Body: &ItemOne{
					Id:        i.String(),
					Name:      n.String(),
					ItemType:  t.String(),
					Sk:        s.String(),
					PatientId: pid.String(),
				}}, nil
		} else if itemType == "Address" {
			i := r.Change.NewImage["id"]
			n := r.Change.NewImage["address"]
			t := r.Change.NewImage["itemType"]
			s := r.Change.NewImage["sk"]
			pid := r.Change.NewImage["patientId"]
			aid := r.Change.NewImage["addressId"]
			change := fmt.Sprintf("Address%s", strings.Title(strings.ToLower(r.EventName)))
			return &CustomEvent{
				EventType:     change,
				CorrelationId: r.EventID,
				Body: &ItemTwo{
					Id:        i.String(),
					Address:   n.String(),
					ItemType:  t.String(),
					Sk:        s.String(),
					PatientId: pid.String(),
					AddressId: aid.String(),
				}}, nil
		}

		return nil, fmt.Errorf("(itemType)=%s not supported", itemType)
	} else {
		return nil, fmt.Errorf("(itemType) not present on entity")
	}
}
