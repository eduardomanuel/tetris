var BLOCKSIZE;
var STACKSIZE;
var blockStack;
var pieceTypes;
var elapsedTime;
var BLOCKSINAPIECE;
var NORMAL_DURATION;
var SHORT_DURATION;
var fallingSpeed;
var rowsCompleted;
var rowBeingClaimed;
var myPiece;
var gameOn;
var stackShouldBeDrawn;

var newPiece = function(type) {

    // console.log("piece type =", type);

    function setBlocks() {
        switch(type) {
            case("|") :
             return [[1,0,0,0], [1,0,0,0], [1,0,0,0],[1,0,0,0]];
            
             case("L") :
             return [[1,0,0,0], [1,0,0,0], [1,1,0,0],[0,0,0,0]];

             case("S") :
             return [[0,1,1,0], [1,1,0,0], [0,0,0,0],[0,0,0,0]];

             case("T") :
             return [[1,1,1,0], [0,1,0,0], [0,0,0,0],[0,0,0,0]];

             case("O") :
             return [[1,1,0,0], [1,1,0,0], [0,0,0,0],[0,0,0,0]];
            
             case("E") :
             return [[0,0,0,0], [0,0,0,0], [0,0,0,0],[0,0,0,0]];
        }
    }

    return {
        falling : true,
        pos : {x:2, y:1},
        blocks : setBlocks()
    }
}

    function drawStack() {
        if(!stackShouldBeDrawn) return;
        for(var i=BLOCKSINAPIECE; i < STACKSIZE.Y; i++ ) {    
            if(rowBeingClaimed) continue;
            for(var j=0; j < STACKSIZE.X; j++) {
                if(blockStack[i][j] == 1)
                    drawBlock(j,i - BLOCKSINAPIECE);
                else 
                    drawEmptyBlock(j,i - BLOCKSINAPIECE);
            }
        }
    }

    
    function findCompleteRow() {       

        for(var i=BLOCKSINAPIECE; i < STACKSIZE.Y; i++ ) {
            var rowIsComplete = true;
            for(var j=0; j < STACKSIZE.X; j++) {
                if(blockStack[i][j] == 0) {
                    rowIsComplete = false;
                    break;
                }
            }
            if(rowIsComplete)
            return i - BLOCKSINAPIECE;
        }
        return 0;
    }

    function getMaxY(){
       return ( (STACKSIZE.Y - BLOCKSINAPIECE) * BLOCKSIZE);
    }
    function drawBoundaries(){
        var maxX = (STACKSIZE.X * BLOCKSIZE);
        var maxY = getMaxY();
        stroke("green");
        strokeWeight(2);
        line(0,maxY ,  maxX, maxY);
    }

    function drawEmptyBlock(x,y){
        push();
        stroke("green");
        fill("black");
        rect(x * BLOCKSIZE, y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
        pop(); 
    }

    function drawBlock(x,y) {
        stroke("red");
        rect(x * BLOCKSIZE, y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
    }

    function drawCompletedBlock(x,y) {
        push();
        stroke("orange");
        fill("yellow");
        rect(x * BLOCKSIZE, y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
        pop();
    }


    function transferColumn(s, d, c, ct) {
        for(var i=0; i < BLOCKSINAPIECE; i++) {
            d[i][ct] = s[i][c];
        }
    }

    function lShiftPiece(piece) {
        var shiftedPiece = newPiece("E");       
        var colsTransferred = 0;

        for(var c=0; c < BLOCKSINAPIECE; c++) {
            var nonEmptyColumnsFound = 0;
            for(var r=0; r < BLOCKSINAPIECE; r++){
                if(piece.blocks[r][c] == 1) {
                    transferColumn(piece.blocks, shiftedPiece.blocks, c, colsTransferred);
                    colsTransferred++;
                    break;
                }
            }
           
        }
        piece.blocks = shiftedPiece.blocks;
    }

    

    

    function getPieceHeight(piece){
        var pieceHeight =0;
        for(var i=0; i < piece.blocks.length; i++) {
            var row = piece.blocks[i];
            for(var j=0; j < row.length; j++) {
                if(row[j] == 1) {
                    pieceHeight +=1;
                    break;
                }
            }
        }
        return pieceHeight;
    }

    function getPieceWidth(piece) {
        var unitOfWidth = 0;

        for(var i=0; i < piece.blocks.length; i++) {
            for(var j=0; j < piece.blocks.length; j++) {
                if(piece.blocks[j][i] == 1) {
                   unitOfWidth +=1;
                   break;   
                }
            }
        }
        return unitOfWidth;

    }
   
    function openBelow(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);
        for(var i=0; i < pieceWidth; i++) {           
            if(blockStack[piece.pos.y + pieceHeight][piece.pos.x + i]  &&  piece.blocks[pieceHeight - 1][i] ) {
                return false;
            }
                
        }
        return true;
    }

    function openLeft(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);
        for(var i=0; i < pieceHeight; i++) {
            if(blockStack[piece.pos.y + i ][piece.pos.x - 1] && piece.blocks[i][piece.pos.x])
                return false;
        }
        return true;
    }

    function openRight(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);

        for(var i=0; i < pieceHeight; i++) {
            if(blockStack[piece.pos.y + i ][piece.pos.x + pieceWidth] && piece.blocks[i][piece.pos.x + pieceWidth - 1])
                return false;
        }
        return true;
    }

    function pieceCanMoveDown(piece){
        // make sure it is open below..
        if ( (piece.pos.y + getPieceHeight(piece) ) < STACKSIZE.Y) {
            return openBelow(piece);
        }
    }

    function pieceCanMoveLeft(piece) {
        if( piece.pos.x - 1 >= 0){
            return openLeft(piece);
        }
           
    }

    function pieceCanMoveRight(piece){
        if((piece.pos.x + getPieceWidth(piece) ) < STACKSIZE.X) {
            return openRight(piece);
        }
    }


    

    function clearPieceTrail(piece, dir) {
        var pieceWidth = getPieceWidth(piece);
        var pieceHeight = getPieceHeight(piece);

        switch(dir) {
            case "down":
                for(var r = 0; r < pieceHeight; r++) {
                    for(var i=0; i <  pieceWidth ; i++){               
                        if(piece.blocks[r][i] != 0)     
                        blockStack[piece.pos.y + r][piece.pos.x + i] = 0;
                    }        
                }                
                break;
            
            case "left":
                for(var i=0; i < pieceHeight; i++) {
                    blockStack[piece.pos.y + i][piece.pos.x + pieceWidth - 1] = 0;
                }
                break;
            
            case "right":
                for(var i=0; i < pieceHeight; i++) {
                    blockStack[piece.pos.y + i][piece.pos.x] = 0; 
                }
                break;
            
        }
        
    }

    function movePieceRight(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);

        if(pieceCanMoveRight(piece)) {
            for(var j=0; j < pieceWidth; j++) {
                for(var i=0; i < pieceHeight; i++) {
                    blockStack[piece.pos.y + i][piece.pos.x + pieceWidth - j] =
                    blockStack[piece.pos.y + i][piece.pos.x + pieceWidth - 1 - j];
                }
            }
            clearPieceTrail(piece, "right");
            piece.pos.x++;
            return true;
        }
        else {
            console.log("piece cannot move left");
            return false;
        }
    }

    function movePieceLeft(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);

        if(pieceCanMoveLeft(piece)) {
            for(var j=0; j < pieceWidth; j++) {
                for(var i=0; i < pieceHeight; i++) {
                    blockStack[piece.pos.y + i][piece.pos.x - 1 + j] =
                    blockStack[piece.pos.y + i][piece.pos.x + j];
                }
            }
            clearPieceTrail(piece, "left");
            piece.pos.x--;
            return true;
        }
        else {
            console.log("piece cannot move left");
            return false;
        }
       
    }



    function movePieceDown(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);
        if(pieceCanMoveDown(piece)) {           
            clearPieceTrail(piece, "down");
            piece.pos.y++;            
            insertPieceToStack(piece);
            return true;
        }
        else {
            return false;
            console.log("piece cannot move anymore");
        }
    }
 
    function insertPieceToStack(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);

        for(var i=0; i < pieceHeight ; i++) {
            for(var j =0; j < pieceWidth; j++) {
                try {
                    if(blockStack[piece.pos.y + i][piece.pos.x + j] == 0 )
                   blockStack[piece.pos.y + i][piece.pos.x + j] = piece.blocks[i][j];               
                }
                catch(error) {
                    console.error(error);
                    console.log(piece);
                    console.log("i=", i);
                    console.log("j=", j);
                    playing = false;
                }
                
            }
        }
    }

    function init2DArray(n) {
        var a = [];
        
        for(var r = 0; r < n; r++) {
            var newRow = [];
            for(var c = 0; c < n; c++) {
                newRow.push(" ");
            }
            a.push(newRow);
        }

        return a;
    }
 
    function clearBeforeRotation(piece) {
        var pieceHeight = getPieceHeight(piece);
        var pieceWidth = getPieceWidth(piece);

        for(var i =0; i < pieceHeight; i++) {
            for(var j=0; j < pieceWidth; j++){
                blockStack[piece.pos.y + i][piece.pos.x + j] = 0;
            }
        }
    }

    function rotate2DArray(a) {
        var rotatedArray = init2DArray(a.length);
        for(var i = 0; i < a.length; i++) {
            for(var j = 0; j < a.length; j++) {
               // console.log("puting a[" + i + "][" + j + "] on [" + (a.length - 1 - i) + "][" + j + "]");
                rotatedArray[j][a.length - 1 - i] = a[i][j];
            }
        }
        return rotatedArray;
    }

    function rotatePiece(piece) {
        piece.blocks = rotate2DArray(piece.blocks);
    }

    function ticElapsed(duration) {
        if(elapsedTime >= duration) {
            elapsedTime = 0;
            return true;
        }else {
            elapsedTime += deltaTime;
            return false;
        }
    }

    function toggleFastFall(){
        if(fallingSpeed == NORMAL_DURATION) {
            fallingSpeed = SHORT_DURATION;
        }
        else {
            fallingSpeed = NORMAL_DURATION;
        }
    }

    function findTopOfStack(){        
        for(var i=STACKSIZE.Y -1; i > BLOCKSINAPIECE; i--) {
            var rowIsEmpty = true; 
            for(var j = 0; j < STACKSIZE.X; j++){
                if(blockStack[i][j] == 1) {
                    rowIsEmpty = false;
                    break;
                }
            }
            if(rowIsEmpty)
                return i;
        }
    }

    function shiftRowsDown(rowNumber) {
        var topOfStack = findTopOfStack();
        console.log("found top of stack=", topOfStack);        
        for(var i=rowNumber; i > topOfStack; i--) {
            blockStack[i] = blockStack[i-1].slice();
        }
        console.log("shifted blocks down");
    }


    function animateCompletedRow(rowNumber) {
        console.log("begining claiming blocks");
        var currFrameRate = frameRate();
        var doneClaiming = false;
        var columnNumber = 0;

        stackShouldBeDrawn = false;

        var claimBlock = function() {
            if(columnNumber < STACKSIZE.X) {
                drawCompletedBlock(columnNumber++, rowNumber);        
            }
            else {
                stopAnimation();                
            }
        };

        var stopAnimation = function() {            
            stackShouldBeDrawn = true;
            shiftRowsDown(rowNumber + BLOCKSINAPIECE);
            clearInterval(intervalHandle);
        }

        var intervalHandle = setInterval(claimBlock, 200);    
        rowBeingClaimed = 0;
        console.log("done claiming blocks");
    }

    function claimCompletedRow(rowNumber) {
        rowBeingClaimed = rowNumber;
        //animateCompletedRow(rowNumber);        
        shiftRowsDown(rowNumber + BLOCKSINAPIECE);
        rowBeingClaimed = 0;
        console.log("row completed at:", rowNumber);
    }

    function keyPressed() {
        switch(keyCode) {
            case 37 :
                movePieceLeft(myPiece);
                break;
            
            case 39 :
                movePieceRight(myPiece);
                break;

            case 38 :
                clearBeforeRotation(myPiece);
                rotatePiece(myPiece); 
                lShiftPiece(myPiece);
                insertPieceToStack(myPiece);
                break;

            case 32:
                toggleFastFall();
                break;

            default:
                console.log("keyCode=", keyCode);
        }
    }