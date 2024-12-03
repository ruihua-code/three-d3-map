import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import addEvent from './event.js';

const BACKGROUND_COLOR = '#1d1d1d';
let textFont = null;
async function fontLoader() {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load('fonts/Microsoft YaHei_Regular.json', (font) => {
      console.log('字体加载完成...');
      textFont = font;
      resolve();
    });
  });
}

await fontLoader();

var w = window.innerWidth;
var h = window.innerHeight;
var scene = new THREE.Scene();
window.scene = scene;
var renderer = new THREE.WebGLRenderer({
  antialias: true,
});
window.renderer = renderer;
renderer.setClearColor(BACKGROUND_COLOR, 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);

document.body.appendChild(renderer.domElement);
var camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 10000);
camera.position.set(0, 0, 10);
camera.lookAt(scene.position);
window.camera = camera;

var control = new OrbitControls(camera, renderer.domElement);

// 加载GeoJSON并解析
function loadGeoJSON(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => initMap(data))
    .catch((error) => console.error('Error loading geojson:', error));
}

loadGeoJSON('zhenzhou.geojson');

function animate() {
  requestAnimationFrame(animate);

  control.update();
  renderer.render(scene, camera);
}

animate();

function initMap(chinaJson) {
  // d3-geo转化坐标
  const projection = d3
    .geoMercator()
    .center([113.630301, 34.752792]) // 这个是坐标是显示城市的中心点，用来居中显示
    .scale(100)
    .translate([0, 0]);
  // 遍历省份构建模型
  chinaJson.features.forEach((elem) => {
    // 新建一个省份容器：用来存放省份对应的模型和轮廓线
    const province = new THREE.Object3D();
    const coordinates = elem.geometry.coordinates;
    coordinates.forEach((multiPolygon, index) => {
      multiPolygon.forEach((polygon) => {
        // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
        const shape = new THREE.Shape();
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const linePoints = [];
        for (let i = 0; i < polygon.length; i++) {
          const [x, y] = projection(polygon[i]);
          if (i === 0) {
            shape.moveTo(x, -y);
          }
          shape.lineTo(x, -y);
          linePoints.push(new THREE.Vector3(x, -y, 0.1));
        }

        const [x, y] = projection(elem.properties.center);

        console.log('index:', index, index % 2);
        const extrudeSettings = {
          depth: index % 2 === 0 ? 0.1 : 0.11,
          bevelEnabled: false,
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshBasicMaterial({
          color: randomColor(),
          transparent: true,
          opacity: 1,
        });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(
          linePoints
        );
        const mesh = new THREE.Mesh(geometry, material);
        const line = new THREE.Line(lineGeometry, lineMaterial);

        province.add(mesh);
        // 加上边框线条，鼠标事件无法定位到mesh对象
        province.add(line);
      });
    });
    // 将geojson的properties放到模型中，后面会用到
    province.properties = elem.properties;
    if (elem.properties.centroid) {
      const [x, y] = projection(elem.properties.centroid);
      province.properties._centroid = [x, y];

      const textGeo = new TextGeometry(elem.properties.name, {
        font: textFont,
        size: 0.02,
        depth: 0,
      });

      const textMesh = new THREE.Mesh(textGeo, materials);
      textMesh.position.set(x - 0.05, -y, 0.12);
      textMesh.rotateX(1);
      province.add(textMesh);
    }
    scene.add(province);
  });
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const materials = [
  new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
  new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
];

addEvent(renderer, scene, camera);
