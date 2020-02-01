package main

import (
	"regexp"
	"strconv"
	"strings"
)

type claim struct {
	id     int
	x      int
	y      int
	width  int
	height int
}

// data = get_data(3)
// claims = map(lambda s: map(int, re.findall(r'-?\d+', s)), data)
// m = defaultdict(list)
// overlaps = {}
// for (claim_number, start_x, start_y, width, height) in claims:
//   overlaps[claim_number] = set()
//   for i in xrange(start_x, start_x + width):
//     for j in xrange(start_y, start_y + height):
//       if m[(i,j)]:
//         for number in m[(i, j)]:
//           overlaps[number].add(claim_number)
//           overlaps[claim_number].add(number)
//       m[(i,j)].append(claim_number)

// print "a", len([k for k in m if len(m[k]) > 1])
// print "b", [k for k in overlaps if len(overlaps[k]) == 0][0]

func dayThreePartOne(input string) int {
	claims := strings.Split(input, ", ")
	overlaps := make(map[int]map[claim]bool)
	for _, strClaim := range claims {
		// add each claim to the overlaps
		square := toClaim(strClaim)
		for i := square.x; i < square.x+square.width; i++ {
			for j := square.y; j < square.y+square.height; j++ {

			}
		}
	}

	return -1
}

func dayThreePartTwo(input string) string {
	return ""
}

func toClaim(strClaim string) claim {
	numberRegex := regexp.MustCompile("\\d+")
	m := numberRegex.FindAllString(strClaim, -1)
	id, _ := strconv.Atoi(m[0])
	x, _ := strconv.Atoi(m[1])
	y, _ := strconv.Atoi(m[2])
	width, _ := strconv.Atoi(m[3])
	height, _ := strconv.Atoi(m[4])
	return claim{id: id, x: x, y: y, width: width, height: height}
}
