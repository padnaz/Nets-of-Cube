// Script written by Cael Coonai

const numLettRot_lookup = {
  0 : 'A',  1 : 'B',  2 : 'C',
  3 : 'D',  4 : 'E',  5 : 'F',
  6 : 'G',  7 : 'H',  8 : 'I',
  9 : 'J', 10 : 'K', 11 : 'L',
 12 : 'M', 13 : 'N', 14 : 'O'
};

const colourid_lookup = {
  'red'     : 'R',  'R' : 'red',
  'blue'    : 'B',  'B' : 'blue',
  'yellow'  : 'Y',  'Y' : 'yellow',
  'green'   : 'G',  'G' : 'green',
  'purple'  : 'P',  'P' : 'purple',
  'grey'    : 'X',  'X' : 'grey',
  'none'    :  0 ,   0  : 'none',
  'blank'   : 'blank'
};

const colourHex_lookup = {
  'R' : [143/255,78/255,78/255],
  'B' : [81/255,83/255,146/255],
  'Y' : [143/255,115/255,78/255],
  'G' : [88/255,143/255,78/255],
  'P' : [128/255,86/255,130/255],
  'X' : [136/255,136/255,136/255]
};

const net_lookup = [
  'AXXBXBXXCDXD','AXABXXXXCDXD','AXABXBXXXDXD','AXABXBXXCDXX','AXXBXBCXCXXD',
  'XXXBXBCXCDXD','XXABXBCXXDDX','AAXXXXCXCDXD','AAXBXXXXCXDD','AXABXXXXCXDD',
  'XAXBXXDXEX',  'XXABXBCXXDXD','AXAXXBCXXDXD','AXABXBCXXXXD','XXABXBCXCDXX',
  'AXXBXBXXCXDD','XAAXXXCXCDXD','XAAXXBCXXDDX','AXAXXBCXXDDX','AXBXXXXDXE',
  'XAAAXXXXCCXC','AXAAXXXXCCXC','AAXAXXXXCCXC','AAAXXXXXCCXC','XAAAXXXXCCCX',
  'XAAAXXXXXCCC','AAXXXXXBXCCC','XXAABXXXCXCC','XXAABXXBCCXX','AXAAXXXBCCXX',
  'AAXXXXXXBB',  'AAXAXXXXXCCC','AAXAXXXXCXCC','AAXAXXXXCCCX','AAAXXXXXXCCC',
  'XAAAXXXBCCXX','AXAABXXXXXCC','AAXXBXXBXXCC','AAXXXXXBCXCC','XXXAABBXXX',
  'AXABXXCXCXXD','AXAXXXCXCDXD','XXABXXCXCDXD','AXABXBCXCXXX','XAAXXBCXCDXX',
  'AXABXBXXXXDD','AAXBXXXXCDXD','AXAXXBCXCDXX','AXXXXBCXCDXD','AAXBXXCXCXXD',
  'AXABXBXXXDDX','XAAXXBCXXDXD','AXAAXXXXCCCX','AXAAXXXXCXCC','AXAAXXXXXCCC',
  'AAAXXXXXCCCX','AAAXBXXXXXCC','AAXAXXXBCCXX','XXAABXXXCCXC','AAAXXXXXCXCC',
  'XAAAXXXXCXCC','XXAABXXXCCCX','AAXXXXXBCCXC','AAXABXXXXXCC'
];

const pallette_array_init = ['R','G','B','P','Y'];
const blank_array = [               //The convention for storing colours in the
  [0,0,0,0,0,0,0,0,0,0,0,0,0],      //net_view_array and pallette is as follows:
  [0,0,0,0,0,0,0,0,0,0,0,0,0],      // Grey  : 'X', Red   : 'R', Blue   : 'B'
  [0,0,0,0,0,0,0,0,0,0,0,0,0],      // Yellow: 'Y', Green : 'G', Purple : 'P'
  [0,0,0,0,0,0,0,0,0,0,0,0,0],      // None : 0
  [0,0,0,0,0,0,0,0,0,0,0,0,0],      //For selectable and selected, the letter
  [0,0,0,0,0,0,0,0,0,0,0,0,0],      //is prefixed with SA and SD.
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const offset = [0,0,0.5];
const depth_map_vacancy = -1; //Must not be a numeber ≥ 0.
var depth_max = 0;
var pallette_array = [];
var net_view_array = [];
var depth_map_array = [];
var cube_view_array = [];
var fold_mapping = [];
var foldingFace_list = [];
var facade_active = false;
var folded = false;
var fold_slider = document.getElementById('fold-slider');
var fold_message_shown = false;
var ggb_applet_loaded = false;

class FoldingFace{
  colour = '';
  face = '';
  hPos = 0;
  vPos = 0;
  parent = null;
  children = [];
  depth = 0;
  vertices = [];
  constructor(colour, face, hPos, vPos, parent = null){
    this.colour = colour;
    this.face = face;
    this.hPos = hPos;
    this.vPos = vPos;
    for(let i = 0; i < 4; i++){
      this.vertices.push([
        colour+'_'+numLettRot_lookup[i],
        [
          ggbApplet.getXcoord(colour+'_'+numLettRot_lookup[i]), //Current
          ggbApplet.getYcoord(colour+'_'+numLettRot_lookup[i]), //coordinates
          ggbApplet.getZcoord(colour+'_'+numLettRot_lookup[i])
        ],[
          ggbApplet.getXcoord(colour+'_'+numLettRot_lookup[i]), //Default
          ggbApplet.getYcoord(colour+'_'+numLettRot_lookup[i]), //coordinates
          ggbApplet.getZcoord(colour+'_'+numLettRot_lookup[i])
        ]
      ]);
    }
    if(parent != null){
      this.parent = parent;
      this.depth = this.parent.depth + 1;
      this.parent.children.push(this);
    }
    foldingFace_list.push(this);
  }
  getDescendants(return_root = true){
    var out = [];
    if(return_root == true) out.push(this);
    for(let i = 0; i < this.children.length; i++){
      out.push(this.children[i].getDescendants());
    }
    return out.flat()
  }
};

function resetFoldingFacePos(){
  for(let i = 0; i < foldingFace_list.length; i++){
    for(let j = 0; j < foldingFace_list[i].vertices.length; j++){
      foldingFace_list[i].vertices[j][1] =
        copyOf(foldingFace_list[i].vertices[j][2]);
    }
  }
}

function foldCube(){
  var tree_nav = [];
  for(let i = 1; i <= depth_max; i++){
    tree_nav.push([]);
    for(let j = 0; j < foldingFace_list.length; j++){
      if(foldingFace_list[j].depth == i){
        tree_nav[i-1].push(foldingFace_list[j]);
      }
    }
  }
  resetFoldingFacePos();
  const fold_inc = 6E6 / depth_max;
  var fold = fold_slider.value;
  var depth = 1;
  while(fold > 0){
    for(let i = 0; i < tree_nav[depth-1].length; i++){
      if(fold > fold_inc){
        rotatePoints(tree_nav[depth-1][i],math.pi/2);
      }
      else{
        rotatePoints(tree_nav[depth-1][i],fold/fold_inc * math.pi/2);
      }
    }
    fold -= fold_inc;
    depth++;
  }
}

function rotatePoints(main_face,angle){
  const foldSeq_lookup = {
    'XF' : [[ 0-offset[0], 1-offset[1], 0-offset[2]],[-1, 0, 0]],
    'XR' : [[-1-offset[0], 0-offset[1], 0-offset[2]],[ 0,-1, 0]],
    'XB' : [[ 0-offset[0],-1-offset[1], 0-offset[2]],[ 1, 0, 0]],
    'XL' : [[ 1-offset[0], 0-offset[1], 0-offset[2]],[ 0, 1, 0]],
    'TF' : [[ 0-offset[0], 1-offset[1],-2-offset[2]],[ 1, 0, 0]],
    'TR' : [[-1-offset[0], 0-offset[1],-2-offset[2]],[ 0, 1, 0]],
    'TB' : [[ 0-offset[0],-1-offset[1],-2-offset[2]],[-1, 0, 0]],
    'TL' : [[ 1-offset[0], 0-offset[1],-2-offset[2]],[ 0,-1, 0]],
    'FT' : [[ 0-offset[0], 1-offset[1],-2-offset[2]],[-1, 0, 0]],
    'FR' : [[-1-offset[0], 1-offset[1], 0-offset[2]],[ 0, 0, 1]],
    'FL' : [[ 1-offset[0], 1-offset[1], 0-offset[2]],[ 0, 0,-1]],
    'RT' : [[-1-offset[0], 0-offset[1],-2-offset[2]],[ 0,-1, 0]],
    'RF' : [[-1-offset[0], 1-offset[1], 0-offset[2]],[ 0, 0,-1]],
    'RB' : [[-1-offset[0],-1-offset[1], 0-offset[2]],[ 0, 0, 1]],
    'BT' : [[ 0-offset[0],-1-offset[1],-2-offset[2]],[ 1, 0, 0]],
    'BR' : [[-1-offset[0],-1-offset[1], 0-offset[2]],[ 0, 0,-1]],
    'BL' : [[ 1-offset[0],-1-offset[1], 0-offset[2]],[ 0, 0, 1]],
    'LT' : [[ 1-offset[0], 0-offset[1],-2-offset[2]],[ 0, 1, 0]],
    'LF' : [[ 1-offset[0], 1-offset[1], 0-offset[2]],[ 0, 0, 1]],
    'LB' : [[ 1-offset[0],-1-offset[1], 0-offset[2]],[ 0, 0,-1]]
  };
  const transformation = main_face.parent.face + main_face.face;
  const faces = main_face.getDescendants();
  for(let i = 0; i < faces.length; i++){
    for(let j = 0; j < faces[i].vertices.length; j++){
      faces[i].vertices[j][1] = math.add(
        faces[i].vertices[j][1],
        foldSeq_lookup[transformation][0]
      );
      faces[i].vertices[j][1] = math.rotate(
        faces[i].vertices[j][1],
        angle,
        foldSeq_lookup[transformation][1]
      );
      faces[i].vertices[j][1] = math.subtract(
        faces[i].vertices[j][1],
        foldSeq_lookup[transformation][0]
      );
    }
  }
}

function netToTree(){
  for(let i = foldingFace_list.length-1; i > 0; i--){
    foldingFace_list.pop();
  }
  foldingFace_list[0].children = [];
  function addToTree(parent_hPos,parent_vPos,child_hPos,child_vPos){
    for(let i = 0; i < foldingFace_list.length; i++){
      if(foldingFace_list[i].hPos == parent_hPos &&
         foldingFace_list[i].vPos == parent_vPos){
        new FoldingFace(
          net_view_array[child_vPos][child_hPos],
          fold_mapping[child_vPos][child_hPos],
          child_hPos,child_vPos,foldingFace_list[i]
        );
      }
    }
  }
  for(let depth = 0; depth < depth_max; depth++){
    for(let i = 0; i < depth_map_array.length; i++){
      for(let j = 0; j < depth_map_array[i].length; j++){
        if(depth_map_array[i][j] == depth){
          if(depth_map_array[i+1][j] == depth+1){
            addToTree(j,i,j,i+1);
          }
          if(depth_map_array[i][j+1] == depth+1){
            addToTree(j,i,j+1,i);
          }
          if(depth_map_array[i-1][j] == depth+1){
            addToTree(j,i,j,i-1);
          }
          if(depth_map_array[i][j-1] == depth+1){
            addToTree(j,i,j-1,i);
          }
        }
      }
    }
  }
}

function traceNet(){
  const face_lookup = {
    "true,1,2"  : 'F',  "true,2,1"  : 'F',
    "false,1,2" : 'B',  "false,2,1" : 'B',
    "true,1,4"  : 'R',  "true,4,1"  : 'R',
    "false,1,4" : 'L',  "false,4,1" : 'L',
    "true,2,4"  : 'T',  "true,4,2"  : 'T',
    "false,2,4" : 'X',  "false,4,2" : 'X'
  }
  function xnor(argument_1,argument_2){
    var a = argument_1.toString(2).split('').reverse();
    var b = argument_2.toString(2).split('').reverse();
    while(a.length < 3) a.push(0);
    while(b.length < 3) b.push(0);
    a.reverse();
    b.reverse();
    var c = '';
    for(let i = 0; i < 3; i++){
      if(a[i] == b[i]) c += '1';
      else c += '0';
    }
    return parseInt(c,2);
  }
  Array.prototype.includes = function(array){
    for(let i = 0; i < this.length; i++){
      if(this[i].toString() == array.toString()) return true;
    }
    return false;
  }
  var used_colours = [[false,[2,4]]];
  depth_max = 0;
  fold_mapping = copyOf(blank_array)
  depth_map_array = copyOf(blank_array);
  fold_mapping[6][6] = [false,[2,4]];
  for(let i = 0; i < depth_map_array.length;i++){
    for(let j = 0; j < depth_map_array[i].length; j++){
      if(net_view_array[i][j] == 'X') continue;
      depth_map_array[i][j] = depth_map_vacancy;
    }
  }   // This is the implementation of the two rules.
  for(let depth = 0; depth < 6; depth++){
    for(let i = 0; i < depth_map_array.length; i++){
      for(let j = 0; j < depth_map_array[i].length; j++){
        if(depth_map_array[i][j] == depth){
          let horizontal = fold_mapping[i][j][1][0];
          let vertical = fold_mapping[i][j][1][1];
          if(net_view_array[i+1][j] != 0 &&
             depth_map_array[i+1][j] == depth_map_vacancy){
            let new_vertical = xnor(horizontal,vertical);
            if(used_colours.includes([true,[horizontal,new_vertical]]) ||
               used_colours.includes([true,[new_vertical,horizontal]])){
              used_colours.push([false,[horizontal,new_vertical]]);
              fold_mapping[i+1][j] = [false,[horizontal,new_vertical]];
            }
            else if(used_colours.includes([false,[horizontal,new_vertical]]) ||
                    used_colours.includes([false,[new_vertical,horizontal]])){
              used_colours.push([true,[horizontal,new_vertical]]);
              fold_mapping[i+1][j] = [true,[horizontal,new_vertical]];
            }
            else{
              if( i+1 > 6 ){
                used_colours.push([true,[horizontal,new_vertical]]);
                fold_mapping[i+1][j] = [true,[horizontal,new_vertical]];
              }
              else{
                used_colours.push([false,[horizontal,new_vertical]]);
                fold_mapping[i+1][j] = [false,[horizontal,new_vertical]];
              }
            }
            depth_map_array[i+1][j] = depth + 1;
          }
          if(net_view_array[i][j+1] != 0 &&
             depth_map_array[i][j+1] == depth_map_vacancy){
            let new_horizontal = xnor(horizontal,vertical);
            if(used_colours.includes([true,[new_horizontal,vertical]]) ||
               used_colours.includes([true,[vertical,new_horizontal]])){
              used_colours.push([false,[new_horizontal,vertical]]);
              fold_mapping[i][j+1] = [false,[new_horizontal,vertical]];
            }
            else if(used_colours.includes([false,[new_horizontal,vertical]]) ||
                    used_colours.includes([false,[vertical,new_horizontal]])){
              used_colours.push([true,[new_horizontal,vertical]]);
              fold_mapping[i][j+1] = [true,[new_horizontal,vertical]];
            }
            else{
              if( j+1 > 6 ){
                used_colours.push([true,[new_horizontal,vertical]]);
                fold_mapping[i][j+1] = [true,[new_horizontal,vertical]];
              }
              else{
                used_colours.push([false,[new_horizontal,vertical]]);
                fold_mapping[i][j+1] = [false,[new_horizontal,vertical]];
              }
            }
            depth_map_array[i][j+1] = depth + 1;
          }
          if(net_view_array[i-1][j] != 0 &&
             depth_map_array[i-1][j] == depth_map_vacancy){
            let new_vertical = xnor(horizontal,vertical);
            if(used_colours.includes([true,[horizontal,new_vertical]]) ||
               used_colours.includes([true,[new_vertical,horizontal]])){
              used_colours.push([false,[horizontal,new_vertical]]);
              fold_mapping[i-1][j] = [false,[horizontal,new_vertical]];
            }
            else if(used_colours.includes([false,[horizontal,new_vertical]]) ||
                    used_colours.includes([false,[new_vertical,horizontal]])){
              used_colours.push([true,[horizontal,new_vertical]]);
              fold_mapping[i-1][j] = [true,[horizontal,new_vertical]];
            }
            else{
              if( i-1 > 6 ){
                used_colours.push([true,[horizontal,new_vertical]]);
                fold_mapping[i-1][j] = [true,[horizontal,new_vertical]];
              }
              else{
                used_colours.push([false,[horizontal,new_vertical]]);
                fold_mapping[i-1][j] = [false,[horizontal,new_vertical]];
              }
            }
            depth_map_array[i-1][j] = depth + 1;
          }
          if(net_view_array[i][j-1] != 0 &&
             depth_map_array[i][j-1] == depth_map_vacancy){
            let new_horizontal = xnor(horizontal,vertical);
            if(used_colours.includes([true,[new_horizontal,vertical]]) ||
               used_colours.includes([true,[vertical,new_horizontal]])){
              used_colours.push([false,[new_horizontal,vertical]]);
              fold_mapping[i][j-1] = [false,[new_horizontal,vertical]];
            }
            else if(used_colours.includes([false,[new_horizontal,vertical]]) ||
                    used_colours.includes([false,[vertical,new_horizontal]])){
              used_colours.push([true,[new_horizontal,vertical]]);
              fold_mapping[i][j-1] = [true,[new_horizontal,vertical]];
            }
            else{
              if( j-1 > 6 ){
                used_colours.push([true,[new_horizontal,vertical]]);
                fold_mapping[i][j-1] = [true,[new_horizontal,vertical]];
              }
              else{
                used_colours.push([false,[new_horizontal,vertical]]);
                fold_mapping[i][j-1] = [false,[new_horizontal,vertical]];
              }
            }
            depth_map_array[i][j-1] = depth + 1;
          }
          depth_max = depth;
        }
      }
    }
  }
  for(let i = 0; i < fold_mapping.length; i++){
    for(let j = 0; j < fold_mapping[i].length; j++){
      if(fold_mapping[i][j] != 0)
        fold_mapping[i][j] = face_lookup[fold_mapping[i][j].toString()];
    }
  }
}

function fillImageStage(){
  const list = {
    0: 'blank',   1:    0,      2:   'R',     3:   'B',
    4:   'G',     5:   'P',     6:   'Y',     7:   'X',
    8:  'SAR',    9:  'SAB',   10:  'SAG',   11:  'SAP',
   12:  'SAY',   13:  'SDR',   14:  'SDB',   15:  'SDG',
   16:  'SDP',   17:  'SDY'
  }
  var stage = document.getElementById("image-stage");
  var image = [];
  for(let i = 0; i < 18; i++){
    image.push(document.createElement("img"));
    image[i].setAttribute("src",getFaceURL(list[i]));
    stage.appendChild(image[i]);
  }       // This function forces the browser to cache all image files on page
}         // load, preventing slow downs due to downloading images on usage.

function deleteCubeSquare(colour){
  for(let i = 0; i < 4; i++){
    ggbApplet.deleteObject(colour + "_" + numLettRot_lookup[i]);
  }
}

function createCubeSquare(arrX, arrY, colour){
  var center = [(arrY-6)*2,(arrX-6)*-2];
  var vertex_coords = [
    [center[0]+1 + offset[0], center[1]+1 + offset[1]],
    [center[0]+1 + offset[0], center[1]-1 + offset[1]],
    [center[0]-1 + offset[0], center[1]-1 + offset[1]],
    [center[0]-1 + offset[0], center[1]+1 + offset[1]]
  ];
  var vertices = [];
  for(let i = 0; i < 4; i++){
    vertices.push(colour + '_' + numLettRot_lookup[i]);
    ggbApplet.evalCommand(
      vertices[i] + ' = (' + vertex_coords[i][0].toString() + ',' +
      vertex_coords[i][1].toString() + ',' + offset[2].toString() + ')'
    );
  }
  ggbApplet.evalCommand("Polygon(" + vertices.toString() + ")");
  ggbApplet.renameObject("q1",colour);
  for(let i = 0; i < ggbApplet.getObjectNumber(); i++){
    ggbApplet.setFixed(ggbApplet.getObjectName(i),true);
    if(ggbApplet.getObjectName(i).length == 1) continue;
    ggbApplet.setVisible(ggbApplet.getObjectName(i),false);
  }
  ggbApplet.evalCommand("SetDynamicColor(" + colour + "," +
    colourHex_lookup[colour].toString() + ",0.95)");
}

function updateCubeView(){
  for(let i = 1; i < 12; i++){
    for(let j = 1; j < 12; j++){
      if(net_view_array[i][j] != cube_view_array[i][j] &&
          net_view_array[i][j].toString().charAt(0) != 'S'){
        if(net_view_array[i][j] != 0){
          createCubeSquare(i,j,net_view_array[i][j]);
          cube_view_array[i][j] = net_view_array[i][j];
        }
        else{
          deleteCubeSquare(cube_view_array[i][j]);
          cube_view_array[i][j] = 0;
        }
      }
    }
  }
  if(folded){
    for(let i = 0; i < ggbApplet.getObjectNumber(); i++){
      ggbApplet.setFixed(ggbApplet.getObjectName(i),false);
    }
    for(let i = 0; i < foldingFace_list.length; i++){
      for(let j = 0; j < foldingFace_list[i].vertices.length; j++){
        ggbApplet.setCoords(
          foldingFace_list[i].vertices[j][0],
          foldingFace_list[i].vertices[j][1][0],
          foldingFace_list[i].vertices[j][1][1],
          foldingFace_list[i].vertices[j][1][2]
        );
      }
    }
    for(let i = 0; i < ggbApplet.getObjectNumber(); i++){
      ggbApplet.setFixed(ggbApplet.getObjectName(i),true);
    }
  }
}

function errorMessageToggle(toggleOn){
  if(toggleOn){
    var heading = document.createElement("th");
    var body = document.createElement("tbody");
    var message = document.createElement("td");
    var table_row = document.createElement("tr")
    var table = document.createElement("table");
    heading.setAttribute("scope","row");
    heading.innerText = "Error :";
    message.innerText = "This net does not fold into a cube.";
    table_row.setAttribute("class","table-danger");
    table.setAttribute("class","table");
    table.setAttribute("id","fold-err-table");
    table_row.appendChild(heading);
    table_row.appendChild(message);
    body.appendChild(table_row);
    table.appendChild(body);
    document.getElementById("fold-err").appendChild(table);
    fold_message_shown = true;
  }
  else{
    document.getElementById("fold-err-table").remove();
    fold_message_shown = false;
  }
}

function lookForNeighbours(start){
  var neighbours = [];
  let x = 0;
  let y = 0;
  for(x = 1; x < 12; x++){
    for(y = 1; y < 12; y++){
      if(net_view_array[x][y] == start) break;
    }
    if(y < 12) break;
  }
  if(net_view_array[x+1][y] != 0) neighbours.push(net_view_array[x+1][y]);
  if(net_view_array[x-1][y] != 0) neighbours.push(net_view_array[x-1][y]);
  if(net_view_array[x][y+1] != 0) neighbours.push(net_view_array[x][y+1]);
  if(net_view_array[x][y-1] != 0) neighbours.push(net_view_array[x][y-1]);
  return neighbours;
}

function toggleSlider(toggleOn){
  if(toggleOn){
    fold_slider.removeAttribute("disabled");
  }
  else{
    fold_slider.setAttribute("disabled","");
    fold_slider.value = 0;
  }
}

function removeNetFace(key){
  function arrayDifference(a,b){
    spread = [...a, ...b];
    return spread.filter(el => {
       return !(a.includes(el) && b.includes(el));
    })
  }
  if(key[3] == 'grey'){
    pallette_array = copyOf(pallette_array_init);
    net_view_array = copyOf(blank_array);
    net_view_array[6][6] = 'X';
  }
  else{
    net_view_array[parseInt(key[1])][parseInt(key[2])] = 0;
    var connectedList = ['X'];
    for(let i = 0; i < connectedList.length; i++){
      connectedList.push(lookForNeighbours(connectedList[i]));
      connectedList = [...new Set(connectedList.flat())];
    }
    var disconnectedList = arrayDifference(connectedList,
      arrayDifference(pallette_array,pallette_array_init));
    disconnectedList.splice(disconnectedList.indexOf('X'),1);
    for(let i = 1; i < 12; i++){
      for(let j = 1; j < 12; j++){
        if(disconnectedList.includes(net_view_array[i][j])){
          net_view_array[i][j] = 0;
        }
      }
    }
    for(let i = 0; i < disconnectedList.length; i++){
      pallette_array.push(disconnectedList[i]);
    }
  }
}

function confirmSelection(key){
  pallette_array.splice(
    pallette_array.indexOf("SD" + colourid_lookup[key[4]]),1);
  net_view_array[key[1]][key[2]] = colourid_lookup[key[4]];
  removeFaceFacade();
}

function removeFaceFacade(){
  for(let i = 0; i < pallette_array.length; i++){
    if(pallette_array[i].charAt(0) == 'S'){
      pallette_array[i] = pallette_array[i].charAt(2);
    }
  }
  for(let i = 1; i < 12; i++){
    for(let j = 1; j < 12; j++){
      if(net_view_array[i][j].toString().charAt(0) == 'S'){
        net_view_array[i][j] = 0;
      }
    }
  }
  facade_active = false;
}

function addFaceFacade(colour){
  pallette_array[pallette_array.indexOf(colourid_lookup[colour])] =
    'SD' + colourid_lookup[colour];
  for(let i = 1; i < 12; i++){
    for(let j = 1; j < 12; j++){
      if(net_view_array[i][j].toString() == '0' && (
        (net_view_array[i-1][j].toString() != '0' &&
          net_view_array[i-1][j].toString().charAt(0) != 'S') ||
        (net_view_array[i+1][j].toString() != '0' &&
          net_view_array[i+1][j].toString().charAt(0) != 'S') ||
        (net_view_array[i][j-1].toString() != '0' &&
          net_view_array[i][j-1].toString().charAt(0) != 'S') ||
        (net_view_array[i][j+1].toString() != '0' &&
          net_view_array[i][j+1].toString().charAt(0) != 'S')
      )){
        net_view_array[i][j] = 'SA' + colourid_lookup[colour];
      }
    }
  }
  facade_active = true;
}

function clickListen(id){   // All user inputs use this function.
  console.log(id);
  if(id == "fold-button"){
    if(!folded){
      if(isNet(net_view_array)){
        traceNet();
        netToTree();
        toggleSlider(true);
        folded = true;
      }
      else{
        if(!fold_message_shown)
        errorMessageToggle(true);
      }
    }
    return;
  }
  if(id == "fold-slider"){
    if(folded){
      foldCube();
      updateCubeView();
    }
    return;
  }
  let key = id.split("_");
  if(key[0] == "pallette"){
    if(key[1] != "selected"){
      if(facade_active) removeFaceFacade();
      addFaceFacade(key[1]);
    }
    else{
      removeFaceFacade();
    }
  }
  if(key[0] == "net"){
    if(key[3] == "selectable"){
      confirmSelection(key);
    }
    else{
      if(!facade_active && key[3] != 'none')
        removeNetFace(key);
    }
  }
  if(fold_message_shown){
    errorMessageToggle(false);
  }
  if(ggb_applet_loaded && !folded) updateCubeView();
  if(ggb_applet_loaded &&  folded){
    resetFoldingFacePos();
    updateCubeView();
    toggleSlider(false);
    folded = false;
  }
  updateNetView();
}

function getFaceURL(face_id, return_colour = false){
  var result = "";
  if(!return_colour) result = "assets/images/faces/";
  var lookup = face_id;
  if(face_id.toString().charAt(0) == 'S'){
    if(face_id.charAt(1) == 'A') result += "selectable_";
    else result += "selected_";
    lookup = face_id.charAt(2);
  }
  result += colourid_lookup[lookup];
  if(!return_colour) result += ".png";
  return result;
}

function repopulateNetView(pop_pallette = false, pop_net = false){
  if(pop_pallette){
    var pallette = document.getElementById("pallette");
    var pallette_count = pallette.childElementCount;
    for(let i = 0; i < pallette_count; i++){
      pallette.getElementsByClassName("pallette-item").item(0).remove();
    }
    for(let i = 0; i < pallette_array.length; i++){
      var face = document.createElement("img");
      var url = getFaceURL(pallette_array[i]);
      var id = "pallette_" + getFaceURL(pallette_array[i],true);
      face.setAttribute("id",id);
      face.setAttribute("class","pallette-item");
      face.setAttribute("src", url);
      face.setAttribute("onclick", "clickListen('"+id+"')");
      pallette.appendChild(face);
    }
  }
  if(pop_net){
    var net = []
    for(let i = 1; i < 12; i++)
      net.push(document.getElementById("net-"+i.toString()));
    if(net[0].childElementCount != 0)
      for(let i = 0; i < 11; i++){
        for(let j =0; j < 11; j++){
          net[i].getElementsByClassName("net-item").item(0).remove();
        }
      }
    for(let i = 1; i < 12; i++){
      for(let j = 1; j < 12; j++){
        var face = document.createElement("img");
        var url = getFaceURL(net_view_array[i][j]);
        var id = "net_" + i.toString() + "_" + j.toString() + "_"
          + getFaceURL(net_view_array[i][j],true);
        face.setAttribute("id",id);
        face.setAttribute("class","net-item");
        face.setAttribute("src", url);
        face.setAttribute("onclick", "clickListen('"+id+"')");
        net[i-1].appendChild(face);
      }
    }
  }
}

function updateNetView(){
  if(document.getElementsByClassName("pallette-item").length
    != pallette_array.length && pallette_array.length != 0
  ){
    repopulateNetView(true);
  }
  else{
    if(pallette_array.length == 0){
      var url = getFaceURL("blank");
      var id = "pallette_" + getFaceURL("blank",true);
      pallette = document.getElementsByClassName("pallette-item").item(0);
      pallette.setAttribute("id",id);
      pallette.setAttribute("class","pallette-item");
      pallette.setAttribute("src",url);
      pallette.setAttribute("onclick", "");
    }
    else{
      var pallette = [];
      var pallette_count =
        document.getElementsByClassName("pallette-item").length;
      for(let i = 0; i < pallette_count; i++){
        pallette.push(document.getElementsByClassName("pallette-item").item(i));
      }
      for(let i = 0; i < pallette_array.length; i++){
        var url = getFaceURL(pallette_array[i]);
        var id = "pallette_" + getFaceURL(pallette_array[i],true);
        pallette[i].setAttribute("id",id);
        pallette[i].setAttribute("class","pallette-item");
        pallette[i].setAttribute("src", url);
        pallette[i].setAttribute("onclick", "clickListen('"+id+"')");
      }
    }
  }
  var net = []
  var net_count = document.getElementsByClassName("net-item").length;
  for(let i = 0; i < net_count; i++)
    net.push(document.getElementsByClassName("net-item").item(i));
  for(let i = 1; i < 12; i++){
    for(let j = 1; j < 12; j++){
      var url = getFaceURL(net_view_array[i][j]);
      var id = "net_" + i.toString() + "_" + j.toString() + "_"
        + getFaceURL(net_view_array[i][j],true);
      net[(i-1)*11+j-1].setAttribute("id",id);
      net[(i-1)*11+j-1].setAttribute("class","net-item");
      net[(i-1)*11+j-1].setAttribute("src", url);
      net[(i-1)*11+j-1].setAttribute("onclick", "clickListen('"+id+"')");
    }
  }
}

function copyOf(array){return JSON.parse(JSON.stringify(array));}

function isNet(inMatrix){
  let result = false;
  let matrix_string = matrixToString(inMatrix);
  for(let i = 0; i < net_lookup.length; i++){
    if(matrix_string == net_lookup[i]){
      result = true;
      break;
    }
  }
  return result;
}
function matrixToString(inMatrix, crop = true){
  function matrixSimplify(inMatrix){
    outMatrix = [];
    for(let i = 0; i < inMatrix.length; i++){
      outMatrix.push([]);
      for(let j = 0; j < inMatrix[0].length; j++){
        if(inMatrix[i][j] == 0) outMatrix[i].push(0);
        else outMatrix[i].push(1)
      }
    }
    return outMatrix;
  }
  simpleMatrix = matrixSimplify(inMatrix);
  if(crop) simpleMatrix = matrixCrop(simpleMatrix);
  outString = "";
  for(let i = 0; i < simpleMatrix.length; i++){
    for(let j = 0; j <simpleMatrix[0].length; j++){
      if(simpleMatrix[i][j] == 0) outString = outString +
        numLettRot_lookup[i];
      else outString = outString + 'X';
    }
  }
  return outString;
}

function matrixCrop(inMatrix){
  outMatrix = [];
  let nBlkRow = [];
  let nBlkCol = [];
  let numRow = inMatrix.length;
  let numCol = inMatrix[0].length;
  for(let i = 0; i < numRow; i++){   //Check for non-blank rows
    var j;
    for(j = 0; j < numCol; j++){
      if(inMatrix[i][j] != 0) break;
    }
    if(j != numCol) nBlkRow.push(i);
  }
  for(let j = 0; j < numCol; j++){   //Check for non-blank colomns
    var i;
    for(i = 0; i < numRow; i++){
      if(inMatrix[i][j] != 0) break;
    }
    if(i != numRow) nBlkCol.push(j);
  }
  for(let i = nBlkRow[0]; i <= nBlkRow[nBlkRow.length-1]; i++){//Fill the outMatrix with the non-blank
    outMatrix.push([]);                                        //Rows and colomns of the inMatrix
    for(let j = nBlkCol[0]; j <= nBlkCol[nBlkCol.length-1]; j++){
      outMatrix[i-nBlkRow[0]].push(inMatrix[i][j]);
    }
  }
  return outMatrix;
}

function randomBackground(){
  let selection = Math.floor(Math.random()*5+1);
  let url = "url('assets/images/backgrounds/";
  switch(selection){
    case 1: url += "01"; break;
    case 2: url += "02"; break;
    case 3: url += "03"; break;
    case 4: url += "04"; break;
    case 5: url += "05"; break;
    case 6: url += "06"; break;
    case 7: url += "07"; break;
    case 8: url += "08"; break;
    case 9: url += "09"; break;
    case 10: url += "10"; break;
    case 11: url += "11"; break;
  }
  url += ".png') repeat scroll 50%"
  document.body.style.background = url;
}

function run_on_start(){
  randomBackground();
  pallette_array = copyOf(pallette_array_init);
  net_view_array = copyOf(blank_array);
  net_view_array[6][6] = 'X';
  cube_view_array = copyOf(blank_array);
  repopulateNetView(true,true);
  toggleSlider(false);
  fillImageStage();
}

run_on_start();
