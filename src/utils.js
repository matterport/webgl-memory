export function isWebGL2(gl) {
  // a proxy for if this is webgl
  return !!gl.texImage3D;
}

/**
 * Cross-realm safe check for TypedArray (e.g. Uint8Array, Float32Array).
 *
 * Previously: `return v && v.buffer && v.buffer instanceof ArrayBuffer`
 *
 * Fixed for the Showcase SDK Bundle (JSSDK-2977). When Showcase runs inside
 * an iframe and an external SDK component (on the embedding page) creates
 * geometry — e.g. a Uint16Array index buffer — that TypedArray belongs to
 * the embedding page's JavaScript realm. Each realm has its own set of
 * built-in constructors, so the iframe's `ArrayBuffer` is a *different
 * constructor* than the embedding page's `ArrayBuffer`. When webgl-memory
 * (running inside the iframe) checked `v.buffer instanceof ArrayBuffer`, it
 * was comparing against the iframe's ArrayBuffer constructor, which returned
 * false for buffers originating from the parent page. This caused a
 * "unsupported bufferData src type" error when the SDK passed indexed
 * geometry through THREE.js bufferData calls.
 *
 * `ArrayBuffer.isView` is specified to work across realms and avoids this
 * problem entirely.
 */
export function isTypedArray(v) {
  return v != null && ArrayBuffer.isView(v);
}

/**
 * Cross-realm safe check for any BufferSource (TypedArray or ArrayBuffer).
 *
 * Previously: `return isTypedArray(v) || v instanceof ArrayBuffer`
 *
 * Same cross-realm issue as isTypedArray above (JSSDK-2977). The
 * `instanceof ArrayBuffer` fast path still covers same-realm buffers;
 * the `Object.prototype.toString` fallback catches cross-realm
 * ArrayBuffers where `instanceof` returns false.
 */
export function isBufferSource(v) {
  return isTypedArray(v) || (v instanceof ArrayBuffer || Object.prototype.toString.call(v) === '[object ArrayBuffer]');
}

// ---------------------------------
const FLOAT                         = 0x1406;
const INT                           = 0x1404;
const BOOL                          = 0x8B56;
const UNSIGNED_INT                  = 0x1405;

const TEXTURE_BINDING_2D            = 0x8069;
const TEXTURE_BINDING_CUBE_MAP      = 0x8514;
const TEXTURE_BINDING_3D            = 0x806A;
const TEXTURE_BINDING_2D_ARRAY      = 0x8C1D;


const ARRAY_BUFFER                   = 0x8892;
const ELEMENT_ARRAY_BUFFER           = 0x8893;
const ARRAY_BUFFER_BINDING           = 0x8894;
const ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;
const TEXTURE_2D                     = 0x0DE1;
const TEXTURE_3D                     = 0x806F;
const TEXTURE_2D_ARRAY               = 0x8C1A;
const TEXTURE_CUBE_MAP               = 0x8513;
const FRAMEBUFFER                    = 0x8D40;
const RENDERBUFFER                   = 0x8D41;
const FRAMEBUFFER_BINDING            = 0x8CA6;
const RENDERBUFFER_BINDING           = 0x8CA7;
const TRANSFORM_FEEDBACK_BUFFER      = 0x8C8E;
const TRANSFORM_FEEDBACK_BUFFER_BINDING = 0x8C8F;
const DRAW_FRAMEBUFFER               = 0x8CA9;
const READ_FRAMEBUFFER               = 0x8CA8;
const READ_FRAMEBUFFER_BINDING       = 0x8CAA;
const UNIFORM_BUFFER                 = 0x8A11;
const UNIFORM_BUFFER_BINDING         = 0x8A28;
const TRANSFORM_FEEDBACK             = 0x8E22;
const TRANSFORM_FEEDBACK_BINDING     = 0x8E25;

const bindPointMap = new Map([
  [ARRAY_BUFFER, ARRAY_BUFFER_BINDING],
  [ELEMENT_ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER_BINDING],
  [TEXTURE_2D, TEXTURE_BINDING_2D],
  [TEXTURE_CUBE_MAP, TEXTURE_BINDING_CUBE_MAP],
  [TEXTURE_3D, TEXTURE_BINDING_3D],
  [TEXTURE_2D_ARRAY, TEXTURE_BINDING_2D_ARRAY],
  [RENDERBUFFER, RENDERBUFFER_BINDING],
  [FRAMEBUFFER, FRAMEBUFFER_BINDING],
  [DRAW_FRAMEBUFFER, FRAMEBUFFER_BINDING],
  [READ_FRAMEBUFFER, READ_FRAMEBUFFER_BINDING],
  [UNIFORM_BUFFER, UNIFORM_BUFFER_BINDING],
  [TRANSFORM_FEEDBACK_BUFFER, TRANSFORM_FEEDBACK_BUFFER_BINDING],
  [TRANSFORM_FEEDBACK, TRANSFORM_FEEDBACK_BINDING],
]);

export function getBindingQueryEnumForBindPoint(bindPoint) {
  return bindPointMap.get(bindPoint);
}

const BYTE                         = 0x1400;
const SHORT                        = 0x1402;
const UNSIGNED_BYTE                = 0x1401;
const UNSIGNED_SHORT               = 0x1403;

const glTypeToSizeMap = new Map([
  [BOOL           , 1],
  [BYTE           , 1],
  [UNSIGNED_BYTE  , 1],
  [SHORT          , 2],
  [UNSIGNED_SHORT , 2],
  [INT            , 4],
  [UNSIGNED_INT   , 4],
  [FLOAT          , 4],
]);

export function getBytesPerValueForGLType(type) {
  return glTypeToSizeMap.get(type) || 0;
}

const glTypeToTypedArrayMap = new Map([
  [UNSIGNED_BYTE,  Uint8Array],
  [UNSIGNED_SHORT, Uint16Array],
  [UNSIGNED_INT,   Uint32Array],
]);

export function glTypeToTypedArray(type) {
  return glTypeToTypedArrayMap.get(type);
}

export function getDrawingbufferInfo(gl) {
  return {
    samples: gl.getParameter(gl.SAMPLES) || 1,
    depthBits: gl.getParameter(gl.DEPTH_BITS),
    stencilBits: gl.getParameter(gl.STENCIL_BITS),
    contextAttributes: gl.getContextAttributes(),
  };
}

function computeDepthStencilSize(drawingBufferInfo) {
  const {depthBits, stencilBits} = drawingBufferInfo;
  const depthSize = (depthBits + stencilBits + 7) / 8 | 0;
  return depthSize === 3 ? 4 : depthSize;
}

export function computeDrawingbufferSize(gl, drawingBufferInfo) {
  if (gl.isContextLost()) {
    return 0;
  }
  const {samples} = drawingBufferInfo;
  // this will need to change for hi-color support
  const colorSize = 4;
  const size = gl.drawingBufferWidth * gl.drawingBufferHeight;
  const depthStencilSize = computeDepthStencilSize(drawingBufferInfo);
  return size * colorSize + size * samples * colorSize + size * depthStencilSize;
}

// I know this is not a full check
export function isNumber(v) {
  return typeof v === 'number';
}

export function collectObjects(state, type) {
  const list = [...state.webglObjectToMemory.keys()]
    .filter(obj => obj instanceof type)
    .map((obj) => state.webglObjectToMemory.get(obj));

  return list;
}

export function getStackTrace() {
  const stack = (new Error()).stack;
  const lines = stack.split('\n');
  // Remove the first two entries, the error message and this function itself, or the webgl-memory itself.
  const userLines = lines.slice(2).filter((l) => !l.includes('webgl-memory.js'));
  return userLines.join('\n');
}
