


function WordCloud(parentElement, words, _settings) {

    const wordList = words.map(w => {
        w[2] = randomColor(10, 60);
        return w;
    });

    const usedWords = [];

    const gWidth = parentElement.offsetWidth;
    const gHeight = parentElement.offsetHeight;

    // a box is 8x8
    const bWidth = 8;
    const bHeight = 8;

    //grid containing boxes
    const grid = Array.matrix(Math.floor(gHeight / bHeight), Math.floor(gWidth / bWidth), true);

    const settings = {
        weightFactor: 8,
        minFontSize: 8
    };

    for (const key in _settings) {
        settings[key] = _settings[key];
    }

    const getFontSize = (weight) => {
        return (weight * (3 + random(settings.weightFactor)));
    }



    const getWordData = (word, fontSize) => {
        let c = document.createElement('canvas');
        let fctx = c.getContext('2d', { willReadFrequently: true });

        fctx.font = `${fontSize}px sans-serif`;
        let width = Math.floor(fctx.measureText(word).width);
        let height = Math.floor(fctx.measureText('m').width);

        return {
            width: width,
            height: height
        };
    }

    const getRandomWord = () => {
        let word = '';
        if (wordList.length === 0) {
            word = usedWords[random(usedWords.length)];
        } else {
            word = wordList[random(wordList.length)];
            usedWords.push(word);
            wordList.splice(wordList.indexOf(word), 1);
        }

        word[0] = word[0].toUpperCase();
        return word;

    }




    const updateGrid = (sY, sX, eY, eX) => {
        for (let r = sY; r < eY; r++) {
            for (let c = sX; c < eX; c++) {
                grid[r][c] = false;
            }
        }

        // drawGrid();
    }

    let lastBoxX = 0;
    const nextFreeBox = () => {
        let boxCord = {
            x: -1,
            y: -1
        };

        ROW: for (let r = 0; r < grid.length; r++) {
            for (let c = lastBoxX; c < grid[0].length; c++) {
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
    }


    const findPositionForBox = (wBoxes, hBoxes) => {

        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[0].length; c++) {
                if (grid[r][c]) {
                    // check can fit box
                    if (canFixBox(c, r, wBoxes, hBoxes)) {
                        return ({
                            x: c,
                            y: r
                        });
                    }
                    continue;
                }
            }
        }
        return null;
    }

    const canFixBox = (x, y, wBoxes, hBoxes) => {
        if ((y + hBoxes) > grid.length) {
            return false;
        }
        if ((x + wBoxes) > grid[0].length) {
            return false;
        }
        for (let r = y; r < (y + hBoxes); r++) {
            for (let c = x; c < (x + wBoxes); c++) {
                if (!grid[r][c]) {
                    return false;
                }
            }
        }

        return true;
    }

    const onMouseEnterSpan = (e) => {
        if (spanClicked) return;
        let colorEntry = spanColorList.find(s => s.spans.indexOf(e.target.id) !== -1);

        if (!colorEntry) { return; }

        colorEntry.spans.forEach(spanId => document.getElementById(spanId).style.color = colorEntry.color);
    }

    const onMouseLeaveSpan = (e) => {
        if (spanClicked) return;
        let colorEntry = spanColorList.find(s => s.spans.indexOf(e.target.id) !== -1);

        if (!colorEntry) { return; }

        colorEntry.spans.forEach(spanId => document.getElementById(spanId).style.color = '#aaa');
    }

    let spanClicked = false;
    let clickedId = -1;

    const onClickSpan = (e) => {


        if (settings.hoverEffects) {

            let colorEntry = spanColorList.find(s => s.spans.indexOf(e.target.id) !== -1);

            if (!colorEntry) { return; }

            if (e.target.classList.contains('w-clicked')) {
                colorEntry.spans.forEach(spanId => document.getElementById(spanId).style.color = '#aaa');
                e.target.classList.remove('w-clicked');
                spanClicked = false;
            } else {
                e.target.classList.add('w-clicked');

                colorEntry.spans.forEach(spanId => {
                    if (spanId !== e.target.id) {

                        document.getElementById(spanId).style.color = '#aaa'
                    }
                });
                spanClicked = true;
                clickedId = e.target.id;
            }
        }

        if (settings.clickListener) {


            settings.clickListener(e.target);
        }
    }

    const spanColorList = [];

    let lastId = 1;
    const drawWord = (info) => {

        let span = document.createElement('SPAN');
        span.innerHTML = info.word;
        span.id = `w${lastId++}`;

        if (settings.hoverEffects) {
            let colorEntry = spanColorList.find(s => s.color === info.color);

            if (colorEntry) {
                spanColorList[spanColorList.indexOf(colorEntry)].spans.push(span.id);
            } else {
                spanColorList.push({
                    color: info.color,
                    spans: [
                        span.id
                    ]
                });
            }


            span.addEventListener('mouseenter', onMouseEnterSpan);
            span.addEventListener('mouseleave', onMouseLeaveSpan);
        }
        span.addEventListener('click', onClickSpan);

        let styles = {
            display: 'inline-block',
            width: `${info.width}px`,
            height: `${info.height}px`,
            fontSize: `${info.fontSize}px`,
            position: 'absolute',
            color: settings.hoverEffects ? '#aaa' : info.color,
            transform: `rotate(${info.rotateDeg}deg)`,
            transformOrigin: 'left',
            cursor: 'pointer'

        }

        if (info.rotateDeg > 0) {
            styles.width = info.height;
            styles.height = info.width;
        }

        for (const key in info.position) {
            styles[key] = `${info.position[key]}px`;
        }

        for (const key in styles) {
            span.style[key] = styles[key];
        }

        parentElement.appendChild(span);




    }

    const fillCorners = () => {

        let cornerWords = [];
        let i = 1;
        while (i <= 4) {
            i++;
            cornerWords.push(getRandomWord());
        };

        const corners = [
            // ["topLeft1", false],
            ["topLeft", false],
            ["topRight", false],
            // ["topRight2", false],
            ["bottomLeft", false],
            // ["bottomLeft2", false],
            ["bottomRight", false],
            // ["bottomRight2", false],
        ];

        cornerWords.forEach(word => {


            let drawInfo = {
                fontSize: getFontSize(word[1]),
                word: word[0],
                color: word[2],
                rotateDeg: 0
            };

            let dimensions = getWordData(drawInfo.word, drawInfo.fontSize);

            let xBoxes = Math.floor(dimensions.width / bWidth);
            let yBoxes = Math.floor(dimensions.height / bHeight);

            drawInfo.width = dimensions.width;
            drawInfo.height = dimensions.height;
            drawInfo.xBoxes = xBoxes;
            drawInfo.yBoxes = yBoxes;


            let position = corners.find(c => !c[1]);
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


        })
    }

    let hasFilled = false;

    const fillGrid = () => {

        while (!hasFilled) {
            // get a word
            // check can fix
            // if not resize word
            // draw the word
            // update the grid

            let word = getRandomWord();

            let rotate = random(33) % 2 === 1;
            // rotate = false; 
            let drawInfo = {
                fontSize: getFontSize(word[1]),
                word: word[0],
                color: word[2],
                rotateDeg: rotate ? 90 : 0

            };


            let dimensions = getWordData(drawInfo.word, drawInfo.fontSize);

            let position = nextFreeBox();

            if (position.x === -1 || position.y === -1) { hasFilled = true; continue; }

            // get width and height boxes
            let wBoxes = rotate ? Math.floor(dimensions.height / bWidth) : Math.floor(dimensions.width / bWidth);
            let hBoxes = rotate ? Math.floor(dimensions.width / bHeight) : Math.floor(dimensions.height / bHeight);

            wBoxes++;
            hBoxes++;
            let pos = findPositionForBox(wBoxes, hBoxes);

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
            }

            // draw the word
            drawInfo.width = dimensions.width;
            drawInfo.height = dimensions.height;

            if (rotate) {
                drawInfo.position.top = drawInfo.position.top - (drawInfo.height / 2);
                drawInfo.position.left = drawInfo.position.left + (drawInfo.height / 2);
            }

            drawWord(drawInfo);

            updateGrid(pos.y, pos.x, pos.y + hBoxes, pos.x + wBoxes);


        }

    }

    fillCorners();
    fillGrid();

};


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

function random(max) {
    return Math.floor(Math.random() * max);
}


function randomColor(min, max) {
    return 'hsl(' +
        (Math.random() * 360).toFixed() + ',' +
        (Math.random() * 30 + 70).toFixed() + '%,' +
        (Math.random() * (max - min) + min).toFixed() + '%)';
}