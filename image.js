import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const BACKGROUND_COLOR = '#1d1d1d';
let scene, camera, control;
function initScene() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  scene = new THREE.Scene();
  window.scene = scene;
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  window.renderer = renderer;
  renderer.setClearColor(BACKGROUND_COLOR, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);

  document.body.appendChild(renderer.domElement);
  camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 10000);
  camera.position.set(0, 0, 10);
  camera.lookAt(scene.position);
  window.camera = camera;

  control = new OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  control.update();
  renderer.render(scene, camera);
}

function addGeo() {
  const shape = new THREE.Shape();
  const linePoints = [];

  const points = [
    { x: 1, y: 0 },
    { x: 10, y: 0 },
    { x: 1, y: 5 },
    { x: 1, y: 5 },
  ];

  points.forEach((point, index) => {
    if (index === 0) {
      shape.moveTo(point.x, -point.y);
    }
    shape.lineTo(point.x, -point.y);
    linePoints.push(new THREE.Vector3(point.x, -point.y, 0.1));
  });

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 5,
    bevelEnabled: false,
  });

  //   const material = new THREE.MeshBasicMaterial({
  //     color: 0xff0000,
  //     transparent: true,
  //     opacity: 1,
  //   });

  var load = new THREE.TextureLoader();
  const texture = load.load('./images/test.png');
  console.log('加载图片完成:', texture);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  //   texture.repeat.set(1, 1); // 根据需要调整重复次数
  //   texture.offset.set(0, 0); // 居中偏移
  texture.center.set(0.5, 0.5);
  // 旋转-90度
  texture.rotation = -Math.PI / 2;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    // side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

initScene();
addGeo();
animate();
