// engine/shaders.js
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
    
    void main(){
        vec4 pos = viewMatrix * vec4(vertPos, 1.0);
        
        // Passing data through to the fragment shader
        pixColor = vertColor;
        pixUV = vertUV;
        pixFog = pos.z;
        
        gl_Position = pos;
    }
  `,

  staticFSH: `
    precision mediump float;
    // ...
  `,
};
