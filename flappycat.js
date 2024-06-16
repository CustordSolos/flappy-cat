let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//setting object for flying cat
let catImg;
let catWidth = 65;
let catHeight = 65;
let catX = boardWidth/8;
let catY = boardHeight/2.3;

let cat = {
    x : catX,
    y : catY,
    width : catWidth,
    height : catHeight
}

//variables paw pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

//create topPipe object
let topPipe = {
    x : pipeX-100,
    y : pipeY-200,
    width : pipeWidth,
    height : pipeHeight
}

//game physics
pipeVelX = 0.1;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    

    //create the flying michi
    catImg = new Image();
    catImg.src = "./Assets/cat_player1.png";
    catImg.onload = function() {
        //Draw the cat & requests animation
        //context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height); //not needed cus of animation loop, without yes
        requestAnimationFrame(animate);
    }
   

    //create paw pipes
    topPipeImg = new Image();
    topPipeImg.src = "./Assets/paw_pipe_orange_stripes_top.png";


}

function animate() {
    //Clear the canvas
    context.clearRect(0,0, boardWidth, boardHeight);

    //Draw cat after clearing again
    context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);

    //Draw paw pipe
    //context.drawImage(topPipeImg, topPipe.x, topPipe.y, topPipe.width, topPipe.height); //not sure if needed because redraws anyway after moves pipe and updates

    //Move paw pipe to the left with set velocity
    topPipe.x -= pipeVelX;
    context.drawImage(topPipeImg, topPipe.x, topPipe.y, topPipe.width, topPipe.height);

    

    //Request the next frame
    requestAnimationFrame(animate);

}