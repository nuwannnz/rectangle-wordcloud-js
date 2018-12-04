
Array.matrix = function (numRows, numCols, initial) {
    var arr = [];

    for (let i = 0; i < numRows; i++) {
        col = [];
        for (let j = 0; j < numCols; j++) {
            col[j] = initial;
        }
        arr[i] = col;
    }

    return arr;
}


function WordCloud(parentElement, words) {

    var gWidth = parentElement.offsetWidth;
    var gHight = parentElement.offsetHeight;

    var uWidth = Math.ceil(gWidth / 10);
    var uHeight = Math.ceil(gHight / 5);


    var grid = Array.matrix(gHight, gWidth, true);


    var settings = {
        weightFactor: 10,
        minFontSize: 25
    };

    var getFontSize = function (weight) {
        return (weight - getRandomNum(2)) * settings.weightFactor;
    }

    var getFontSizeForWidth = function (word, width) {
        let c = document.createElement('canvas');
        var fctx = c.getContext('2d', { willReadFrequently: true });
        let fSize = 150;

        fctx.font = fSize + 'px' + ' sans-serif';
        let wWidth = Math.floor(fctx.measureText(word).width);



        while (wWidth >= width) {
            fSize -= 20;
            if (fSize <= 0) { break; }

            fctx.font = fSize + 'px' + ' sans-serif';
            wWidth = Math.floor(fctx.measureText(word).width);
        }

        return fSize;

    }

    // this will return the width and height of the word
    var getWordInfo = function (word, fontSize) {
        let c = document.createElement('canvas');
        var fctx = c.getContext('2d', { willReadFrequently: true });

        fctx.font = fontSize + 'px' + ' sans-serif';
        let wWidth = Math.floor(fctx.measureText(word).width);
        let wHeight = Math.floor(fctx.measureText('m').width);


        let info = {
            width: wWidth,
            height: wHeight
        };
        return info;

    }


    var wordsList = {
        words: words.slice(),
        usedWords: [],
        getRandomWord: function () {

            let word = '';
            if (this.words.length === 0) {
                word = this.usedWords[getRandomNum(this.usedWords.length)];
            } else {

                word = this.words[getRandomNum(this.words.length)];
                this.usedWords.push(word);
                this.words.splice(this.words.indexOf(word), 1);
            }

            word[0] = word[0].toUpperCase();
            return word;
        }
    }



    let getTopFreePosition = (x) => {
        let pos = 0;
        for (let row = 0; row < grid.length; row++) {
            if (grid[row][x]) {
                pos = row;
                break;
            }
        }

        return pos;
    }

    let getBottomFreePosition = (x) => {
        let pos = 0;
        for (let row = grid.length - 1; row >= 0; row--) {
            if (grid[row][x]) {
                pos = grid.length - row;
                break;
            }
        }

        return pos;
    }

    let lastX = 0;
    let lastY = 0;

    function getNextFreePosition(width, height) {
        let pos = {
            x: -1,
            y: -1
        };
        ROW: for (let row = 0; row < grid.length; row++) {
            COL: for (let col = 0; col < grid[0].length; col++) {
                if (grid[row][col]) {

                    pos.x = col;
                    pos.y = row;
                    break ROW;
                }

            }

        }
        return pos;
    }

    let canFixWord = (position) => {
        let data = {
            canFix: true,
            endX: -1,
            endY: -1
        };
        let y = position.endY;
        if (y > grid.length) {
            y = grid.length;
        }

        ROW: for (let row = position.startY; row < y; row++) {
            COL: for (let col = position.startX; col < position.endX; col++) {
                if (!grid[row][col]) {
                    data.canFix = false;
                    data.endX = col;

                    for (let _r = row; _r < y; _r++) {
                        if (!grid[_r][col]) {
                            data.endY = _r;
                            break ROW;
                        }
                    }
                    data.endY = y;
                    // data.endY = row;

                    // // break;
                    // break ROW;
                }
            }
        }

        if (data.canFix && position.endY > grid.length) {
            data.canFix = false;
            data.endY = grid.length - 1;
        }
        return data;
    }

    let updateGrid = (startX, endX, startY, endY) => {
        if (startY === endY)
            endY++;

        if (startX === endX)
            endX++;

        if (endX === grid[0].length)
            endX--;

        if (endY === grid.length)
            endY--;

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                grid[row][col] = false;
            }
        }


    }


    let fillCorners = (words) => {
        let corners = [
            // ["topLeft1", false],
            ["topLeft2", false],
            ["topRight1", false],
            // ["topRight2", false],
            ["bottomLeft1", false],
            // ["bottomLeft2", false],
            ["bottomRight1", false],
            // ["bottomRight2", false],
        ];
        let i = 1;
        words.forEach(word => {
            // get the word info 



            let info = {
                fontSize: getFontSize(word[1]),
                word: word[0]
            };

            let wordInfo = getWordInfo(word[0], info.fontSize);

            info.width = wordInfo.width;
            info.height = wordInfo.height;

            let wUnits = 0;
            let hUnits = 0;

            while ((uWidth * wUnits) < wordInfo.width) {
                wUnits++;
            }

            while ((uHeight * hUnits) < wordInfo.height) {
                hUnits++;
            }

            // get the position
            let position = corners.find(c => c[1] === false);
            corners[corners.indexOf(position)][1] = true;
            let sX, sY, eX, eY = 0;

            switch (position[0]) {
                case "topLeft1":
                    info.positionData = {
                        "top": 0,
                        "left": 0
                    };
                    sX = 0;
                    sY = 0;
                    eX = info.width;
                    eY = info.height;
                    break;

                case "topLeft2":
                    info.rotateDeg = 90;
                    info.positionData = {
                        "top": getTopFreePosition(0),
                        "left": 0
                    };

                    sX = 0;
                    sY = info.positionData['top'];
                    eX = info.height;
                    eY = sY + info.width;
                    info.positionData['top'] -= (info.height / 2);
                    info.positionData['left'] += (info.height / 2);
                    break;

                case "topRight1":
                    info.positionData = {
                        "top": 0,
                        "right": 0
                    };
                    sX = grid[0].length - info.width;
                    sY = 0;
                    eX = sX + info.width;
                    eY = info.height;
                    break;

                case "topRight2":
                    info.positionData = {
                        "top": getTopFreePosition(grid[0].length - 1),
                        "right": 0
                    };

                    sX = grid[0].length - info.height;
                    sY = info.positionData['top'];
                    eX = sX + info.height;
                    eY = sY + info.width;
                    info.rotateDeg = 90;
                    info.positionData['top'] -= (info.height / 2);
                    info.positionData['right'] -= (info.width - (info.height / 2));
                    break;

                case "bottomLeft1":
                    info.positionData = {
                        "bottom": 0,
                        "left": 0
                    };
                    sX = 0;
                    sY = grid.length - info.height;
                    eX = sX + info.width;
                    eY = sY + info.height;
                    break;

                case "bottomLeft2":
                    info.positionData = {
                        "bottom": getBottomFreePosition(0) + info.width,
                        "left": 0
                    };
                    sX = 0;
                    sY = info.width + info.positionData['bottom'];
                    eX = sX + info.height;
                    eY = info.positionData['bottom'];;
                    info.rotateDeg = 90;
                    info.positionData['left'] += (info.height / 2);

                    break;

                case "bottomRight1":
                    info.positionData = {
                        "bottom": 0,
                        "right": 0
                    };
                    sX = grid[0].length - info.width;
                    sY = grid.length - info.height;
                    eX = sX + info.width;
                    eY = sY + info.height;
                    break;

                case "bottomRight2":
                    info.positionData = {
                        "bottom": getBottomFreePosition(grid[0].length - 1) + info.width,
                        "right": 0
                    };
                    sX = grid[0].length - info.height;
                    sY = info.width + info.positionData['bottom'];
                    eX = sX + info.height;
                    eY = info.positionData['bottom'];
                    info.rotateDeg = 90;
                    info.positionData['right'] -= (info.width - (info.height / 2));
                    break;
            }
            // store the data 
            info.color = getColorForWord(info.word);

            // fill the grid
            updateGrid(sX, eX, sY, eY);

            drawWord(info);

        })
    }



    // actually draw the word
    function drawWord(info) {
        let span = document.createElement('SPAN');
        span.innerHTML = info.word;
        let styles = {
            "display": "inline-block",
            "width": `${info.width}px`,
            "height": `${info.height}px`,
            "fontSize": `${info.fontSize}px`,
            "position": "absolute",
            "color": info.color,
            "transform": `rotate(${info.rotateDeg}deg)`,
            "transformOrigin": "left",
            "textAlign": info.textAlign ? info.textAlign : '',
            "backgroundColor": info.backgroundColor ? info.backgroundColor : ''
        };

        for (const key in info.positionData) {
            styles[key] = `${info.positionData[key]}px`;
        }

        for (const key in styles) {
            span.style[key] = styles[key];
        }

        parentElement.appendChild(span);
    }


    // check whether we have empty space left in the grid
    function hasEmptySpace() {
        let has = false;
        let emptySpace = 0;
        MAIN: for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {

                if (grid[row][col]) {

                    has = true;
                    // this space has to be atleast 50 x 20, so check
                    HORIZONTAL: for (let _r = row; _r < (row + 20); _r++) {
                        for (let _c = col; _c < (col + 50); _c++) {
                            if (!grid[row][col]) {
                                updateGrid(col, _c, row, _r);
                                has = false;
                                break HORIZONTAL;
                            }
                        }
                    }

                    if (has) {
                        // no need to check vertical 
                        break MAIN;
                    }

                    has = true;

                    VERTICAL: for (let _r = row; _r < (row + 50); _r++) {
                        for (let _c = col; _c < (col + 20); _c++) {
                            if (!grid[row][col]) {
                                updateGrid(col, _c, row, _r);
                                has = false;
                                break VERTICAL;
                            }
                        }
                    }

                    if (has) {
                        break MAIN;
                    }
                }
            }
        }
        return has;
    }


    // let rotate = getRandomNum(24) % 2 === 0 ? true : false;
    let lastPos = [];

    function calcAndDrawWord(word, fontSize = -1) {
        let info = {
            fontSize: fontSize === -1 ? getFontSize(word[1]) : fontSize,
            word: word[0]
        };

        let wordInfo = getWordInfo(word[0], info.fontSize);

        info.width = wordInfo.width + 20;
        info.height = wordInfo.height + 20;

        info.color = random_hsl_color(10, 50);

        let rotate = getRandomNum(24) % 2 === 0 ? true : false;
        rotate = !rotate;

        info.rotateDeg = rotate ? 90 : 0;

        let startPos = getNextFreePosition();
        if (lastPos) {
            if (startPos.x === lastPos.x && startPos.y === lastPos.y) {
                updateGrid(startPos.x, startPos + 1, startPos.y, startPos.y + 1);
                return;
            }
        }

        lastPos = startPos;
        console.log(startPos);
        if (startPos.x === -1) {
            // no spaces 
            return;
        }

        let _position = {
            startX: startPos.x,
            endX: rotate ? startPos.x + info.height : startPos.x + info.width,
            startY: startPos.y,
            endY: rotate ? startPos.y + info.width : startPos.y + info.height
        };

        // check position is free
        let fix = canFixWord(_position);
        if (fix.canFix) {
            info.positionData = {
                "top": rotate ? _position.startY - (info.height / 2) : _position.startY,
                "left": rotate ? _position.startX + (info.height / 2) : _position.startX
            };
            info["textAlign"] = "center";

            drawWord(info);
        } else {
            _position.endX = fix.endX;
            _position.endY = fix.endY === 0 ? _position.endY : fix.endY;
            // console.log('position', _position);
            let nWidth = _position.endX - _position.startX;
            if (nWidth < 20) {
                updateGrid(_position.startX, _position.endX, _position.startY, _position.endY);
                return;
            }
            let nFSize = getFontSizeForWidth(word[0], nWidth - 5);
            if (nFSize > 20) {

                calcAndDrawWord(word, nFSize);
                console.log('nFontSize', nFSize);
                return;
            }

        }
        updateGrid(_position.startX, _position.endX, _position.startY, _position.endY);


    }

    // fill the corners
    let cornerWordList = [];
    let i = 0;
    while (i < 4) {
        cornerWordList.push(wordsList.getRandomWord());
        i++
    }

    fillCorners(cornerWordList);

    // fill the rest 

    let _count = 2;

    let canRun = hasEmptySpace();
    while (canRun) {
        canRun = hasEmptySpace();
        let word = wordsList.getRandomWord();
        // break;
        // calcAndDrawWord(word);

        let info = {
            fontSize: getFontSize(word[1]),
            word: word[0]
        };

        let wordInfo = getWordInfo(word[0], info.fontSize);

        info.width = wordInfo.width + 10;
        info.height = wordInfo.height + 10;

        // get the color for the word

        // info.color = random_hsl_color(10, 50);
        info.color = getColorForWord(word[0]);
        // info.backgroundColor = "orange";

        let rotate = getRandomNum(500) < 250 ? true : false;

        info.rotateDeg = rotate ? 90 : 0;

        let startPos = getNextFreePosition(info.width);
        let endPos = getNextFreePosition(info.height);

        if (startPos.x === -1) {
            // no spaces 
            break;
        }

        let _position = {
            startX: startPos.x,
            endX: rotate ? startPos.x + info.height : startPos.x + info.width,
            startY: startPos.y,
            endY: rotate ? startPos.y + info.width : startPos.y + info.height
        };

        // check position is free
        let fix = canFixWord(_position);
        if (fix.canFix) {
            info.positionData = {
                "top": rotate ? _position.startY - (info.height / 2) : _position.startY,
                "left": rotate ? _position.startX + (info.height / 2) : _position.startX
            };
            info["textAlign"] = "center";

            drawWord(info);
        } else {
            _position.endX = fix.endX;
            _position.endY = fix.endY === 0 ? _position.endY : fix.endY;
            // console.log(`startPos => ${JSON.stringify(startPos)}, _pos => ${JSON.stringify(_position)}`);
            // console.log('position', _position);
            // break;
        }

        updateGrid(_position.startX, _position.endX, _position.startY, _position.endY);

    }

}

const wordColorList = [];
function getColorForWord(word) {
    let wordEntry = wordColorList.filter(w => w.word == word)[0];
    if (wordEntry && wordEntry.color) {
        return wordEntry.color;
    } else {
        let color = random_hsl_color(10, 50);
        wordColorList.push({
            word: word,
            color: color
        });

        return color;
    }
}

function random_hsl_color(min, max) {
    return 'hsl(' +
        (Math.random() * 360).toFixed() + ',' +
        (Math.random() * 30 + 70).toFixed() + '%,' +
        (Math.random() * (max - min) + min).toFixed() + '%)';
}

function getRandomNum(max) {
    return Math.floor(Math.random() * max);
}
