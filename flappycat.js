// Board constants
let board;
const board_width = 360;
const board_height = 640;
let context;

// Score
let high_score = 0;
let current_score = 0;
let game_over = false;
// Cat constants
const cat_frames = [
    "./assets/cat_player_3x_1.png",
    "./assets/cat_player_3x_2.png",
    "./assets/cat_player_3x_3.png",
    "./assets/cat_player_3x_4.png"];
let cat_images = [];
let cat_frame_index = 0;
const frame_interval = 100;
const animation_duration = cat_frames.length * frame_interval;
let cat_frame_interval = 100;
let cat_img;
const cat_width = 120;
const cat_height = 120;
let cat_x = board_width/8;
let cat_y = board_height/2.3;
let cat_velocity = 0;
let cat = {
    x : cat_x, 
    y : cat_y,
    width : cat_width,
    height : cat_height
}
const cat_hitbox = {
    x1 : 60,
    x2 : 116,
    y1 : 60,
    y2 : 102
}


// Pipe constants
let pipe_array = []; // Pipes on screen
const pipe_width = 66; 
const pipe_height = 522; 
let top_pipe_imgs = []; // Image objects
let bottom_pipe_imgs = []; // Image objects
let pipe_addresses = []; // Image addresses
// Pipe file names (without top/bottom)
for (let index = 0; index < 8; ++index) {
    pipe_addresses.push("./assets/paw_pipe_3x_" + (index+1));
}
const paw_hitbox = {
    x1 : 9,
    x2 : 54,
    y1 : 0,
    y2 : 0
}
let place_pipe_interval;


// Background constants
let background_array = []; // Backgrounds on screen
let background_addresses = []
let background_images = []; // Image objects
// Background file names 1 -> 7
for (let index = 0; index < 7; ++index) {
    background_addresses.push("./assets/" + (index+1) + ".png");
}
const background_height = 640;
const background_width = 1920;
const background_scroll_speed = -0.3

// Top/bottom banner constants
const top_banner_address = "./assets/cloud_top.png";
const bottom_banner_address = "./assets/cloud_bottom.png";
const banner_width = 360;
const banner_height = 48;
const banner_y_variance = 5; // How many pixels it can deviate from it's fixed position
let top_banner; // Will be an image object
let bottom_banner; // ^^ 
let temp_counter = 0; // Place holder, used in shaking the clouds
let variance_top = 0; // Initial variance
let variance_bottom = 0; // ^^
const banner_variance_delay = 700; // Delay in ms for cloud movement

// Physics constants (super advanced physics engine)
const pipe_vel_x = -0.8; // Scroll speed for pipes (paws)
const global_accel = 0.06; // G for cat
const max_vel = 10;

// NASA PC required to reach here \/\/
window.onload = function() {
    board = document.getElementById("board");
    board.height = board_height;
    board.width = board_width;
    context = board.getContext("2d");
    
    // Create airborne michi
    cat_frames.forEach(src => {
        let img = new Image();
        img.src = src;
        cat_images.push(img);
    });

    // Set initial cat image
    cat_img = cat_images[0];

    // Create paw/pipe objects
    [top_pipe_imgs, bottom_pipe_imgs] = get_pipe_images(); // This is just written in [ ] because the function returns 2 variables, they can still be accessed individually, it is not an array
    // Return two arrays (top and bottom pipes) of image objects
    function get_pipe_images() {
        for (let index = 0; index < pipe_addresses.length; ++index) { // Recall that pipe_addresses is an array holding the file names
            // Top pipe images
            new_top_pipe = new Image();
            new_top_pipe.src = pipe_addresses[index] + "_top.png"; // top.png ...
            top_pipe_imgs.push(new_top_pipe);

            // Bottom pipe images
            new_bottom_pipe = new Image();
            new_bottom_pipe.src = pipe_addresses[index] + "_bottom.png"; // bottom.png ...
            bottom_pipe_imgs.push(new_bottom_pipe);
        }
        return [top_pipe_imgs, bottom_pipe_imgs];
    }

    // Backgrounds
    for (let index = 0; index < background_addresses.length; ++index) { // For all file addresses in the background_addresses, create new image objects and add them to the background_images array
        new_bg = new Image();
        new_bg.src = background_addresses[index];
        background_images.push(new_bg);
    }

    // Banners (clouds)
    top_banner = new Image();
    top_banner.src = top_banner_address;
    bottom_banner = new Image();
    bottom_banner.src = bottom_banner_address;

    requestAnimationFrame(animate); // Starts animation loop
    setInterval(update_banner_variance, 1000) // Changes cloud pos every second
    document.addEventListener("keydown", cat_jump); 
}

// Create new frame
function animate() {
    requestAnimationFrame(animate);

    if (game_over == true) {
        return;
    }

    if (!place_pipe_interval) {
        place_pipe_interval = setInterval(place_paws, 2000); // Places pipes every 2000ms
    }
    
    context.clearRect(0,0, board_width, board_height);

    // Scroll background (draw first as it is the background)
    // Ensure there are at least two backgrounds (as this is the maximum that could be in the viewport at any time)
    while (background_array.length != 2) {
        place_background();
    }
    // Moves all active backgrounds to the left (background_scroll_speed)
    for (let index = 0; index < background_array.length; index++) {
        let bg = background_array[index];
        bg.x += background_scroll_speed;
        context.drawImage(bg.img, bg.x, 0, background_width, background_height);
    }
    // Remove backgrounds that finish scrolling
    if (background_array[0].x < -background_width) {
        background_array.shift();
        place_background();
    }

    // Redraw cat
    cat_velocity += global_accel; // Sum the global_accel to the cat's velocity (where one unit time is one frame)
    cat_velocity = Math.min(cat_velocity, max_vel); // Ensure max velocity is not exceeded
    cat.y += cat_velocity; // Changes the position of the cat by the velocity (s = s0 + v) ;)
    // Checks for  cat collision with canvas edges
    if (cat.y < 0 - cat_height) {
        cat.y = board_height;
    }
    if (cat.y > board_height) {
        cat.y = 0 - cat_height;
    }
    context.drawImage(cat_img, cat.x, cat.y, cat.width, cat.height);

    // Move and redraw pipes
    for (let index = 0; index < pipe_array.length; index++) { // For all pipes in pipe_array, set a new x value for it and redraw
        let pipe = pipe_array[index];
        pipe.x += pipe_vel_x;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe_width, pipe_height);
        if (!pipe.passed && cat.x + (cat_width / 2) > pipe.x + (pipe_width / 2)) {
            current_score += 1;
            pipe.passed = true;
        }
        if (collision(cat, pipe)) {
            game_over = true;
            console.log(current_score);
        }
    }

    if (pipe_array.length > 0 && pipe_array[0].x < - pipe_width) {
        pipe_array.shift();
    }

    // Draw banners
    context.drawImage(top_banner, 0, 0 - variance_top, banner_width, banner_height);
    context.drawImage(bottom_banner, 0, board_height - banner_height + variance_bottom, banner_width, banner_height);
}

// Update banner variation (for position)
function update_banner_variance() {
    variance_top = Math.floor(Math.random() * banner_y_variance);
    variance_bottom = Math.floor(Math.random() * banner_y_variance);
}

// Manifest cat grippers
function place_paws() { // Needs: check for game over, check for passed pipes
    // Returns if user has game overed
    if (game_over == true) {
        return;
    }
    // Set height/gap of paw pair
    let random_pipe_y = 0 - pipe_height/4- Math.random()*(pipe_height/2);
    let paw_gap = board.height/4;

    // Top pipe obj
    let top_pipe_img = top_pipe_imgs[random_index(pipe_addresses.length)] // Set random image
    let top_pipe = {
        img: top_pipe_img,
        x: board_width,
        y: random_pipe_y,
        passed: false
    }
    pipe_array.push(top_pipe);

    // Bottom pipe obj (no passed bool, only need to check 1 pipe not both)
    let bottom_pipe_img = bottom_pipe_imgs[random_index(pipe_addresses.length)]; // Set random image
    let bottom_pipe = {
        img : bottom_pipe_img,
        x : board_width,
        y : random_pipe_y + pipe_height + paw_gap,
    }
    pipe_array.push(bottom_pipe);
}

function place_background() {
    let bg_img = background_images[random_index(background_addresses.length)]; // Random image object
    let bg_x = 0 // Default position for first image (top left)

    // If already a background, positions x to the left of existing
    if (background_array.length > 0) { 
        bg_x = background_array[0].x + background_width - 1 // Sets x value to 1 width away from the background infront of it (-1 removes gap that appears, I assume as a result of time inbetween operations)
    }

    // Background obj
    let background = {
        img: bg_img,
        x: bg_x
    }

    background_array.push(background);
}

// Handle "jump" events
function cat_jump(event) {
    if (event.code == "Space") {
        cat_velocity = -3;
        animate_cat_flight();

        if (game_over) {
            cat.y = cat_y;
            pipe_array = [];
            score = 0;
            background_array = [];
            place_pipe_interval = 
            game_over = false;
        }
    }
}

// Animation for cat flap
function animate_cat_flight() {
    // Clear interval if not in animation, else return (letting old animation finish)
    if (cat_img == cat_images[0]) {
        clearInterval(cat_frame_interval);
    }
    else {
        return;
    }

    cat_frame_index = 1; // Start animation at 2nd frame
    cat_frame_interval = setInterval(() => {
        cat_img = cat_images[cat_frame_index];
        cat_frame_index += 1;
    }, frame_interval);

    // Stop the animation after one animation duration
    setTimeout(() => {
        clearInterval(cat_frame_interval);
        cat_img = cat_images[0]; // Reset to the first frame
    }, animation_duration);
}

function collision(cat, pipe) {
    return (cat.x + cat_hitbox.x2 > pipe.x + paw_hitbox.x1 && // Cat right > pipe left
        cat.x + cat_hitbox.x1 < pipe.x + paw_hitbox.x2 && // Cat left < pipe right
        cat.y + cat_hitbox.y1 < pipe.y + pipe_height && // Cat top > pipe bottom I DON'T KNOW HOW THESE ARE + WHEN Y IS -VE
        cat.y + cat_hitbox.y2 > pipe.y) // Cat bottom < pipe top
}
    

// Return random index given an array_length
function random_index(array_length) {
    return Math.floor(Math.random() * array_length);
}
