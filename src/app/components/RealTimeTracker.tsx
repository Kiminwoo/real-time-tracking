'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type MovingCircle = {
  mesh: THREE.Mesh;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
};

const NUM_CIRCLES = 20;
const FLOOR_WIDTH = 30;
const FLOOR_HEIGHT = 15;

const RealTimeTracker: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<MovingCircle[]>([]);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const [zoomLevel, setZoomLevel] = useState(20);

  // 드래그 상태 관련 변수
  const isDragging = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const floorGeometry = new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_HEIGHT);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(FLOOR_WIDTH, 10, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    const aspect = window.innerWidth / window.innerHeight;
    const dWidth = zoomLevel;
    const dHeight = (zoomLevel * FLOOR_HEIGHT) / FLOOR_WIDTH;
    const camera = new THREE.OrthographicCamera(-dWidth, dWidth, dHeight, -dHeight, 0.1, 1000);
    camera.position.set(0, 10, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const circleGeometry = new THREE.CircleGeometry(0.3, 32);
    const defaultMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (let i = 0; i < NUM_CIRCLES; i++) {
      const x = (Math.random() - 0.5) * FLOOR_WIDTH;
      const z = (Math.random() - 0.5) * FLOOR_HEIGHT;
      const currentPos = new THREE.Vector3(x, 0.01, z);
      const tx = (Math.random() - 0.5) * FLOOR_WIDTH;
      const tz = (Math.random() - 0.5) * FLOOR_HEIGHT;
      const targetPos = new THREE.Vector3(tx, 0.01, tz);

      const circle = new THREE.Mesh(circleGeometry, defaultMaterial.clone());
      circle.position.copy(currentPos);
      circle.rotation.x = -Math.PI / 2;
      scene.add(circle);

      circlesRef.current.push({ mesh: circle, currentPos, targetPos });
    }

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const lerpFactor = delta * 0.5;

      circlesRef.current.forEach((obj) => {
        obj.currentPos.lerp(obj.targetPos, lerpFactor);
        obj.mesh.position.copy(obj.currentPos);

        if (obj.currentPos.distanceTo(obj.targetPos) < 0.05) {
          const newTx = (Math.random() - 0.5) * FLOOR_WIDTH;
          const newTz = (Math.random() - 0.5) * FLOOR_HEIGHT;
          obj.targetPos.set(newTx, 0.01, newTz);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const onClick = (event: MouseEvent) => {
      if (!mountRef.current) return;

      const { left, top, width, height } = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - left) / width) * 2 - 1;
      mouse.y = -((event.clientY - top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(circlesRef.current.map(obj => obj.mesh));

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        clickedMesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        toast.success('🟢 작업자/장비 클릭됨!', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          clickedMesh.material = defaultMaterial.clone();
        }, 2000);
      }
    };

    // 🟢 마우스 드래그 이벤트 추가
    const onMouseDown = (event: MouseEvent) => {
      isDragging.current = true;
      lastMousePos.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;

      const deltaX = (event.clientX - lastMousePos.current.x) * 0.05;
      const deltaY = (event.clientY - lastMousePos.current.y) * 0.05;

      cameraRef.current.position.x -= deltaX;
      cameraRef.current.position.z += deltaY;

      lastMousePos.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('click', onClick);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [zoomLevel]);

  const zoomIn = () => setZoomLevel((prev) => Math.max(prev - 2, 5));
  const zoomOut = () => setZoomLevel((prev) => Math.min(prev + 2, 50));

  return (
    <>
      <div ref={mountRef} style={{ position: 'relative' }} />
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={zoomIn} style={{ margin: '5px', padding: '10px', fontSize: '16px' }}>+</button>
        <button onClick={zoomOut} style={{ margin: '5px', padding: '10px', fontSize: '16px' }}>-</button>
      </div>
      <ToastContainer />
    </>
  );
};

export default RealTimeTracker;