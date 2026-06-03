// engine/shaders.js

// CHQ: Gemini AI generated file
// CHQ: Claude AI (Haiku) translated each shader to new version (Except for staticVSH and trailRendererFSH)
// CHQ: Chat GPT () translated trailRendererFSH to new version
export const SHADERS = {
  staticVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec4 vertColor;
    in vec3 vertUV;
    
    // 2. Outputs to the fragment shader
    out float pixFog;
    out vec4 pixColor;
    out vec3 pixUV;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    void main(){
        vec4 viewPos =  viewMatrix * vec4(vertPos, 1.0);
        
        // Passing data through to the fragment shader
        pixColor = vertColor;
        pixUV = vertUV;
        pixFog = viewPos.z;
        
        gl_Position = projMatrix * viewPos;
    }
  `,

  staticFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in float pixFog;
    in vec4 pixColor;
    in vec3 pixUV;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    // 3. Global constants
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        // Sample the texture at UV coordinates
        vec4 t = texture(tex, pixUV.xy);
        
        // Mix texture with vertex color, apply fog gradient, and apply night effect
        fragColor = vec4(
            mix(
                mix(mix(pixColor.rgb, t.rgb, t.a), pixColor.rgb, pixUV.z),
                vec3(1.0, 1.0, 0.7),
                smoothstep(20.0, 120.0, pixFog) * 0.7
            ) * isNight,
            pixColor.w
        );
    }
`,

  dynamicVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec3 vertColor;
    in vec3 vertNormal;
    
    // 2. Outputs to the fragment shader
    out vec3 pixColor;
    out vec3 pixNormal;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    uniform mat4 modelMatrix;
    
    void main(){
        // Transform vertex position to view space
        vec4 viewPos = viewMatrix * modelMatrix * vec4(vertPos, 1.0);
        
        // Pass color to fragment shader
        pixColor = vertColor;
        
        // Transform normal to world space
        pixNormal = mat3(modelMatrix) * vertNormal;
        
        gl_Position = projMatrix * viewPos;
    }
`,

  dynamicFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec3 pixColor;
    in vec3 pixNormal;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    // 3. Global constants
    uniform float isNight;
    
    void main(){
        // Normalize the interpolated normal vector
        vec3 normal = normalize(pixNormal);
        
        // Calculate shading based on light direction and normal
        float shade = dot(normal, LIGHT_DIR) * 0.5 + 0.55;
        
        // Apply color, shading, and night effect
        fragColor = vec4(pixColor * shade * isNight, 1.0);
    }
`,

  tokenVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec2 vertUV;
    in vec4 instance_pos;
    in vec4 instance_uv;
    
    // 2. Outputs to the fragment shader
    out vec3 pixUV;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    void main(){
        // Apply instance UV offset
        pixUV = vec3(vertUV, 0.0) + instance_uv.xyz;
        
        // Scale vertex position by instance scale
        vec3 vp = vertPos * instance_uv.w;
        
        // Pre-calculate sin and cos of instance rotation
        float s = sin(instance_pos.w);
        float c = cos(instance_pos.w);
        
        // Apply Y-axis rotation
        vp = vec3(vp.x * s - vp.z * c, vp.y, vp.x * c + vp.z * s);
        
        // Transform to view space and apply instance position offset
        gl_Position = projMatrix * viewMatrix * vec4(vp + instance_pos.xyz, 1.0);
    }
`,

  tokenFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec3 pixUV;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    // 3. Global constants
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        // Sample texture and apply night effect, use UV.z as alpha
        fragColor = vec4(texture(tex, pixUV.xy).rgb * isNight, pixUV.z);
    }
`,

  flowerVSH: `#version 300 es
    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertUV;
    in float vertGoo;
    
    out vec4 pixUV;
    out float pixFog;
    out float goo;
    
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    void main(){
        // Declare viewPos correctly
        vec4 viewPos = viewMatrix * vec4(vertPos, 1.0);
        
        // Use projMatrix to set gl_Position
        gl_Position = projMatrix * viewPos;
        
        pixUV = vertUV;
        goo = vertGoo;
        
        pixFog = smoothstep(20.0, 120.0, viewPos.z) * 0.7;
    }
`,

  flowerFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec4 pixUV;
    in float pixFog;
    in float goo;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    // 3. Global constants
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        // Sample texture and mix with green base color
        vec3 c = mix(vec3(0.0, 0.6, 0.0), texture(tex, pixUV.xy).rgb * min(pixUV.w, 1.0), pixUV.z);
        
        // Darken color if green channel is too low
        c = c.g <= 0.1 ? vec3(0.0, 0.35, 0.0) : c;
        
        // Apply goo effect (cyan for negative, magenta for positive) and fog gradient
        fragColor = vec4(
            mix(
                goo < 0.0 ? mix(c, vec3(0.1, 1.0, 0.5), -goo) : mix(c, vec3(1.0, 0.2, 1.0), goo),
                vec3(1.0, 1.0, 0.7),
                pixFog
            ) * isNight,
            1.0
        );
    }
`,

  beeVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec4 vertUV;
    in vec4 instance_pos;
    in vec4 instance_rotation;
    in vec3 instance_uv;
    
    // 2. Outputs to the fragment shader
    out vec3 pixUV;
    out float pixFog;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    // Helper function to compute quaternion-rotated position
    vec4 computePos(){
        // Scale vertex position by instance scale
        vec3 vp = vertPos * instance_pos.w;
        
        // Extract direction from quaternion and compute Euler angles
        vec3 del = normalize(instance_rotation.xyz);
        float pitch = asin(-del.y) * 0.5;
        float yaw = atan(del.x, del.z) * 0.5;
        float roll = instance_rotation.w * 0.5;
        
        // Pre-calculate sin and cos for each axis
        vec3 s = vec3(sin(pitch), sin(yaw), sin(roll));
        vec3 c = vec3(cos(pitch), cos(yaw), cos(roll));
        
        // Build quaternion from Euler angles
        vec4 quaternion = vec4(s.x * c.y, c.x * s.y, -s.x * s.y, c.x * c.y);
        
        // Apply roll rotation to quaternion
        quaternion = vec4(
            quaternion.x * c.z + quaternion.y * s.z,
            quaternion.y * c.z - quaternion.x * s.z,
            quaternion.z * c.z + quaternion.w * s.z,
            (quaternion.w * c.z - quaternion.z * s.z) * 2.0
        );
        
        // Apply quaternion rotation (first cross product)
        vec3 u = vec3(
            quaternion.y * vp.z - quaternion.z * vp.y,
            quaternion.z * vp.x - quaternion.x * vp.z,
            quaternion.x * vp.y - quaternion.y * vp.x
        );
        
        // Apply quaternion rotation (second cross product)
        vec3 uu = vec3(
            quaternion.y * u.z - quaternion.z * u.y,
            quaternion.z * u.x - quaternion.x * u.z,
            quaternion.x * u.y - quaternion.y * u.x
        );
        
        // Transform to view space and apply instance position offset
        vec4 viewPos = viewMatrix * vec4(vp + u * quaternion.w + uu * 2.0 + instance_pos.xyz, 1.0);
        
        // Calculate fog gradient based on depth
        pixFog = smoothstep(20.0, 120.0, viewPos.z) * 0.7;
        
        return projMatrix * viewPos;
    }
    
    void main(){
        // Apply instance UV offset
        pixUV = vertUV.xyz + vec3(instance_uv.xy, 0.0);
        
        // Cull vertex if UV layer doesn't match
        gl_Position = instance_uv.z != vertUV.w && vertUV.w != 0.0 ? vec4(9999999.0, 9999999.0, 9999999.0, 1.0) : computePos();
    }
`,

  beeFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec3 pixUV;
    in float pixFog;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    // 3. Global constants
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        // Branch based on UV.z to determine render mode
        if (pixUV.z > 0.1) {
            // Textured mode: sample texture, apply fog, and apply night effect
            fragColor = vec4(
                mix(texture(tex, pixUV.xy).rgb * pixUV.z, vec3(1.0, 1.0, 0.7), pixFog) * isNight,
                1.0
            );
        } else {
            // Solid color mode: blue tinted with fog and reduced alpha
            fragColor = vec4(
                mix(vec3(0.1, 0.4, 1.0), vec3(1.0, 1.0, 0.7), pixFog) * isNight,
                0.4
            );
        }
    }
`,

  particleRendererVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec4 vertColor;
    in float vertSize;
    in float vertRot;
    
    // 2. Outputs to the fragment shader
    out float particleSize;
    out vec2 particlePos;
    out vec4 pixColor;
    out vec2 particleRot;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    void main(){
        // Transform vertex position to view space
        vec4 viewPos = viewMatrix * vec4(vertPos, 1.0);
        
        // Pass color to fragment shader
        pixColor = vertColor;
        
        // Compute normalized screen position
        particlePos = viewPos.xy / viewPos.w;
        
        gl_Position = projMatrix * viewPos;
        
        // Calculate projected particle size based on depth
        // ✅ Fixed: Wrapped macro in float() constructor to satisfy the compiler operand type check
        float projSize = (vertSize / viewPos.z) * float(SCREEN_CHANGE);
        gl_PointSize = projSize;
        particleSize = projSize * 0.5;
        
        // Pre-calculate sin and cos of particle rotation
        particleRot = vec2(sin(vertRot), cos(vertRot));
    }
`,

  particleRendererFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in float particleSize;
    in vec2 particlePos;
    in vec4 pixColor;
    in vec2 particleRot;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    void main(){
        // Convert fragment coordinates to screen space normalized coordinates
        vec2 ssPos = (gl_FragCoord.xy - vec2(HALF_WIDTH, HALF_HEIGHT)) * vec2(INV_HALF_WIDTH, INV_HALF_HEIGHT);
        
        // Calculate vector from particle center to fragment
        vec2 del = particlePos - ssPos;
        
        // ✅ Fixed: Explicitly wrap ASPECT in float() to prevent strict type mismatch crashes
        del.x *= float(ASPECT); 
        
        // Apply inverse rotation to fragment position
        del = vec2(
            del.x * particleRot.x - del.y * particleRot.y,
            del.x * particleRot.y + del.y * particleRot.x
        );

        // ✅ Fixed: Separate the macros so the pre-processor replaces them cleanly 
        // without destroying a larger variable identifier name.
        float screenAvg = (float(HALF_WIDTH) + float(HALF_HEIGHT)) * 0.5;
        if (abs(del.x) + abs(del.y) > particleSize * (1.0 / screenAvg))
            discard;

        // Output particle color
        fragColor = pixColor;
    }
`,

  explosionRendererVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec3 instance_pos;
    in vec4 instance_color;
    in vec2 instance_scale;
    
    // 2. Outputs to the fragment shader
    out vec4 pixColor;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    void main(){
        // Pass instance color to fragment shader
        pixColor = instance_color;
        
        // Scale vertex position and apply instance transform
        gl_Position = projMatrix * viewMatrix * vec4(
            vertPos * instance_scale.x * vec3(1.0, instance_scale.y, 1.0) + instance_pos,
            1.0
        );
    }
`,

  explosionRendererFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec4 pixColor;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    void main(){
        // Output vertex color directly
        fragColor = pixColor;
    }
`,

  textRendererVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec2 vertPos;
    in vec2 vertUV;
    in vec3 instance_origin;
    in vec2 instance_offset;
    in vec2 instance_uv;
    in vec3 instance_color;
    in vec3 instance_info;
    
    // 2. Outputs to the fragment shader
    out vec3 pixColor;
    out vec2 pixUV;
    out float fogAmount;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    
    void main(){
        // Apply instance UV offset
        pixUV = vertUV + instance_uv;
        
        // Transform instance origin to view space
        vec4 originPos = projMatrix * viewMatrix * vec4(instance_origin, 1.0);
        
        // Pre-calculate sin and cos of instance rotation
        float s = sin(instance_info.z);
        float c = cos(instance_info.z);
        
        // Scale vertex position by instance scale and apply offset
        vec2 vp = (vertPos + instance_offset) * instance_info.xy;
        
        // Apply rotation and aspect ratio correction
        vp = vec2(
            (vp.x * c - vp.y * s) * INV_ASPECT,
            vp.x * s + vp.y * c
        );
        
        // Combine scaled position with origin position
        vec4 viewPos = originPos + vec4(vp, 0.0, 0.0);
        
        // Clamp w component if in valid view frustum
        gl_Position = viewPos.w < 1.0 && viewPos.w > 0.0 ? vec4(viewPos.xyz, 1.0) : viewPos;
        
        // Pass color to fragment shader
        pixColor = instance_color;
        
        // Calculate fog gradient based on depth
        fogAmount = smoothstep(20.0, 120.0, originPos.z) * 0.7;
    }
`,

  textRendererFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec2 pixUV;
    in vec3 pixColor;
    in float fogAmount;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    // 3. Global constants
    uniform sampler2D tex;
    
    void main(){
        // Sample texture at UV coordinates
        vec4 c = texture(tex, pixUV);
        
        // Apply fog gradient and instance color to texture
        vec3 col = mix(c.xyz, vec3(1.0, 1.0, 0.7), fogAmount) * pixColor;
        
        // Discard fragments with near-zero alpha
        if (c.a < 0.01)
            discard;
        
        // Output final color with texture alpha
        fragColor = vec4(col, c.a);
    }
`,

  mobRendererVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec3 vertColor;
    
    // 2. Outputs to the fragment shader
    out vec4 pixColor;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    uniform vec4 instance_info1;
    uniform vec2 instance_info2;
    uniform float isNight;
    
    void main(){
        // Apply night effect to color and set alpha from instance info
        pixColor = vec4(vertColor * isNight, instance_info2.y);
        
        // Pre-calculate sin and cos of instance rotation
        float s = sin(instance_info1.w);
        float c = cos(instance_info1.w);
        
        // Apply Y-axis rotation, scale, and instance position offset
        gl_Position = projMatrix * viewMatrix * vec4(
            vec3(
                vertPos.x * c - vertPos.z * s,
                vertPos.y,
                vertPos.x * s + vertPos.z * c
            ) * instance_info2.x + instance_info1.xyz,
            1.0
        );
    }
`,

  mobRendererFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec4 pixColor;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    void main(){
        // Output vertex color directly
        fragColor = pixColor;
    }
`,

  trailRendererVSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from buffers
    in vec3 vertPos;
    in vec4 vertCol;
    
    // 2. Outputs to the fragment shader
    out vec4 pixColor;
    
    // 3. Global constants
    uniform mat4 viewMatrix;
    uniform mat4 projMatrix; // Make sure this is declared here!
    uniform float isNight;
    
    void main(){
        // Apply night effect to color and preserve alpha
        pixColor = vec4(vertCol.xyz * isNight, vertCol.w);
        
        // Transform vertex position to view space
        gl_Position = projMatrix * viewMatrix * vec4(vertPos, 1.0);
    }
`,

  trailRendererFSH: `#version 300 es
    precision highp float;
    
    // 1. Inputs from the vertex shader
    in vec4 pixColor;
    
    // 2. Output to the framebuffer
    out vec4 fragColor;
    
    void main(){
        // Output interpolated vertex color directly
        fragColor = pixColor;
    }
`,
};
