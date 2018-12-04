


function WordCloud(parentElement, words) {

    const wordList = words.map(w => {
        w[2] = randomColor(10, 60);
        return w;
    });

    const usedWords = [];

    const gWidth = parentElement.offsetWidth;
    const gHeight = parentElement.offsetHeight;

    // a box is 8x8
    const bWidth = 30;
    const bHeight = 20;

    //grid containing boxes
    const grid = Array.matrix(Math.floor(gHeight / bHeight), Math.floor(gWidth / bWidth), true);

    const settings = {
        weightFactor: 8,
        minFontSize: 8
    };

    const getFontSize = (weight) => {
        return (weight * ( 3 + random(settings.weightFactor)));
    }

    const getFontSizeForWidth = (word, width, previousFontSize) => {
        let c = document.createElement('canvas');
        let fctx = c.getContext('2d', { willReadFrequently: true });

        // get a random font size
        let fs = previousFontSize;
        fctx.font = `${fs}px sans-serif`;
        let nWidth = Math.floor(fctx.measureText(word).width);

        if (nWidth < width) { return fs };

        while (nWidth > width) {
            fs -= 10;
            fctx.font = `${fs}px sans-serif`;
            nWidth = Math.floor(fctx.measureText(word).width);
        }

        return fs;
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


    let e = document.getElementById('sp');
    const drawGrid = ()=>{
        e.innerHTML = '';
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[0].length; c++) {
                if(grid[r][c]){
                    e.innerHTML += '1'

                }else{
                    e.innerHTML += '0'
                }
            }
            e.innerHTML += '<br>';
        }
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

    const canFitWord = (sXBox, sYBox, eXBox, eYBox) => {

        let result = {
            canFit: true,
            x: -1,
            y: -1
        };

            // if(eXBox > grid[0].length){
            //     result.canFit = false;
            //     eXBox = grid[0].length - 1;
            // }

            // if(eYBox > grid.length ){
            //     result.canFit = false;
            //     eYBox = grid.length - 1;
            // }

            for (let r = sYBox; r < eYBox; r++) {
                for (let c = sXBox; c < eXBox; c++) {
                    if (!grid[r][c]) {
                        result.canFit = false;
                        result.x = c;
                    }
                }
            }
        

       

            for (let c = sXBox; c < eXBox; c++) {
                for (let r = sYBox; r < eYBox; r++) {
                    if (!grid[r][c]) {
                        result.canFit = false;
                        result.y = r;
                    }
                }
            }
        

        if (!result.canFit && result.x === -1) {
            result.x = eXBox;
        }

        if (!result.canFit && result.y === -1) {
            result.y = eYBox + 1;
        }

        return result;
    }

    const drawWord = (info) => {

        let span = document.createElement('SPAN');
        span.innerHTML = info.word;

        let styles = {
            display: 'inline-block',
            width: `${info.width}px`,
            height: `${info.height}px`,
            fontSize: `${info.fontSize}px`,
            position: 'absolute',
            color: info.color,
            transform: `rotate(${info.rotateDeg}deg)`,
            transformOrigin: 'left',

        }

        if(info.rotateDeg > 0){
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
            let wBoxes = Math.floor(dimensions.width / bWidth);
            let hBoxes = Math.floor(dimensions.height / bHeight);

            let fitInfo = {};

            if(rotate){
                fitInfo = canFitWord(position.x, position.y, position.y + hBoxes, position.x + wBoxes);
            }else{
                fitInfo = canFitWord(position.x, position.y, position.x + wBoxes, position.y + hBoxes);
            }
            drawInfo.position = {
                top: position.y * bHeight,
                left: position.x * bWidth
            }

          

            if (fitInfo.canFit) {
                // draw the word
                drawInfo.width = dimensions.width;
                drawInfo.height = dimensions.height;

                if(rotate){
                    drawInfo.position.top = drawInfo.position.top - (drawInfo.height / 2);
                    drawInfo.position.left = drawInfo.position.left + (drawInfo.height / 2);
                }

                drawWord(drawInfo);

                if(rotate){

                    updateGrid(position.y, position.x, position.x + wBoxes + 1, position.y + hBoxes + 1);
                }else{
                    updateGrid(position.y, position.x, position.y + hBoxes + 1, position.x + wBoxes + 1);
                }

            } else if (fitInfo.y === position.y) {
                updateGrid(position.y, position.x, fitInfo.y + 1, fitInfo.x);
            } else {
                // break;
                // get the new fontsize 
                drawInfo.fontSize = getFontSizeForWidth(drawInfo.word, (fitInfo.x - position.x) * bWidth, drawInfo.fontSize);
                drawInfo.width = (fitInfo.x - position.x) * bWidth;
                drawInfo.height = (fitInfo.y - position.y) * bHeight;
                if(rotate){
                    drawInfo.position.top = drawInfo.position.top - (drawInfo.height / 2);
                    drawInfo.position.left = drawInfo.position.left + (drawInfo.height / 2);
                }

                drawWord(drawInfo);

                if(rotate){

                    updateGrid(position.y, position.x, fitInfo.x, fitInfo.y);
                }else{
                    updateGrid(position.y, position.x, fitInfo.y, fitInfo.x);
                }
            }
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