#!/bin/sh
dayNumber=$(printf %02d $(expr $(date +%d) + 1))

createFiles () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        local path="./solutions/$dayNumber-$1"
        mkdir $path
        touch "$path/solution.js"
        touch "$path/finalInput.js"
        touch "$path/problem.md"
        touch "./test/$dayNumber-$1.test.js"
    fi
}

startDay () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        git checkout master
        git checkout -b "$dayNumber-$1"
        git checkout -b "$dayNumber/part1"
        createFiles $1
        fillTestFile $1
        fillSolutionFile $1
        fillFinalInputFile $1
    fi

}

fillTestFile () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        local path="./test/$dayNumber-$1.test.js"
        echo "const expect = require(\"chai\").expect;" >> $path
        echo "const part1 = require(\"./../solutions/$dayNumber-$1/solution\").part1;" >> $path
        echo "const part2 = require(\"./../solutions/$dayNumber-$1/solution\").part2;" >> $path
        echo "const FINAL_INPUT = require(\"./../solutions/$dayNumber-$1/finalInput\").finalInput;"  >> $path
        echo "" >> $path
        echo "describe(\"$dayNumber-$1\", () => {" >> $path
        echo "\tdescribe(\"Part 1\", () => {" >> $path
        echo "\t\tit(\"on input \'\', it should return 999\", done => {" >> $path
        echo "\t\t\tconst input = \"\";" >> $path
        echo "\t\t\tconst result = part1(input);" >> $path
        echo "\t\t\tconst expected = 999;"; >> $path
        echo "\t\t\texpect(result).to.equal(expected);" >> $path
        echo "\t\t\tdone();" >> $path
        echo "\t\t});" >> $path
        echo "\t\tit(\"on the final input, it should return 999\", done => {" >> $path
        echo "\t\t\tconst input = FINAL_INPUT;" >> $path
        echo "\t\t\tconst result = part1(input);" >> $path
        echo "\t\t\tconst expected = 999;"; >> $path
        echo "\t\t\texpect(result).to.equal(expected);" >> $path
        echo "\t\t\tdone();" >> $path
        echo "\t\t});" >> $path
        echo "\t});" >> $path
        echo "\tdescribe(\"Part 2\", () => {" >> $path
        echo "\t\tit(\"on input \'\', it should return 999\", done => {" >> $path
        echo "\t\t\tconst input = \"\";" >> $path
        echo "\t\t\tconst result = part2(input);" >> $path
        echo "\t\t\tconst expected = 999;"; >> $path
        echo "\t\t\texpect(result).to.equal(expected);" >> $path
        echo "\t\t\tdone();" >> $path
        echo "\t\t});" >> $path
        echo "\t\tit(\"on the final input, it should return 999\", done => {" >> $path
        echo "\t\t\tconst input = FINAL_INPUT;" >> $path
        echo "\t\t\tconst result = part2(input);" >> $path
        echo "\t\t\tconst expected = 999;"; >> $path
        echo "\t\t\texpect(result).to.equal(expected);" >> $path
        echo "\t\t\tdone();" >> $path
        echo "\t\t});" >> $path
        echo "\t});" >> $path
        echo "});" >> $path
    fi
}

fillSolutionFile () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        local path="./solutions/$dayNumber-$1/solution.js"
        echo "function part1(input) {" >> $path
        echo "\t" >> $path
        echo "}" >> $path
        echo "" >> $path
        echo "function part2(input) {" >> $path
        echo "\t" >> $path
        echo "}" >> $path
        echo "" >> $path
        echo "module.exports = { part1, part2 }" >> $path
    fi
}

fillFinalInputFile() {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        local path="./solutions/$dayNumber-$1/finalInput.js"
        echo "const finalInput = \"\";" >> $path
        echo "" >> $path
        echo "module.exports = { finalInput }" >> $path
    fi
}

finishPart1 () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        git checkout "$dayNumber-$1"
        git merge "$dayNumber/part1"
        git branch -d "$dayNumber/part1"
    fi
}

finishPart2 () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        git checkout "$dayNumber-$1"
        git merge "$dayNumber/part2"
        git branch -d "$dayNumber/part2"
    fi
}

finish () {
    if [ $1 -z ]
    then
        echo "input of the day's title is required"
    else
        git checkout master
        git merge --no-ff "$dayNumber-$1"
        git branch -d "$dayNumber-$1"
        # git push -u origin master
    fi
}

startDay $1