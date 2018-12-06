'use strict';

function WordCloud(parentElement, words, _settings) {

    var wordList = words.map(function (w) {
        w[2] = randomColor(10, 60);
        return w;
    });

    var usedWords = [];

    var gWidth = parentElement.offsetWidth;
    var gHeight = parentElement.offsetHeight;

    // a box is 8x8
    var bWidth = 8;
    var bHeight = 8;

    //grid containing boxes
    var grid = Array.matrix(Math.floor(gHeight / bHeight), Math.floor(gWidth / bWidth), true);

    var settings = {
        weightFactor: 8,
        minFontSize: 8
    };

    for (var key in _settings) {
        settings[key] = _settings[key];
    }

    var getFontSize = function getFontSize(weight) {
        return weight * (3 + random(settings.weightFactor));
    };

    var getWordData = function getWordData(word, fontSize) {
        var c = document.createElement('canvas');
        var fctx = c.getContext('2d', { willReadFrequently: true });

        fctx.font = fontSize + 'px sans-serif';
        var width = Math.floor(fctx.measureText(word).width);
        var height = Math.floor(fctx.measureText('m').width);

        return {
            width: width,
            height: height
        };
    };

    var getRandomWord = function getRandomWord() {
        var word = '';
        if (wordList.length === 0) {
            word = usedWords[random(usedWords.length)];
        } else {
            word = wordList[random(wordList.length)];
            usedWords.push(word);
            wordList.splice(wordList.indexOf(word), 1);
        }

        word[0] = word[0].toUpperCase();
        return word;
    };

    var updateGrid = function updateGrid(sY, sX, eY, eX) {
        for (var r = sY; r < eY; r++) {
            for (var c = sX; c < eX; c++) {
                grid[r][c] = false;
            }
        }

        // drawGrid();
    };

    var lastBoxX = 0;
    var nextFreeBox = function nextFreeBox() {
        var boxCord = {
            x: -1,
            y: -1
        };

        ROW: for (var r = 0; r < grid.length; r++) {
            for (var c = lastBoxX; c < grid[0].length; c++) {
                if (grid[r][c]) {
                    boxCord.x = c;
                    boxCord.y = r;
                    lastBoxX = c;
                    break ROW;
                }
            }
            lastBoxX = 0;
        }
        return boxCord;
    };

    var findPositionForBox = function findPositionForBox(wBoxes, hBoxes) {

        for (var r = 0; r < grid.length; r++) {
            for (var c = 0; c < grid[0].length; c++) {
                if (grid[r][c]) {
                    // check can fit box
                    if (canFixBox(c, r, wBoxes, hBoxes)) {
                        return {
                            x: c,
                            y: r
                        };
                    }
                    continue;
                }
            }
        }
        return null;
    };

    var canFixBox = function canFixBox(x, y, wBoxes, hBoxes) {
        if (y + hBoxes > grid.length) {
            return false;
        }
        if (x + wBoxes > grid[0].length) {
            return false;
        }
        for (var r = y; r < y + hBoxes; r++) {
            for (var c = x; c < x + wBoxes; c++) {
                if (!grid[r][c]) {
                    return false;
                }
            }
        }

        return true;
    };

    var onMouseEnterSpan = function onMouseEnterSpan(e) {
        if (spanClicked) return;
        var colorEntry = spanColorList.find(function (s) {
            return s.spans.indexOf(e.target.id) !== -1;
        });

        if (!colorEntry) {
            return;
        }

        colorEntry.spans.forEach(function (spanId) {
            return document.getElementById(spanId).style.color = colorEntry.color;
        });
    };

    var onMouseLeaveSpan = function onMouseLeaveSpan(e) {
        if (spanClicked) return;
        var colorEntry = spanColorList.find(function (s) {
            return s.spans.indexOf(e.target.id) !== -1;
        });

        if (!colorEntry) {
            return;
        }

        colorEntry.spans.forEach(function (spanId) {
            return document.getElementById(spanId).style.color = '#aaa';
        });
    };

    var spanClicked = false;
    var clickedId = -1;

    var onClickSpan = function onClickSpan(e) {

        if (settings.hoverEffects) {

            var colorEntry = spanColorList.find(function (s) {
                return s.spans.indexOf(e.target.id) !== -1;
            });

            if (!colorEntry) {
                return;
            }

            if (e.target.classList.contains('w-clicked')) {
                colorEntry.spans.forEach(function (spanId) {
                    return document.getElementById(spanId).style.color = '#aaa';
                });
                e.target.classList.remove('w-clicked');
                spanClicked = false;
            } else {
                e.target.classList.add('w-clicked');

                colorEntry.spans.forEach(function (spanId) {
                    if (spanId !== e.target.id) {

                        document.getElementById(spanId).style.color = '#aaa';
                    }
                });
                spanClicked = true;
                clickedId = e.target.id;
            }
        }

        if (settings.clickListener) {

            settings.clickListener(e.target);
        }
    };

    var spanColorList = [];

    var lastId = 1;
    var drawWord = function drawWord(info) {

        var span = document.createElement('SPAN');
        span.innerHTML = info.word;
        span.id = 'w' + lastId++;

        if (settings.hoverEffects) {
            var colorEntry = spanColorList.find(function (s) {
                return s.color === info.color;
            });

            if (colorEntry) {
                spanColorList[spanColorList.indexOf(colorEntry)].spans.push(span.id);
            } else {
                spanColorList.push({
                    color: info.color,
                    spans: [span.id]
                });
            }

            span.addEventListener('mouseenter', onMouseEnterSpan);
            span.addEventListener('mouseleave', onMouseLeaveSpan);
        }
        span.addEventListener('click', onClickSpan);

        var styles = {
            display: 'inline-block',
            width: info.width + 'px',
            height: info.height + 'px',
            fontSize: info.fontSize + 'px',
            position: 'absolute',
            color: settings.hoverEffects ? '#aaa' : info.color,
            transform: 'rotate(' + info.rotateDeg + 'deg)',
            transformOrigin: 'left',
            cursor: 'pointer'

        };

        if (info.rotateDeg > 0) {
            styles.width = info.height;
            styles.height = info.width;
        }

        for (var _key in info.position) {
            styles[_key] = info.position[_key] + 'px';
        }

        for (var _key2 in styles) {
            span.style[_key2] = styles[_key2];
        }

        parentElement.appendChild(span);
    };

    var fillCorners = function fillCorners() {

        var cornerWords = [];
        var i = 1;
        while (i <= 4) {
            i++;
            cornerWords.push(getRandomWord());
        };

        var corners = [
            // ["topLeft1", false],
            ["topLeft", false], ["topRight", false],
            // ["topRight2", false],
            ["bottomLeft", false],
            // ["bottomLeft2", false],
            ["bottomRight", false]];

        cornerWords.forEach(function (word) {

            var drawInfo = {
                fontSize: getFontSize(word[1]),
                word: word[0],
                color: word[2],
                rotateDeg: 0
            };

            var dimensions = getWordData(drawInfo.word, drawInfo.fontSize);

            var xBoxes = Math.floor(dimensions.width / bWidth);
            var yBoxes = Math.floor(dimensions.height / bHeight);

            drawInfo.width = dimensions.width;
            drawInfo.height = dimensions.height;
            drawInfo.xBoxes = xBoxes;
            drawInfo.yBoxes = yBoxes;

            var position = corners.find(function (c) {
                return !c[1];
            });
            corners[corners.indexOf(position)][1] = true;

            switch (position[0]) {
                case "topLeft":
                    drawInfo.position = {
                        top: 0 - drawInfo.height / 2,
                        left: 0 + drawInfo.height / 2
                    };
                    drawInfo.rotateDeg = 90;
                    updateGrid(0, 0, xBoxes, yBoxes);
                    break;

                case "topRight":
                    drawInfo.position = {
                        top: 0,
                        right: 0
                    };
                    updateGrid(0, grid[0].length - xBoxes, yBoxes, grid[0].length);
                    break;

                case "bottomLeft":
                    drawInfo.position = {
                        bottom: 0,
                        left: 0
                    };
                    updateGrid(grid.length - yBoxes, 0, grid.length, xBoxes);
                    break;

                case "bottomRight":
                    drawInfo.position = {
                        bottom: 0,
                        right: 0
                    };
                    updateGrid(grid.length - yBoxes, grid[0].length - xBoxes, grid.length, grid[0].length);
                    break;
            };

            drawWord(drawInfo);
        });
    };

    var hasFilled = false;

    var fillGrid = function fillGrid() {

        while (!hasFilled) {
            // get a word
            // check can fix
            // if not resize word
            // draw the word
            // update the grid

            var word = getRandomWord();

            var rotate = random(33) % 2 === 1;
            // rotate = false; 
            var drawInfo = {
                fontSize: getFontSize(word[1]),
                word: word[0],
                color: word[2],
                rotateDeg: rotate ? 90 : 0

            };

            var dimensions = getWordData(drawInfo.word, drawInfo.fontSize);

            var position = nextFreeBox();

            if (position.x === -1 || position.y === -1) {
                hasFilled = true; continue;
            }

            // get width and height boxes
            var wBoxes = rotate ? Math.floor(dimensions.height / bWidth) : Math.floor(dimensions.width / bWidth);
            var hBoxes = rotate ? Math.floor(dimensions.width / bHeight) : Math.floor(dimensions.height / bHeight);

            wBoxes++;
            hBoxes++;
            var pos = findPositionForBox(wBoxes, hBoxes);

            while (pos === null) {
                drawInfo.fontSize -= 2;
                dimensions = getWordData(drawInfo.word, drawInfo.fontSize);
                wBoxes = rotate ? Math.floor(dimensions.height / bWidth) : Math.floor(dimensions.width / bWidth);
                hBoxes = rotate ? Math.floor(dimensions.width / bHeight) : Math.floor(dimensions.height / bHeight);
                wBoxes++;
                hBoxes++;

                pos = findPositionForBox(wBoxes, hBoxes);
            }

            if (drawInfo.fontSize < 12) {
                // don't want to draw
                updateGrid(pos.y, pos.x, pos.y + hBoxes, pos.x + wBoxes);
                continue;
            }

            drawInfo.position = {
                top: pos.y * bHeight,
                left: pos.x * bWidth

                // draw the word
            }; drawInfo.width = dimensions.width;
            drawInfo.height = dimensions.height;

            if (rotate) {
                drawInfo.position.top = drawInfo.position.top - drawInfo.height / 2;
                drawInfo.position.left = drawInfo.position.left + drawInfo.height / 2;
            }

            drawWord(drawInfo);

            updateGrid(pos.y, pos.x, pos.y + hBoxes, pos.x + wBoxes);
        }
    };

    fillCorners();
    fillGrid();
};

Array.matrix = function (numRows, numCols, initial) {
    var arr = [];

    for (var i = 0; i < numRows; i++) {
        let col = [];
        for (var j = 0; j < numCols; j++) {
            col[j] = initial;
        }
        arr[i] = col;
    }

    return arr;
};

function random(max) {
    return Math.floor(Math.random() * max);
}

// inspired from wordcloud2.js
function randomColor(min, max) {
    return 'hsl(' + (Math.random() * 360).toFixed() + ',' + (Math.random() * 30 + 70).toFixed() + '%,' + (Math.random() * (max - min) + min).toFixed() + '%)';
}

module.exports = WordCloud;