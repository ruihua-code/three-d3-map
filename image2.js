import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const BACKGROUND_COLOR = '#a0a0a0';
let scene, camera, control;
function initScene() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xa0a0a0, 1, 500); //雾
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

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10);
  scene.add(light);
  control = new OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  control.update();
  renderer.render(scene, camera);
}

function addGeo() {
  // 1. 定义 Shape
  const shape = new THREE.Shape();
  const points = [
    { x: 1, y: 0 },
    { x: 40, y: 0 },
    { x: 1, y: 20 },
    { x: 1, y: 20 },
  ];

  points.forEach((point, index) => {
    if (index === 0) {
      shape.moveTo(point.x, -point.y);
    } else {
      shape.lineTo(point.x, -point.y);
    }
  });

  // 2. 创建 ExtrudeGeometry
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 2, // 挤出深度
    bevelEnabled: false, // 禁用倒角
  });

  // 3. 加载纹理
  const loader = new THREE.TextureLoader();
  const texture = loader.load('./images/test1.png');

  // 设置纹理参数
  texture.wrapS = THREE.ClampToEdgeWrapping; // X方向拉伸
  texture.wrapT = THREE.ClampToEdgeWrapping; // Y方向拉伸
  texture.repeat.set(1, 1); // 设置不重复

  // 4. 修复 UV 映射
  setUv(geometry);

  // 5. 设置材质
  const material = new THREE.MeshBasicMaterial({
    map: texture, // 应用纹理
  });

  // 5. 设置材质
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 侧面使用纯色
    new THREE.MeshBasicMaterial({ map: texture }), // 顶部面使用纹理
  ];

  // 6. 为几何体分配材质组
  geometry.groups = []; // 初始化为空数组

  geometry.addGroup(0, geometry.attributes.uv.count, 0); // 侧面：索引6到11（根据需要调整）
  geometry.addGroup(3, 5, 1); // 顶部面：索引3到5（根据需要调整）

  // 6. 创建 Mesh 并添加到场景
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.position.set(0, 0, 0);

  scene.add(mesh);
}

function setUv(geometry) {
  geometry.computeBoundingBox(); // 计算边界框

  const max = geometry.boundingBox.max;
  const min = geometry.boundingBox.min;

  const offset = new THREE.Vector2(-min.x, -min.y); // 偏移量
  const range = new THREE.Vector2(max.x - min.x, max.y - min.y); // 范围

  const uvAttribute = geometry.attributes.uv;

  for (let i = 0; i < uvAttribute.count; i++) {
    const uv = new THREE.Vector2(uvAttribute.getX(i), uvAttribute.getY(i));

    // 根据形状调整 UV 坐标
    uv.x = (uv.x - min.x) / range.x;
    uv.y = (uv.y - min.y) / range.y;

    uvAttribute.setXY(i, uv.x, uv.y);
  }
}

function addPlan() {
  const geometry = new THREE.PlaneGeometry(
    document.body.clientWidth,
    document.body.clientHeight
  );
  const load = new THREE.TextureLoader();
  const texture = load.load('./images/bg.png');

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
}

initScene();
addPlan();

addGeo();
animate();
