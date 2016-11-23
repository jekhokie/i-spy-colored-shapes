$(document).ready(function() {
    // point tracking for the user
    var points = 0;

    // dynamic calculation of window sizing for game board
    const WIDTH = $(window).width() - 50;
    const HEIGHT = $(window).height() - 50;

    // colors
    const RED = { 'name': 'RED', 'hex': 0xFF0000, 'hexWeb': '#FF0000' };
    const GREEN = { 'name': 'GREEN', 'hex': 0x00FF00, 'hexWeb': '#00FF00' };
    const BLUE = { 'name': 'BLUE', 'hex': 0x0000FF, 'hexWeb': '#0000FF' };
    const ORANGE = { 'name': 'ORANGE', 'hex': 0xFFA500, 'hexWeb': '#FFA500' };
    const YELLOW = { 'name': 'YELLOW', 'hex': 0xFFFF00, 'hexWeb': '#FFFF00' };
    const COLORMAP = [ RED, GREEN, BLUE, ORANGE, YELLOW ];

    // colors for ease of use
    const BLACK_HEX = 0x000000;
    const WHITE_HEX = 0xFFFFFF;
    const GRAY_HEX = 0xDDDDDD;
    const DK_GRAY_HEX = 0x888888;
    const BLACK = '#000000';
    const WHITE = '#FFFFFF';
    const GRAY = '#DDDDDD';
    const DK_GRAY = '#888888';

    // shapes
    const SHAPEMAP = [ 'Square', 'Triangle', 'Circle', 'Diamond', 'Rectangle' ];

    // calculate the height and width of each quadrant based on screen size
    const QUAD_WIDTH = WIDTH / 2;
    const QUAD_HEIGHT = HEIGHT / 2 - 40;

    // initialize the canvas
    var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-canvas', { create: create });

    // initialization and setup
    function create() {
        // set up the game board
        genGameBoard();

        // generate the first select color to be used
        var pickColor = genRandomColor();
        var pickShape = genRandomShape();

        // generate the 'select' text
        genSelectText(pickColor, pickShape);

        // fill each quadrant with a colored shape, one of which is the 'correct' one
        genShapes(pickColor, pickShape);
    }

    // reset the screen for a new playing field and render a new game
    function newGame() {
        game.world.removeAll();
        create();
    }

    // generate the game board layout (quadrants)
    function genGameBoard() {
        // set the canvas background color
        game.stage.backgroundColor = GRAY;

        // get the graphics object ready for dividing the playing field
        var graphics = game.add.graphics(0, 0);

        // shade background area of text indicating selector
        graphics.beginFill(DK_GRAY_HEX, 1);
        graphics.drawRect(0, HEIGHT / 2 - 20, WIDTH, 40);
        graphics.endFill();

        graphics.lineStyle(2, BLACK_HEX, 2);

        // draw the upper/lower break lines for the "select" text
        graphics.moveTo(0, HEIGHT / 2 + 20);
        graphics.lineTo(WIDTH, HEIGHT / 2 + 20);
        graphics.moveTo(0, HEIGHT / 2 - 20);
        graphics.lineTo(WIDTH, HEIGHT / 2 - 20);

        // draw the vertical separators
        graphics.moveTo(WIDTH / 2, 0);
        graphics.lineTo(WIDTH / 2, HEIGHT / 2 - 20);
        graphics.moveTo(WIDTH / 2, HEIGHT / 2 + 20);
        graphics.lineTo(WIDTH / 2, HEIGHT);
    }

    // generate the middle 'select shape' text and styling
    function genSelectText(color, shapeName) {
        // place text
        var textPlace = 'a ';
        var textOffset = 8;
        if (['a', 'e', 'i', 'o', 'u'].indexOf(color['name'][0].toLowerCase()) !== -1) {
            textPlace = 'an ';
            textOffset = 9;
        }
        var textContent = "I spy " + textPlace + color['name'] + " " + shapeName;
        var textStyle = { align: "center" };
        var text = game.add.text(game.world.centerX, game.world.centerY, textContent, textStyle);
        text.anchor.set(0.5);

        // color the name of the color that needs to be selected with the actual color
        text.addColor(color['hexWeb'], textOffset);
        text.addColor(BLACK, textOffset + color['name'].length);
    }

    // generate/pick a random color
    function genRandomColor() {
        return COLORMAP[Math.floor(Math.random() * COLORMAP.length)];
    }

    // generate/pick a random shape
    function genRandomShape() {
        return SHAPEMAP[Math.floor(Math.random() * SHAPEMAP.length)];
    }

    // generate a random collection of 4 shapes with various colors and render them
    function genShapes(pickColor, pickShape) {
        // array for quadrant locations
        var quadrants = [ 0, 1, 2, 3 ];

        // generate a random sequence of 4 colors, one of which includes
        // the pick color which will always live in position 0
        shuffle(COLORMAP);
        var colorOptions = [ pickColor ];
        for (var i = 0; colorOptions.length < 4; i++) {
            if (!colorOptions.includes(COLORMAP[i])) {
                colorOptions.push(COLORMAP[i]);
            }
        }

        // generate a random sequence of 4 shapes, one of which includes
        // the pick shape which will always live in position 0
        shuffle(SHAPEMAP);
        var shapeOptions = [ pickShape ];
        for (var i = 0; shapeOptions.length < 4; i++) {
            if (!shapeOptions.includes(SHAPEMAP[i])) {
                shapeOptions.push(SHAPEMAP[i]);
            }
        }

        // generate a random sequence of shapes, one for each quadrant, and
        // one of which is the 'correct' shape/color
        // quadrant mappings as follows:
        //    |-------|
        //    | 0 | 1 |
        //    |-------|
        //    | 2 | 3 |
        //    |-------|
        for (var i = 0; i < 4; i++) {
            // get a random quadrant to place the shape in
            var quadrant = quadrants.splice(Math.floor(Math.random() * quadrants.length), 1)[0];

            // generate the shape randomly, except for the first one, which has to be the correct one
            switch(shapeOptions[i]) {
                case 'Square':
                    genSquare(quadrant, i == 0, colorOptions[i]);
                    break;
                case 'Triangle':
                    genTriangle(quadrant, i == 0, colorOptions[i]);
                    break;
                case 'Circle':
                    genCircle(quadrant, i == 0, colorOptions[i]);
                    break;
                case 'Diamond':
                    genDiamond(quadrant, i == 0, colorOptions[i]);
                    break;
                case 'Rectangle':
                    genRectangle(quadrant, i == 0, colorOptions[i]);
                    break;
            }
        }
    }

    // generate a square with the provided color
    function genSquare(quadrant, isPick, color) {
        // calculate max dimensions based on screen size
        var squareWidth = QUAD_WIDTH - 20;
        var squareHeight = QUAD_HEIGHT - 20;

        // establish uniform width/height based on screen dimensions
        var squareSize = squareWidth;
        if (squareWidth > squareHeight) {
            squareSize = squareHeight;
        }

        // determine square positioning
        var xPos = (game.width / 4) - (squareSize / 2);
        var yPos = (game.height / 4 - 10) - (squareSize / 2);
        switch(quadrant) {
            case 1:
                xPos = game.width - (game.width / 4) - (squareSize / 2);
                break;
            case 2:
                xPos = (game.width / 4) - (squareSize / 2);
                yPos = game.height - (game.height / 4 - 10) - (squareSize / 2);
                break;
            case 3:
                xPos = game.width - (game.width / 4) - (squareSize / 2);
                yPos = game.height - (game.height / 4 - 10) - (squareSize / 2);
                break;
            default:
                // nothing to do - this is quadrant 0 and is handled by the default assigned values
        }

        // construct the square geometry
        var sq = game.add.bitmapData(squareSize, squareSize);
        sq.ctx.beginPath();
        sq.ctx.rect(0, 0, squareSize, squareSize);
        sq.ctx.fillStyle = color['hexWeb'];
        sq.ctx.fill();

        // add the sprite and enable handling
        var sprite = game.add.sprite(xPos, yPos, sq);
        addShapeHandling(sprite, isPick);
    }

    // generate a triangle with the provided color
    function genTriangle(quadrant, isPick, color) {
        // calculate the dimensions of the triangle based on the screen size
        var triLengthFromCenter = (QUAD_WIDTH / 2) - 10;
        if (QUAD_WIDTH > QUAD_HEIGHT) {
            triLengthFromCenter = (QUAD_HEIGHT / 2) - 10;
        }

        // obtain the center of the quadrant
        var quadCenter = getQuadrantCenter(quadrant);
        var xPosCenter = quadCenter.xPos;
        var yPosCenter = quadCenter.yPos;

        // generate the triangle points
        var trianglePoints = [
            new Phaser.Point(xPosCenter, (yPosCenter - triLengthFromCenter)),
            new Phaser.Point((xPosCenter - triLengthFromCenter), (yPosCenter + triLengthFromCenter)),
            new Phaser.Point((xPosCenter + triLengthFromCenter), (yPosCenter + triLengthFromCenter))
        ];

        // construct the polygon
        var poly = new Phaser.Polygon(trianglePoints);
        var tri = game.add.graphics(0, 0);
        tri.beginFill(color['hex']);
        tri.drawPolygon(poly.points);
        tri.endFill();

        // add the sprite and enable handling
        addShapeHandling(tri, isPick);
    }


    // generate a circle with the provided color
    function genCircle(quadrant, isPick, color) {
        // calculate the diameter of the circle based on the screen size
        var circleDiameter = QUAD_WIDTH - 20;
        if (QUAD_WIDTH > QUAD_HEIGHT) {
            circleDiameter = QUAD_HEIGHT - 20;
        }

        // obtain the center of the quadrant
        var quadCenter = getQuadrantCenter(quadrant);
        var xPosCenter = quadCenter.xPos;
        var yPosCenter = quadCenter.yPos;

        // construct the circle
        var cir = game.add.graphics(0, 0);
        cir.beginFill(color['hex']);
        cir.drawCircle(xPosCenter, yPosCenter, circleDiameter);
        cir.endFill();

        // add the sprite and enable handling
        addShapeHandling(cir, isPick);
    }

    // generate a diamond with the provided color
    function genDiamond(quadrant, isPick, color) {
        // calculate the dimensions of the diamond based on the screen size
        var diaLengthFromCenter = (QUAD_WIDTH / 2) - 10;
        if (QUAD_WIDTH > QUAD_HEIGHT) {
            diaLengthFromCenter = (QUAD_HEIGHT / 2) - 10;
        }

        // obtain the center of the quadrant
        var quadCenter = getQuadrantCenter(quadrant);
        var xPosCenter = quadCenter.xPos;
        var yPosCenter = quadCenter.yPos;

        // generate the diamond points
        var diamondPoints = [
            new Phaser.Point(xPosCenter, (yPosCenter - diaLengthFromCenter)),
            new Phaser.Point((xPosCenter + diaLengthFromCenter), yPosCenter),
            new Phaser.Point(xPosCenter, (yPosCenter + diaLengthFromCenter)),
            new Phaser.Point((xPosCenter - diaLengthFromCenter), yPosCenter)
        ];

        // construct the polygon
        var poly = new Phaser.Polygon(diamondPoints);
        var dia = game.add.graphics(0, 0);
        dia.beginFill(color['hex']);
        dia.drawPolygon(poly.points);
        dia.endFill();

        // add the sprite and enable handling
        addShapeHandling(dia, isPick);
    }

    // generate a rectangle with the provided color
    function genRectangle(quadrant, isPick, color) {
        // calculate max dimensions based on screen size
        var rectHeight = QUAD_HEIGHT * 0.8;
        var rectWidth = rectHeight * 0.4;
        if (QUAD_HEIGHT > QUAD_WIDTH) {
            rectWidth = QUAD_WIDTH * 0.8;
            rectHeight = rectWidth * 0.4;
        }

        // determine square positioning
        var xPos = (game.width / 4) - (rectWidth / 2);
        var yPos = (game.height / 4 - 10) - (rectHeight / 2);
        switch(quadrant) {
            case 1:
                xPos = game.width - (game.width / 4) - (rectWidth / 2);
                break;
            case 2:
                xPos = (game.width / 4) - (rectWidth / 2);
                yPos = game.height - (game.height / 4 - 10) - (rectHeight / 2);
                break;
            case 3:
                xPos = game.width - (game.width / 4) - (rectWidth / 2);
                yPos = game.height - (game.height / 4 - 10) - (rectHeight / 2);
                break;
            default:
                // nothing to do - this is quadrant 0 and is handled by the default assigned values
        }

        // construct the rectangle
        var rect = game.add.bitmapData(rectWidth, rectHeight);
        rect.ctx.beginPath();
        rect.ctx.rect(0, 0, rectWidth, rectHeight);
        rect.ctx.fillStyle = color['hexWeb'];
        rect.ctx.fill();

        // add the sprite and enable handling
        var sprite = game.add.sprite(xPos, yPos, rect);
        addShapeHandling(sprite, isPick);
    }

    // determine the center of the provided quadrant in terms of x and y coordinates
    function getQuadrantCenter(quadrant) {
        var xPos = game.width / 4;
        var yPos = game.height / 4 - 10;

        switch(quadrant) {
            case 1:
                xPos = game.width - (game.width / 4);
                break;
            case 2:
                yPos = game.height - (game.height / 4) + 10;
                break;
            case 3:
                xPos = game.width - (game.width / 4);
                yPos = game.height - (game.height / 4) + 10;
                break;
            default:
                // nothing to do - this is quadrant 0 and is handled by the default assigned values
        }

        return {
            xPos: xPos,
            yPos: yPos
        };
    }

    // add a handler for correct handling of clicking the shapes, which
    // results in a new game/round being created
    function addShapeHandling(sprite, isPick) {
        if (isPick == true) {
            sprite.inputEnabled = true;
            sprite.events.onInputDown.add(function() {
                // add a point and render the "Correct!" text
                points += 1;
                renderCorrectText();

                setTimeout(function() {
                    newGame();
                }, 2000);
            });
        }
    }

    // render a correct label over the canvas when the correct shape is chosen
    function renderCorrectText() {
        // get the graphics object ready for outputting the content
        var graphics = game.add.graphics(0, 0);

        // shade background area of text
        graphics.beginFill(DK_GRAY_HEX, 1);
        graphics.drawRect(0, 0, WIDTH, HEIGHT);
        graphics.endFill();

        // output text
        var textContent = "Correct!\nPoints: " + points;
        var textStyle = { align: "center", font: "100px Arial", fill: GREEN['hexWeb'] };
        var text = game.add.text(game.world.centerX, game.world.centerY, textContent, textStyle);
        text.anchor.set(0.5);

        text.addColor(ORANGE['hexWeb'], 8);
    }

    // shuffle an array to ensure randomness in picking
    function shuffle(arr) {
        var i = 0;
        var j = 0;
        var temp = null;

        for (i = arr.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i]
            arr[i] = arr[j]
            arr[j] = temp
        }
    }
});
