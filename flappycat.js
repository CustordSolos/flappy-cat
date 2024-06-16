// Board constants
let board;
let board_width = 360;
let board_height = 640;
let context;

// Cat constants
let cat_frames = [
    "./assets/cat_player_3x_1.png",
    "./assets/cat_player_3x_2.png",
    "./assets/cat_player_3x_3.png",
    "./assets/cat_player_3x_4.png"];
let cat_images = [];
let cat_frame_index = 0;
let cat_frame_interval;
let cat_img;
let cat_width = 120;
let cat_height = 120;
let cat_x = board_width/8;
let cat_y = board_height/2.3;
let cat_velocity = 0;
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
let background_scroll_speed = -0.3// Speed the backgrounds move left (-0.3)

// Top/bottom banner constants
let top_banner_address = "./assets/cloud_top.png";
let bottom_banner_address = "./assets/cloud_bottom.png";
let banner_width = 360;
let banner_height = 48;
let banner_y_variance = 5; // How many pixels it can deviate from it's fixed position
let top_banner; // Will be an image object
let bottom_banner; // ^^ 
let temp_counter = 0; // Place holder, used in shaking the clouds
let variance_top = 0; // Initial variance
let variance_bottom = 0; // ^^
let banner_variance_delay = 700; // Delay in ms for cloud movement

// Physics constants (super advanced physics engine)
pipe_vel_x = -0.8; // Scroll speed for pipes (paws)
global_accel = 0.06; // G for cat

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
            new_top_pipe.src = "./assets/" + pipe_addresses[index] + "top.png"; // top.png ...
            top_pipe_imgs.push(new_top_pipe);

            // Bottom pipe images
            new_bottom_pipe = new Image();
            new_bottom_pipe.src = "./assets/" + pipe_addresses[index] + "bottom.png"; // bottom.png ...
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
    setInterval(place_paws, 2000); // Places pipes every 2000ms
    document.addEventListener("keydown", cat_jump); 
}

// Create new frame
function animate() {
    requestAnimationFrame(animate);
    context.clearRect(0,0, board_width, board_height);

    // Scroll background (draw first as it is the background)
    // Ensure there are at least two backgrounds (as this is the maximum that could be in the viewport at any time)
    while (background_array.length != 2) {
        place_background();
    }
    if (background_array[0].x < -background_width) {
        let temp_array = [] // Need to use temp_array, acting on the array itself exhibits weird behaviour, you can try it if you want
        temp_array = background_array.slice(1); // ^^ Just change this to background_array = ...
        background_array = temp_array
        place_background();
    }
    // If a background has finished scrolling, pop it from the array and ammend a new one to the end
    // Moves all active backgrounds to the left (background_scroll_speed)
    for (let index = 0; index < background_array.length; index++) {
        let bg = background_array[index];
        bg.x += background_scroll_speed;
        context.drawImage(bg.img, bg.x, 0, background_width, background_height);
    }

    // Redraw cat
    cat_velocity += global_accel; // Sum the global_accel to the cat's velocity (where one unit time is one frame)
    cat.y += cat_velocity; // Changes the position of the cat by the velocity (s = s0 + v) ;)
    // Checks for collision with the base of the canvas (currently acts as a floor, and stops flight animation)
    if (cat.y > board_height - cat_height) {
        cat.y = board_height - cat_height;
        cat_img = cat_images[0];
        clearInterval(cat_frame_interval);
    }
    context.drawImage(cat_img, cat.x, cat.y, cat.width, cat.height);

    // Move and redraw pipes
    for (let index = 0; index < pipe_array.length; index++) { // For all pipes in pipe_array, set a new x value for it and redraw
        let pipe = pipe_array[index];
        pipe.x += pipe_vel_x;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    // Redraw banners last (as they should be highest z-index)
    temp_counter += 1;
    // Change variance at interval
    if (temp_counter > banner_variance_delay / 6) { // This needs redesigning lol, shitty work around for a timer, is entirely reliant on fps
        temp_counter = 0
        variance_top = Math.floor(Math.random() * banner_y_variance);
        variance_bottom = Math.floor(Math.random() * banner_y_variance);
    }
    context.drawImage(top_banner, 0, 0 - variance_top, banner_width, banner_height);
    context.drawImage(bottom_banner, 0, board_height - banner_height + variance_bottom, banner_width, banner_height);
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
        // Needs a passed check here <----
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
        // Needs a passed check here <----
    }
    pipe_array.push(bottom_pipe);
}

function place_background() {
    let bg_img = background_images[random_index(background_addresses.length)]; // Random image object
    let bg_x = 0 // Default position for first image (top left)

    // If already a background, positions x to the left of existing
    if (background_array.length > 0) { 
        bg_x = background_array[0].x + background_width // Sets x value to 1 width away from the background infront of it
    }

    // Background obj
    let background = {
        img: bg_img,
        x: bg_x
    }

    background_array.push(background);
    console.log(background_array) // TEMP
}

// Handle "jump" events
function cat_jump(event) {
    if (event.code == "Space") {
        cat_velocity = -3;
        animate_cat_flight();
    }
}

// Animation for cat "jump" - I grabbed this from GPT, idk how it works yet, needs fine tuning <-----------------
function animate_cat_flight() {
    let animation_duration = cat_frames.length * 100; // GPT - Duration for one cycle of animation (this 100 should really be a constant)

    // GPT - Clear any existing intervals
    if (cat_frame_interval) {
        clearInterval(cat_frame_interval);
    }

    cat_frame_index = 1; // Initial flight frame is the second element (frame) in the cat_frames array (contains image objects)
    cat_frame_interval = setInterval(() => {
        cat_img = cat_images[cat_frame_index];
        cat_frame_index = (cat_frame_index + 1) % cat_frames.length;
    }, 100); // 100ms between frames

    // GPT - Stop the animation after one cycle
    setTimeout(() => {
        clearInterval(cat_frame_interval);
        cat_img = cat_images[0]; // Reset to the first frame
    }, animation_duration);
}

// Return random index given an array_length
function random_index(array_length) {
    return Math.floor(Math.random() * array_length);
}
