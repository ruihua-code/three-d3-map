import * as THREE from 'three';
import { gsap } from 'gsap';

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let highlightedObject = null;
let lineHighlight = null;
let canvas = null;

function onMouseClick(event) {
  mouse.x = (event.clientX / canvas.width) * 2 - 1;
  mouse.y = -(event.clientY / canvas.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    const line = object.parent.children[1];

    // 如果有新的对象被选中并且不是当前高亮的对象
    if (object !== highlightedObject && object.name !== 'bg') {
      // 如果之前有高亮的对象，则恢复它的颜色
      if (highlightedObject) {
        highlightedObject.material.color.set(highlightedObject.currentHex);
        gsap.to(highlightedObject.position, { z: 0, duration: 0.2 });
        gsap.to(lineHighlight.position, { z: 0, duration: 0.2 });
      }

      // 记录当前对象的颜色
      object.currentHex = object.material.color.getHex();
      gsap.to(object.position, { z: 0.03, duration: 0.2 });
      gsap.to(line.position, { z: 0.03, duration: 0.2 });

      // 设置新对象为高亮状态
      object.material.color.set(0x319691); // 绿色

      highlightedObject = object;
      lineHighlight = line;
    } else if (object.name === 'bg') {
      console.log('aaaa');
      if (highlightedObject) {
        highlightedObject.material.color.set(highlightedObject.currentHex);
        gsap.to(highlightedObject.position, { z: 0, duration: 0.2 });
        highlightedObject = null;
      }
      if (lineHighlight) {
        gsap.to(lineHighlight.position, { z: 0, duration: 0.2 });
        lineHighlight = null;
      }
    }
  } else if (highlightedObject) {
    // 如果没有物体被选中且存在高亮的对象，则恢复其颜色
    highlightedObject.material.color.set(highlightedObject.currentHex);
    gsap.to(lineHighlight.position, { z: 0, duration: 0.2 });
    gsap.to(highlightedObject.position, { z: 0, duration: 0.2 });
    highlightedObject = null;
    lineHighlight = null;
  }

  renderer.render(scene, camera);
}

function addEvent() {
  canvas = document.getElementsByTagName('canvas')[0];
  canvas.addEventListener('mousemove', onMouseClick, false);
}

export default addEvent;
