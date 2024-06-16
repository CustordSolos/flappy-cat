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

//set object for paw pipes
let pipeArray = [];
let pipeWidth;
let pipeHeight;
let pipeX;
let pipeY;
let topPipeImg;
let bottomPipeImg;





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
    topPipeImg.src = "./Assests/paw_pipe_orange_stripes_top.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./Assests/paw_pipe_orange_stripes.png";

}

function animate() {
    //Clear the canvas
    context.clearRect(0,0, boardWidth, boardHeight);

    //Draw cat after clearing again
    context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);

    //Request the next frame
    requestAnimationFrame(animate);

    

}