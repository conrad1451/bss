// engine/assetLoader.js

// CHQ: Gemini AI generated file


//  CHQ: Gemini AI generated function
function drawRandomText(ctx, text) {
    ctx.translate(MATH.random(12, 500), MATH.random(12, 500));
    ctx.scale((Math.random() + 0.5) * 3, (Math.random() + 0.5) * 3);
    ctx.rotate(Math.random() * 6.28);
    ctx.fillText(text, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//  CHQ: Gemini AI generated function
export function generateDefaultNoise(tex_ctx) {
    for (let i = 0; i < 10; i++) {
        // Draw random "dirt" patches
        tex_ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.2 + ")";
        tex_ctx.fillRect(
            MATH.random(12, 500), 
            MATH.random(12, 500), 
            MATH.random(25, 45), 
            MATH.random(25, 45)
        );

        // Draw the hidden Thai text easter eggs
        tex_ctx.fillStyle = "rgba(0,0,0,0.015)";
        
        // "Carlson never dies"
        drawRandomText(tex_ctx, "คาร์ลสันไม่เคยตาย");
        
        // "Dat is a very cool person"
        drawRandomText(tex_ctx, "ดาท เป็นเจ๋งคนมาก");
    }
}


export function loadTextures(gl, tex_ctx) {
    const out = {};
    
    // 1. Clear the scratchpad canvas
    tex_ctx.clearRect(0, 0, 2048, 2048); // [cite: 878]

    // // 2. Generate Default/World Textures
    // // This part includes the "Carlson never dies" easter egg logic [cite: 878]
    // out.default = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, out.default);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex_ctx.getImageData(0, 0, 512, 512)); // [cite: 879]
    // gl.generateMipmap(gl.TEXTURE_2D);

    
    generateDefaultNoise(tex_ctx);
    
    // 3. Load Specialized Atlases
    // Effects, Flowers, and Bees depend on external window functions [cite: 879, 882]
    window.textures_effects(tex_ctx);
    out.effects = createGLTexture(gl, tex_ctx, 2048);

    window.textures_flowers(tex_ctx);
    out.flowers = createGLTexture(gl, tex_ctx, 1024, gl.CLAMP_TO_EDGE); [cite: 879]

    // 4. Generate Font Atlas (The character set)
    // This draws the alphabet and symbols to the canvas context [cite: 880-881]
    tex_ctx.clearRect(0, 0, 512, 600);
    tex_ctx.font = "bold 60px arial";
    tex_ctx.fillStyle = "rgb(255,255,255)";
    tex_ctx.strokeStyle = "rgb(0,0,0)";
    tex_ctx.lineWidth = 9;
    tex_ctx.textAlign = "center";
    tex_ctx.textBaseline = "middle";
    out.text = createGLTexture(gl, tex_ctx, 512, 600); //[cite: 882]

    // 5. Generate Bee Textures
    window.textures_bees(tex_ctx);
    out.bees = createGLTexture(gl, tex_ctx, 2048); //[cite: 882]

    // 6. Generate UI Decals and NPC Textures
    window.textures_decals(tex_ctx);
    out.decals = createGLTexture(gl, tex_ctx, 1024); //[cite: 883]

    window.textures_bear(tex_ctx);
    out.bear = createGLTexture(gl, tex_ctx, 1024); //[cite: 883]

    return out;
}

// Internal helper for repetitive WebGL texture boiler-plate
function createGLTexture(gl, ctx, width, height = width, wrapMode = gl.REPEAT) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, ctx.getImageData(0, 0, width, height));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
    gl.generateMipmap(gl.TEXTURE_2D);
    return tex;
}