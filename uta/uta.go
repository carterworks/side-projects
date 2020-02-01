package main

import (
	"encoding/xml"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

const urlBase = "http://api.rideuta.com/SIRI/SIRI.svc/"
const okayCode = 200

func makeRequest(method string, params url.Values) http.Response {
	path := urlBase + method
	request, error := http.NewRequest("GET", path, nil)
	if error != nil {
		log.Fatalln(error)
	}
	request.URL.RawQuery = params.Encode()
	client := http.DefaultClient
	response, err := client.Do(request)

	if err != nil || response.StatusCode != http.StatusOK {
		log.Fatalln(err)
	}

	return *response
}

func stopMonitor(stopID, minutesOut, filterRoute int, userToken string, onwardCalls bool) (int, error) {
	const methodCall = "StopMonitor"

	queryParams := url.Values{}
	queryParams.Add("Usertoken", userToken)
	queryParams.Add("StopID", strconv.Itoa(stopID))
	queryParams.Add("MinutesOut", strconv.Itoa(minutesOut))
	queryParams.Add("FilterRoute", strconv.Itoa(filterRoute))
	queryParams.Add("OnwardCalls", strconv.FormatBool(onwardCalls))
	response := makeRequest(methodCall, queryParams)

	data, err := ioutil.ReadAll(response.Body)
	defer response.Body.Close()
	if err != nil {
		return 0, err
	}
	var parsed StopMonitorResponse
	err = xml.Unmarshal(data, &parsed)
	if err != nil {
		return 0, err
	}
	departureTime, err := parsed.GetEstimatedDepartureTime()
	if err != nil {
		departureTime = -1
	}
	return departureTime, nil
}

func main() {
	// parse stop monitor arguments
	userToken := flag.String("token", "", "Required - your UTA developer API key. Go to http://developer.rideuta.com/Registration.aspx get one.")
	stopID := flag.Int("stop", 0, "Required - The Stop to query. This number can be found on any UTA stop sign (e.g. 133054).")
	minutesOut := flag.Int("minutes", 30, "Optional - defaults to 30 - The number of minutes away from the stop you want to query. Any vehicle that is this many minutes or less from the stop will be returned. (e.g 30 for 30 minutes or less away).")
	onwardCalls := flag.Bool("onward", false, "Optional - defaults to false - Determines whether or not the response will include the stops (known as \"calls\" in SIRI) each vehicle is going to make. To get calls data, use value true, otherwise use value false.")
	route := flag.Int("route", 0, "Required - Filters the vehicles by a a desired route. This is an optional value if the parameter is left blank all vehicles headed to the queried stop will be included. (e.g. 2 to filter for vehicles servicing route 2) ")
	flag.Parse()
	if *stopID == 0 {
		log.Panicf("Stop ID, -stop=XXX, is required")
	}
	if *route == 0 {
		log.Panicf("route, -route=XXX, is required")
	}
	if *userToken == "" {
		log.Panicln("UTA user token, -uta token=\"XXXXXXX\" is required as an argument")
	}

	// get departure time, in minutes
	departureTime, err := stopMonitor(*stopID, *minutesOut, *route, *userToken, *onwardCalls)
	if err != nil {
		log.Panicln(err)
	}

	// write it to the console
	var result strings.Builder
	result.WriteString("🚌: ")
	if departureTime < 0 {
		result.WriteString("🤷‍♂️")
	} else {
		time := strconv.Itoa(departureTime)
		result.WriteString(time)
	}
	result.WriteString(" mins")
	fmt.Println(result.String())
}
