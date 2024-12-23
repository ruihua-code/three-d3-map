import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);

outlinePass.visibleEdgeColor.set(0xff0000); // 可见边缘颜色
outlinePass.hiddenEdgeColor.set(0xffffff); // 隐藏边缘颜色
outlinePass.edgeStrength = 5; // 边缘强度
outlinePass.edgeThickness = 1; // 边缘厚度
