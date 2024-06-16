// Board constants
let board;
let board_width = 360;
let board_height = 640;
let context;

// Cat constants
let cat_img;
let cat_width = 120;
let cat_height = 120;
let cat_x = board_width/8;
let cat_y = board_height/2.3;

let cat = {
    x : cat_x, 
    y : cat_y,
    width : cat_width,
    height : cat_height
}


// Pipe constants
let pipe_array = []; // Pipes on screen
let pipe_width = 64;
let pipe_height = 512;
let pipe_x = board_width;
let pipe_y = 0;
let top_pipe_imgs = []; // Image objects
let bottom_pipe_imgs = []; // Image objects
let pipe_addresses = get_pipe_names(); // Image addresses

// Return base pipe names array (without top.png/bottom.png)
function get_pipe_names() {
    let i = "paw_pipe_";
    let pipe_addresses = [
        i + "black_",
        i + "grey_",
        i + "orange_",
        i + "orange_stripes_",
        i + "white_",
        i + "white_stripes_"
    ];
    return pipe_addresses;
}


// Background constants
let background_array = []; // Backgrounds on screen
let background_addresses = [] // Image addresses (shit practice but :D)
let background_images = []; // Image objects
for (let index = 0; index < 7; ++index) { // Backgrounds 1->7
    background_addresses.push("./assets/" + (index+1) + ".png");
}
let background_height = 640;
let background_width = 1920;
let background_scroll_speed = -0.2

// Physics constants (super advanced physics engine)
pipe_vel_x = -0.8;
bird_vel_y = 0.06;

// NASA PC required to reach here \/\/
window.onload = function() {
    board = document.getElementById("board");
    board.height = board_height;
    board.width = board_width;
    context = board.getContext("2d");
    
    // Create airborne michi
    cat_img = new Image();
    cat_img.src = "./assets/cat_player_3x_1.png";

    // Create paw/pipe objects
    [top_pipe_imgs, bottom_pipe_imgs] = get_pipe_images(); 
    // Return two arrays (top and bottom pipes) of image objects
    function get_pipe_images() {
        for (let index = 0; index < pipe_addresses.length; ++index) {
            // Top pipe images
            new_top_pipe = new Image();
            new_top_pipe.src = "./assets/" + pipe_addresses[index] + "top.png";
            top_pipe_imgs.push(new_top_pipe);

            // Bottom pipe images
            new_bottom_pipe = new Image();
            new_bottom_pipe.src = "./assets/" + pipe_addresses[index] + "bottom.png";
            bottom_pipe_imgs.push(new_bottom_pipe);
        }
        return [top_pipe_imgs, bottom_pipe_imgs];
    }

    // Backgrounds
    for (let index = 0; index < background_addresses.length; ++index) {
        new_bg = new Image();
        new_bg.src = background_addresses[index]
        background_images.push(new_bg);
    }

    requestAnimationFrame(animate);
    setInterval(place_paws, 2000);
}

// Create new frame
function animate() {
    requestAnimationFrame(animate);
    context.clearRect(0,0, board_width, board_height);

    // Scroll background
    while (background_array.length != 2) {
        place_background();
    }
    if (background_array[0].x < -background_width) {
        background_array = background_array.slice(1);
        place_background();
    }
    for (let index = 0; index < background_array.length; index++) {
        let bg = background_array[index];
        bg.x += background_scroll_speed;
        context.drawImage(bg.img, bg.x, 0, background_width, background_height);
    }

    // Redraw cat
    context.drawImage(cat_img, cat.x, cat.y, cat.width, cat.height);

    // Move and redraw pipes
    for (let index = 0; index < pipe_array.length; index++) {
        let pipe = pipe_array[index];
        pipe.x += pipe_vel_x;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

}

// Manifest cat grippers
function place_paws() { // Needs: check for game over, check for passed pipes
    // Set height/gap of paw pair
    let random_pipe_y = pipe_y - pipe_height/4- Math.random()*(pipe_height/2);
    let paw_gap = board.height/4;

    // Top pipe obj
    let top_pipe_img = top_pipe_imgs[random_index(pipe_addresses.length)] // Set random image
    let top_pipe = {
        img: top_pipe_img,
        x : pipe_x,
        y : random_pipe_y,
        width : pipe_width,
        height : pipe_height
        // Needs passed check here <----
    }
    pipe_array.push(top_pipe);

    // Bottom pipe obj
    let bottom_pipe_img = bottom_pipe_imgs[random_index(pipe_addresses.length)]; // Set random image
    let bottom_pipe = {
        img: bottom_pipe_img,
        x : pipe_x,
        y : random_pipe_y + pipe_height + paw_gap,
        width : pipe_width,
        height : pipe_height
        // Needs passed check here <----
    }
    pipe_array.push(bottom_pipe);
}

function place_background() {
    let bg_img = background_images[random_index(background_addresses.length)]; // Random image object
    let bg_x = 0 // Default position for first image (top left)

    // If already a background, positions x to the left of existing
    if (background_array.length > 0) { 
        bg_x = background_width - 1 // -1 removes gap
    }

    // Background obj
    let background = {
        img: bg_img,
        x: bg_x
    }

    background_array.push(background);
}

// Return random index given an array_length
function random_index(array_length) {
    return Math.floor(Math.random() * array_length);
}