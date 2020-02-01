package main

import "encoding/xml"
import "strconv"
import "errors"

// StopMonitorResponse is returned by the /StopMonitor Call
type StopMonitorResponse struct {
	XMLName                xml.Name `xml:"Siri"`
	Text                   string   `xml:",chardata"`
	Version                string   `xml:"version,attr"`
	Xmlns                  string   `xml:"xmlns,attr"`
	ResponseTimestamp      string   `xml:"ResponseTimestamp"`
	StopMonitoringDelivery struct {
		Text               string `xml:",chardata"`
		Version            string `xml:"version,attr"`
		ResponseTimestamp  string `xml:"ResponseTimestamp"`
		ValidUntil         string `xml:"ValidUntil"`
		MonitoredStopVisit struct {
			Text                    string `xml:",chardata"`
			RecordedAtTime          string `xml:"RecordedAtTime"`
			MonitoredVehicleJourney struct {
				Text                    string `xml:",chardata"`
				LineRef                 string `xml:"LineRef"`
				DirectionRef            string `xml:"DirectionRef"`
				FramedVehicleJourneyRef struct {
					Text                   string `xml:",chardata"`
					DataFrameRef           string `xml:"DataFrameRef"`
					DatedVehicleJourneyRef string `xml:"DatedVehicleJourneyRef"`
				} `xml:"FramedVehicleJourneyRef"`
				PublishedLineName string `xml:"PublishedLineName"`
				OriginRef         string `xml:"OriginRef"`
				DestinationRef    string `xml:"DestinationRef"`
				Monitored         string `xml:"Monitored"`
				VehicleLocation   struct {
					Text      string `xml:",chardata"`
					Longitude string `xml:"Longitude"`
					Latitude  string `xml:"Latitude"`
				} `xml:"VehicleLocation"`
				ProgressRate       string `xml:"ProgressRate"`
				CourseOfJourneyRef string `xml:"CourseOfJourneyRef"`
				VehicleRef         string `xml:"VehicleRef"`
				MonitoredCall      struct {
					Text          string `xml:",chardata"`
					StopPointRef  string `xml:"StopPointRef"`
					VisitNumber   string `xml:"VisitNumber"`
					VehicleAtStop string `xml:"VehicleAtStop"`
					Extensions    struct {
						Text                   string `xml:",chardata"`
						EstimatedDepartureTime string `xml:"EstimatedDepartureTime"`
						Direction              string `xml:"Direction"`
						Distance               string `xml:"Distance"`
					} `xml:"Extensions"`
				} `xml:"MonitoredCall"`
				Extensions struct {
					Text            string `xml:",chardata"`
					LastGPSFix      string `xml:"LastGPSFix"`
					Scheduled       string `xml:"Scheduled"`
					Bearing         string `xml:"Bearing"`
					Speed           string `xml:"Speed"`
					DestinationName string `xml:"DestinationName"`
				} `xml:"Extensions"`
			} `xml:"MonitoredVehicleJourney"`
		} `xml:"MonitoredStopVisit"`
		Extensions struct {
			Text          string `xml:",chardata"`
			StopName      string `xml:"StopName"`
			StopLongitude string `xml:"StopLongitude"`
			StopLatitude  string `xml:"StopLatitude"`
			StopLocation  string `xml:"StopLocation"`
		} `xml:"Extensions"`
	} `xml:"StopMonitoringDelivery"`
}

// GetEstimatedDepartureTime will get the minutes until the departure time at the stop
func (r *StopMonitorResponse) GetEstimatedDepartureTime() (int, error) {
	const bitsize = 64
	time, err := strconv.ParseFloat(r.StopMonitoringDelivery.MonitoredStopVisit.MonitoredVehicleJourney.MonitoredCall.Extensions.EstimatedDepartureTime, bitsize)
	if err != nil {
		return 0, err
	}
	if time == 0 {
		return 0, errors.New("Value came back wrong")
	}

	return int(time) / 60, nil
}
