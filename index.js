var cv, gc;
            
let fx = 300, max_fy = 400, max_jump = 25, block = 64, max_jump_count = 2, max_fspeed = 20, min_fspeed = 10, afspeed = 0.01, max_mtspeed = 1, max_truck_x = 30;
let grvt = 8, min_obj_freq = 10, max_obj_freq = 100, obj_spawn = 0, max_hp = 3, max_muteki = 100;
var fym,  jump, dirt_x, mt_x, fspeed, mtspeed, truck_x, truckspeed, score, game_over_count, hp, muteki, music_pun_played;
var jump_count;
var game_over;
var scene; // Title, Game, Over
var music_title_played;
//var music_title, music_game, music_over;
var audio_trigger;

var objects_num_max = 10, object_num;
var objects = new Array(objects_num_max);

function init(){
    cv = document.getElementById("cv");
    gc = cv.getContext("2d");
    gc.imageSmoothingEnabled= false;
    onkeydown = key_process;
    onmousedown  = mouse_process;
    ontouchstart = touch_process;
    timer = setInterval(game_process, 20);
    audio_trigger = false;
    music_game.loop = true;

    reset(0);
}

function reset(scene_arg){
    fym = 0;
    jump = 0;
    dirt_x = 0;
    mt_x = 0;
    score = 0;
    scene = scene_arg;
    truck_x = max_truck_x;
    truckspeed = 0;
    fspeed = min_fspeed;
    mtspeed = max_mtspeed;
    jump_count = max_jump_count;
    object_num = 0;
    game_over = false;
    game_over_count = 0;
    hp = max_hp;
    muteki = 0;
    music_pun_played = false;
    /*
    music_title_played = false;
    music_game_played = false;
    music_over_played = false;
    */

    for(i = 0; i< objects_num_max; i++){
        objects[i] = {
            enable:false,
            img:0,
            x:0,
            y:0,
            width:0,
            height:0,
        };
    }
}

function game_process(){

    base_draw_process();

    switch(scene){
        case 0:

            title_draw_process();
            break;
        case 1:

            flygon_process();
            object_process();
            game_sub_process();
            game_draw_process();

            break;

        default: break;
    }
}

function base_draw_process(){

    gc.fillStyle = "#ABEEFF";
    gc.fillRect(0, 0, cv.width, max_fy+block);
    gc.fillStyle = "#F9D980";
    gc.fillRect(0, max_fy+block, cv.width, cv.height-max_fy-block);   

    for(i = 0; i<2; i++){
        gc.drawImage(imgMt, -mt_x + i*imgMt.width, max_fy - imgMt.height, imgMt.width, imgMt.height);
    }

    gc.drawImage(imgSun, cv.width*0.8, cv.height*0.1, cv.width*0.1, cv.width*0.1);
    
    for(i = 0; i<cv.width+block; i+= block){
        gc.drawImage(imgDirt, i-dirt_x, max_fy, block, block);
    }
}

function title_draw_process(){
    gc.drawImage(imgFlygon,(cv.width-imgFlygon.width)*0.2, max_fy- imgFlygon.height, imgFlygon.width, imgFlygon.height);
    gc.drawImage(imgTitle, (cv.width-imgTitle.width)*0.5, (cv.height-imgTitle.height)*0.5, imgTitle.width, imgTitle.height);
    
    if(audio_trigger == false){
        gc.drawImage(imgMaudio, 0, 0, imgAudio.width, imgAudio.height)
    }
    else{
        gc.drawImage(imgAudio, 0, 0, imgAudio.width, imgAudio.height)
    }
}

function game_sub_process(){
    fspeed += afspeed;
    if(fspeed > max_fspeed) fspeed = max_fspeed;

    dirt_x += fspeed;
    if(dirt_x > block)dirt_x = 0;

    muteki -= 1;
    if(muteki < 0) muteki = 0;

    mt_x += mtspeed;
    if(mt_x > imgMt.width) mt_x -= imgMt.width;

    if(game_over == true){
        fspeed  *= 0.9;
        mtspeed *= 0.9;

        if(fspeed < 0.1)fspeed = 0;
        if(mtspeed < 0.1)mtspeed = 0;

        jump_count = 0;

        truckspeed = min_fspeed - fspeed;
        truck_x += truckspeed;

        game_over_count++;
    }
    else{
        score++;
    }

}

function game_draw_process(){

    gc.font = "20pt Arial";
    gc.fillStyle = "rgba(100, 100, 130)";
    gc.fillText("Score : " + score.toString(), 10, 30);

    var fy = max_fy - fym - imgFlygon.height;
    if(game_over == false){
        if((muteki/2)%2 == 0)
            gc.drawImage(imgFlygon, fx, fy, imgFlygon.width, imgFlygon.height);
    }
    else{
        if(fx>truck_x){
            gc.drawImage(imgPon, fx, fy, imgPon.width, imgPon.height);
        }
        else{
            if(audio_trigger == true){
                if(music_pun_played == false){
                    music_pun_played = true;
                    music_pun.play();
                }
            }
                
            gc.drawImage(imgDeath, fx, fy, imgDeath.width, imgDeath.height);
        }

        gc.drawImage(imgGov, (cv.width-imgGov.width)*0.5, (cv.height-imgGov.height)*0.8, imgGov.width, imgGov.height);

    }

    gc.drawImage(imgTruck, truck_x, max_fy - imgTruck.height, imgTruck.width, imgTruck.height);

    for(i = 0; i< objects_num_max; i++){
        if (objects[i].enable == false) continue;
        objects[i].x -= fspeed;
        if(objects[i].x + objects[i].width < 0) objects[i].enable = false;
        gc.drawImage(objects[i].img, objects[i].x, objects[i].y, objects[i].width, objects[i].height);

        if(Math.abs(objects[i].x - fx) < (objects[i].width + imgFlygon.width )/3 &&
           Math.abs(objects[i].y - fy) < (objects[i].height+ imgFlygon.height)/3 &&
           muteki == 0){
            hp--;
            
            if(hp == 0) {
                game_over_process();
            }
            else{
                
                crash();
                muteki = max_muteki;
            }
        }
    }

}

function object_process(){

    obj_spawn++;

    if(objects[object_num].enable == true) return;
    if(obj_spawn < min_obj_freq) return;
    var rd_range = 200; 
    if(obj_spawn > max_obj_freq) rd_range = 0;

    switch(Math.floor( Math.random()*rd_range)){
        case 0:
            objects[object_num].img = imgTree;
            break;
        case 1:
            objects[object_num].img = imgLtree;
            break;
        case 2:
            objects[object_num].img = imgHouse;
            break;
        case 3:
            objects[object_num].img = imgObj;
            break;
        default:
            return;
    }
    
    objects[object_num].enable = true;
    objects[object_num].x = cv.width;
    objects[object_num].y = max_fy - objects[object_num].img.height;
    objects[object_num].width = objects[object_num].img.width;
    objects[object_num].height = objects[object_num].img.height;

    object_num++;
    if(object_num >= objects_num_max) object_num = 0;

    obj_spawn = 0;
    
}

function flygon_process(){    
    fym = fym + jump - grvt;
    jump -= 1;
    if(fym < 0){
        fym = 0;
        jump = 0;
        jump_count = max_jump_count;
    }
}

function jump_process(){
    if(jump_count != 0){
        jump = max_jump;
        jump_count--;
    }
}

function crash(){
    if(audio_trigger == true){
        music_over.currentTime = 0;
        music_over.play();
    }
}

function game_over_process(){
    game_over = true;
    if(audio_trigger == true){
        music_game.pause();
        crash();
    }
}

function key_process(event){
    switch(event.keyCode){
        case 32:
            mouse_process(0);
            break;
        case 38:
            reset(1);
            break;
    }
}

function audio_process(){
    audio_trigger = !audio_trigger;
    if(audio_trigger == false){
        music_title.pause();
    }
    else{
        music_title.currentTime = 0;
        music_title.play();
    }
    
}

function touch_process(event){
    mouse_process({ x:event.touches[0].clientX, y:event.touches[0].clientY });
}

function mouse_process(event){
    switch(scene){
        case 0:
            if(event.x < imgAudio.width && event.y < imgAudio.height){
                audio_process();
            }
            else{
                if(audio_trigger == true){
                    music_title.pause();
                    music_game.currentTime = 0;
                    music_game.play();
                }
                scene = 1;
            }
            break;
        case 1:
            if(game_over == false)
                jump_process();
            else{
                if(game_over_count < 50) break;
                if(audio_trigger == true){
                    music_over.pause();
                    music_game.currentTime = 0;
                    music_game.play();
                }
                reset(1);
            }
            break;
        default:break;
    }
}