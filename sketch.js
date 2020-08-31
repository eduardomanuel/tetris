
 function initBlockStack(){
    for(var i=0; i < STACKSIZE.Y; i++) {
      var row = [];
      for(var j=0; j < STACKSIZE.X; j++) {
         row.push(0);
      }
      blockStack.push(row);
    }
 }

 function initGame(){
    NORMAL_DURATION = 1000;
    SHORT_DURATION  = 20;
    fallingSpeed    = NORMAL_DURATION;
    gameOn          = true;
    BLOCKSINAPIECE  = 4;
    elapsedTime     = 0;
    BLOCKSIZE       = 20;
    STACKSIZE       = {X:(width/BLOCKSIZE)/2, Y:(height/BLOCKSIZE) + BLOCKSINAPIECE};
    blockStack      = [];
    pieceTypes      = ["|","L", "S", "T", "O"];
    rowsCompleted   = 0;
    rowBeingClaimed = 0;
    stackShouldBeDrawn = true;
    initBlockStack();
    frameRate(20);
 }

function setup() {
  createCanvas(400,400);
  
  initGame();
  addPiece();
  // drawStack();
}

function addPiece(){
  myPiece = newPiece(pieceTypes[round(random(pieceTypes.length-1))]);
  insertPieceToStack(myPiece);
}



function draw() {
    
  //  animateCompletedRow(19);

    drawStack();
    if(gameOn) { 
           
      if(ticElapsed(fallingSpeed)){
        
        if(!movePieceDown(myPiece)) {
          var rowCompleted = findCompleteRow();
          while(rowCompleted){          
            claimCompletedRow(rowCompleted);
            rowCompleted = findCompleteRow();
          }                    
          addPiece();
          fallingSpeed = NORMAL_DURATION;
        }
      }
      drawBoundaries();
    }
        
}