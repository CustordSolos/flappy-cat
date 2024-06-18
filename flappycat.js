// Canvas 
let canvas;
const canvas_width = 360;
const canvas_height = 640;
let context;
let completed_loading = false;

// Score
let high_score = 0;
let current_score = 0;
let game_over = false;

// Scoreboard
let scoreboard_images = []
let scoreboard = {
    img : "",
    x : 0,
    y : 0
}
const scoreboard_target_y = (canvas_height / 2) - 550 // 550 is centre of screen in png

// Cat
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
let cat_x = canvas_width/8;
let cat_y = canvas_height/2.3;
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
let cat_rotation = 0;
let cat_rotational_vel = 0;
const cat_rotational_accel = 0.001;

// Pipes
let pipe_array = []; // Pipes on screen
const pipe_width = 66; 
const pipe_height = 522; 
let top_pipe_imgs = []; // Image objects
let bottom_pipe_imgs = []; // Image objects
let pipe_addresses = []; // Image addresses
const paw_hitbox = {
    x1 : 9,
    x2 : 54,
    y1 : 0,
    y2 : 0
}
let place_pipe_interval;

// Background
let background_array = []; // Backgrounds on screen
let background_addresses = []
let background_images = []; // Image objects
const background_height = 640;
const background_width = 1920;
const background_scroll_speed = -0.3
const flash_intensity = 0.8;
let current_flash_intensity = flash_intensity;

// Top/bottom banner
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

// Numbers
let score_array = [];
let number_addresses = [];
let number_images = [];
const number_height = 45;
const score_display_y = 80

// Physics (super advanced physics engine)
const pipe_vel_x = -0.8; // Scroll speed for pipes (paws)
const global_accel = 0.06; // G for cat
const max_vel = 10;




// NASA PC required to reach here \/\/
window.onload = async function() {
    canvas = document.getElementById("canvas");
    canvas.height = canvas_height;
    canvas.width = canvas_width;
    context = canvas.getContext("2d");
    await new Promise((resolve, reject) => {
        load_and_push_assets(resolve); // Pass resolve function to load_and_push_assets
    });
    update_score_array(); // Set initial 0

    requestAnimationFrame(animate); // Calls animate at a rate matching refresh rate
    setInterval(update_banner_variance, 1000) // Changes cloud pos every second
    document.addEventListener("keydown", cat_jump); 
}

// Load all images
function load_and_push_assets(resolve) {
    let promises = [];

    // Michi (cat frames)
    cat_frames.forEach(address => {
        let new_frame = new Image();
        new_frame.src = address;
        cat_images.push(new_frame);
        promises.push(new Promise((resolve, reject) => {
            new_frame.onload = resolve;
            new_frame.onerror = reject;
        }));
    });
    // Set initial cat image
    cat_img = cat_images[0];

    // Pipes
    for (let index = 0; index < 8; ++index) {
        pipe_addresses.push("./assets/paw_pipe_3x_" + (index + 1));
    }
    pipe_addresses.forEach(address => {
        let new_top_pipe = new Image();
        new_top_pipe.src = address + "_top.png";
        top_pipe_imgs.push(new_top_pipe);
        promises.push(new Promise((resolve, reject) => {
            new_top_pipe.onload = resolve;
            new_top_pipe.onerror = reject;
        }));

        let new_bottom_pipe = new Image();
        new_bottom_pipe.src = address + "_bottom.png";
        bottom_pipe_imgs.push(new_bottom_pipe);
        promises.push(new Promise((resolve, reject) => {
            new_bottom_pipe.onload = resolve;
            new_bottom_pipe.onerror = reject;
        }));
    });

    // Backgrounds
    for (let index = 0; index < 7; ++index) {
        background_addresses.push("./assets/" + (index + 1) + ".png");
    }
    background_addresses.forEach(address => {
        let new_bg = new Image();
        new_bg.src = address;
        background_images.push(new_bg);
        promises.push(new Promise((resolve, reject) => {
            new_bg.onload = resolve;
            new_bg.onerror = reject;
        }));
    });

    // Banners (clouds)
    top_banner = new Image();
    top_banner.src = top_banner_address;
    promises.push(new Promise((resolve, reject) => {
        top_banner.onload = resolve;
        top_banner.onerror = reject;
    }));

    bottom_banner = new Image();
    bottom_banner.src = bottom_banner_address;
    promises.push(new Promise((resolve, reject) => {
        bottom_banner.onload = resolve;
        bottom_banner.onerror = reject;
    }));

    // Numbers
    for (let index = 0; index < 10; ++index) {
        number_addresses.push("./assets/number_" + (index) + ".png");
    }
    number_addresses.forEach(address => {
        let new_number = new Image();
        new_number.src = address;
        number_images.push(new_number);
        promises.push(new Promise((resolve, reject) => {
            new_number.onload = resolve;
            new_number.onerror = reject;
        }));
    });

    // Scoreboard
    var scoreboard_addresses = [];
    for (let index = 1; index < 3; ++index) {
        scoreboard_addresses.push("./assets/scoreboard_" + (index) + ".png");
    }
    scoreboard_addresses.forEach(address => {
        let new_board = new Image();
        new_board.src = address;
        scoreboard_images.push(new_board);
        promises.push(new Promise((resolve, reject) => {
            new_board.onload = resolve;
            new_board.onerror = reject;
        }));
    });

    // Ensure all assets have laoded
    Promise.all(promises).then(() => {
        resolve();
    }).catch(error => {
        console.error("it worked on my pc, you issue rlly:", error);
    });
}

// Create new frame
function animate() {
    requestAnimationFrame(animate);
    draw_assets();
    if (game_over == true) {
        move_scoreboard();
    }
    else {
        gameplay_loop(); // Start initial gameplay loop
    }
}

// Gameplay loop when cat is alive
function gameplay_loop() {
    if (!place_pipe_interval) {
        place_pipe_interval = setInterval(place_paws, 2000); // Places pipes every 2000ms
    }

    // Backgrounds
    // Ensure 2 backgrounds in array
    while (background_array.length != 2) {
        place_background();
    }
    // Scroll left
    for (let index = 0; index < background_array.length; index++) {
        let bg = background_array[index];
        bg.x += background_scroll_speed;
    }
    // Pop and replace finished images
    if (background_array[0].x < -background_width) {
        background_array.shift();
        place_background();
    }

    // Cat
    // Update velocity and y position
    cat_velocity += global_accel; 
    cat_velocity = Math.min(cat_velocity, max_vel); 
    cat.y += cat_velocity; 
    // Collision with canvas top/bottom
    if (cat.y < 0 - cat_height) {
        cat.y = canvas_height;
    }
    if (cat.y > canvas_height) {
        cat.y = 0 - cat_height;
    }

    // Pipes
    for (let index = 0; index < pipe_array.length; index++) { 
        let pipe = pipe_array[index];
        // Scroll left
        pipe.x += pipe_vel_x;
        // Check for collisions with cat
        if (collision(cat, pipe)) {
            game_over = true;
            animate_scoreboard();
        }
        // Update score if pipe is passed
        if (pipe.passed == false && cat.x + (cat_width / 2) > pipe.x + (pipe_width / 2)) {
            current_score += 1;
            pipe.passed = true;
            update_score_array();
        }
    }
    // Pop pipes that finish scrolling
    if (pipe_array.length > 0 && pipe_array[0].x < -pipe_width) {
        pipe_array.shift();
    }
}

function move_scoreboard() {
    scoreboard.y += 5;
    scoreboard.y = Math.min(scoreboard.y, scoreboard_target_y);
}
// Draw all elements to canvas
function draw_assets() {
    // Clear canvas
    context.clearRect(0,0, canvas_width, canvas_height);

    // Background
    for (let index = 0; index < background_array.length; index++) {
        let bg = background_array[index];
        context.drawImage(bg.img, bg.x, 0, background_width, background_height);
    }

    // Pipes
    if (pipe_array.length > 0) {
        for (let index = 0; index < pipe_array.length; index++) {
            let pipe = pipe_array[index];
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe_width, pipe_height);
        }
    }

    // Michi
    if (game_over) {
        cat_rotational_vel = Math.min(cat_rotational_vel + cat_rotational_accel, 0.2);
        cat_rotation = Math.min(cat_rotation + cat_rotational_vel, 0.5)
        cat_velocity += 0.2; 
        cat_velocity = Math.min(cat_velocity, max_vel); 
        cat.y += cat_velocity; 
        drawRotatedImage(cat_img, cat.x, cat.y, cat.width, cat.height, cat_rotation * Math.PI); // Angle is in radians
    }
    else {
        context.drawImage(cat_img, cat.x, cat.y, cat.width, cat.height);
    }


    // Clouds/banners
    context.drawImage(top_banner, 0, 0 - variance_top, banner_width, banner_height);
    context.drawImage(bottom_banner, 0, canvas_height - banner_height + variance_bottom, banner_width, banner_height);

    // Score
    for (let index = 0; index < score_array.length; index++) {
        var current_num = score_array[index];
        context.drawImage(current_num.img, current_num.x_pos, score_display_y, current_num.img.width, number_height);
    }

    if (game_over) {
        context.fillRect(0, 0, canvas_width, canvas_height);
        current_flash_intensity -= 0.02
        context.fillStyle = `rgba(0, 0, 0, ${current_flash_intensity})`;
        context.drawImage(scoreboard.img, scoreboard.x, scoreboard.y, scoreboard.img.width, scoreboard.img.height);
    }
}

function animate_scoreboard() {
    scoreboard.img = scoreboard_images[0];
    scoreboard.y = - scoreboard.img.height;
    scoreboard.x = (canvas_width / 2) - (scoreboard.img.width / 2)
    let scoreboard_frame_index = 0; 
    let scoreboard_frame_interval = setInterval(() => {
        scoreboard.img = scoreboard_images[scoreboard_frame_index];
        scoreboard_frame_index += 1;
    }, frame_interval);

    // Stop the animation after one animation duration
    setTimeout(() => {
        clearInterval(scoreboard_frame_interval);
    }, 200);
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
    let paw_gap = canvas.height/4;

    // Top pipe obj
    let top_pipe_img = top_pipe_imgs[random_index(pipe_addresses.length)] // Set random image
    let top_pipe = {
        img: top_pipe_img,
        x: canvas_width,
        y: random_pipe_y,
        passed: false
    }
    pipe_array.push(top_pipe);

    // Bottom pipe obj (no passed bool, only need to check 1 pipe not both)
    let bottom_pipe_img = bottom_pipe_imgs[random_index(pipe_addresses.length)]; // Set random image
    let bottom_pipe = {
        img : bottom_pipe_img,
        x : canvas_width,
        y : random_pipe_y + pipe_height + paw_gap,
    }
    pipe_array.push(bottom_pipe);
}

// Push to background_array
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

// Create score array (image and x pos)
function update_score_array() {
    score_array = []
    var score_lst = Array.from(current_score.toString());
    // Find pixel length
    var score_width = 0;
    for (let index = 0; index < score_lst.length; index++) {
        var current_num = Number(score_lst[index]);
        var number_width = number_images[current_num].width;
        score_width += number_width;
    }
    // Each integer in score
    for (let index = 0; index < score_lst.length; index++) {
        var current_num = Number(score_lst[index]);
        var number_width = number_images[current_num].width;
        // X position for first number
        if (score_array.length == 0) {
            var x_pos = (canvas_width / 2) - (score_width / 2) // Centre of canvas - 1/2 total width
        }
        // X position for non-first numbers
        else {
            var x_pos = score_array[index - 1].x_pos + score_array[index - 1].img.width;
        }
        new_number = {
            img : number_images[current_num],
            x_pos : x_pos
        }
        score_array.push(new_number);
    }
    console.log(score_array)
}
// Handle "jump" events AND restart
function cat_jump(event) {
    if (event.code == "Space") {
        if (!game_over) {
            cat_velocity = -3;
            animate_cat_flight();
        } else if (game_over && cat.y > canvas_height) {
            reset_gameplay_loop();
        }
    }
}
// Reset vars for gameplay loop
function reset_gameplay_loop() {
    cat.y = cat_y;
    cat_velocity = 0;
    pipe_array = [];
    current_score = 0;
    background_array = [];
    place_pipe_interval = clearInterval(place_pipe_interval);
    update_score_array();
    cat_rotation = 0;
    cat_rotational_vel = 0;
    current_flash_intensity = flash_intensity;
    scoreboard.y = -scoreboard.img.height
    game_over = false;
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

// Function to draw the rotated image
function drawRotatedImage(img, x, y, width, height, angle) {
    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.rotate(angle);
    context.drawImage(img, -width / 2, -height / 2, width, height);
    context.restore();
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
