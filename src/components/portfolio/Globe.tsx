import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshBasicMaterial,
  Color,
  Mesh,
  Group,
  InstancedMesh,
  Matrix4,
  Raycaster,
  Vector2,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  CanvasTexture,
} from "three";


type Rgba = { r: number; g: number; b: number; a: number };

function parseColorToRgba(input: string): Rgba {
  if (!input || input.trim() === "") return { r: 0, g: 0, b: 0, a: 0 };
  const str = input.trim();
  const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (m) {
    return {
      r: Math.max(0, Math.min(255, parseFloat(m[1]!))) / 255,
      g: Math.max(0, Math.min(255, parseFloat(m[2]!))) / 255,
      b: Math.max(0, Math.min(255, parseFloat(m[3]!))) / 255,
      a: m[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(m[4]))) : 1,
    };
  }
  const hex = str.replace(/^#/, "");
  const at = (i: number, n = 2) =>
    parseInt(n === 2 ? hex.slice(i, i + 2) : hex[i]! + hex[i]!, 16) / 255;
  if (hex.length === 8) return { r: at(0), g: at(2), b: at(4), a: at(6) };
  if (hex.length === 6) return { r: at(0), g: at(2), b: at(4), a: 1 };
  if (hex.length === 4) return { r: at(0, 1), g: at(1, 1), b: at(2, 1), a: at(3, 1) };
  if (hex.length === 3) return { r: at(0, 1), g: at(1, 1), b: at(2, 1), a: 1 };
  return { r: 0, g: 0, b: 0, a: 1 };
}

function mapLinear(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin;
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function simplifyRing(ring: number[][], detail: number): number[][] {
  if (ring.length < 2 || detail >= 10) return ring;
  const stepSize = Math.max(1, Math.floor(mapLinear(clamp(detail, 1, 10), 1, 10, 10, 1)));
  const out: number[][] = [ring[0]!];
  for (let i = stepSize; i < ring.length - 1; i += stepSize) {
    out.push(ring[Math.min(i, ring.length - 1)]!);
  }
  const last = ring[ring.length - 1]!;
  const first = ring[0]!;
  if (Math.abs(last[0]! - first[0]!) > 1e-4 || Math.abs(last[1]! - first[1]!) > 1e-4) {
    out.push(last);
  }
  return out.length >= 2 ? out : ring;
}

function latLngToPosition(lat: number, lng: number) {
  const la = lat * (Math.PI / 180);
  const lo = lng * (Math.PI / 180);
  return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
}

interface Marker {
  lat: number;
  lng: number;
}

interface GlobeProps {
  speed?: number;
  smoothing?: number;
  dots?: { color: string; size: number; density: number; allDots: boolean };
  fill?: "dots" | "solid";
  fillColor?: string;
  scale?: number;
  stopOnHover?: boolean;
  markerConfig?: { markers: Marker[]; color: string; size: number };
  direction?: "left" | "right";
  initialLatitude?: number;
  initialLongitude?: number;
  oceanColor?: string;
  outlineColor?: string;
  showOutline?: boolean;
  graticuleColor?: string;
  showGrid?: boolean;
  outlineWidth?: number;
  dragSpeed?: number;
  detail?: number;
  style?: CSSProperties;
}

export default function Globe({
  speed = 2,
  smoothing = 8,
  dots = { color: "#ffffff", size: 5, density: 8, allDots: false },
  fill = "dots",
  fillColor = "#ffffff",
  scale = 8,
  stopOnHover = true,
  markerConfig = { markers: [], color: "#00f7ff", size: 40 },
  direction = "left",
  initialLatitude = 23,
  initialLongitude = -23,
  oceanColor = "#000000",
  outlineColor = "#ffffff",
  showOutline = true,
  graticuleColor = "#D4D4D4",
  showGrid = true,
  outlineWidth = 1,
  dragSpeed = 5,
  detail = 5,
  style,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const dotColor = dots.color;
  const gridWidth = 1;
  const smoothingN = clamp(smoothing / 10, 0, 1);
  const baseRotationSpeed = speed === 0 ? 0 : mapLinear(clamp(speed, 0, 10), 0, 10, 0, 0.9);
  const rotationSpeed = direction === "left" ? -baseRotationSpeed : baseRotationSpeed;
  const dotSpacing = mapLinear(clamp(dots.density, 1, 10), 1, 10, 24, 8);
  const dotSizeMultiplier = mapLinear(clamp(dots.size, 1, 10), 1, 10, 0.1, 0.5);
  const markerRadiusMultiplier = mapLinear(clamp(markerConfig.size, 0, 100), 0, 100, 0.1, 2.5);
  const scaleMultiplier = mapLinear(clamp(scale, 1, 20), 1, 20, 0.2, 2);
  const allDots = dots.allDots;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth || 800;
    const containerHeight = container.clientHeight || 600;

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, containerWidth / containerHeight, 0.1, 1e3);
    const globeRadius = scaleMultiplier;
    camera.position.set(0, 0, 2.5 / scaleMultiplier);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = "srgb";
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 900ms ease";
    container.appendChild(canvas);

    const oceanRgba = parseColorToRgba(oceanColor);
    const outlineRgba = parseColorToRgba(outlineColor);
    const dotRgba = parseColorToRgba(dotColor);
    const graticuleRgba = parseColorToRgba(graticuleColor);
    const fillRgba = parseColorToRgba(fillColor);

    const oceanMesh = new Mesh(
      new SphereGeometry(globeRadius, 64, 64),
      new MeshBasicMaterial({
        color: oceanColor ? new Color(oceanColor) : new Color(0, 0, 0),
        transparent: oceanRgba.a < 1,
        opacity: oceanRgba.a,
      }),
    );

    const continentOutlineGroup = new Group();
    const graticuleGroup = new Group();

    const tubeFrom = (points: Vector3[], width: number, material: MeshBasicMaterial) => {
      if (points.length < 2) return null;
      const curve = new CatmullRomCurve3(points);
      const geo = new TubeGeometry(curve, points.length * 2, (width / 10) * 0.01, 8, false);
      const mesh = new Mesh(geo, material);
      mesh.renderOrder = 0;
      return mesh;
    };

    if (showGrid && graticuleColor && graticuleRgba.a > 0) {
      const graticuleMaterial = new MeshBasicMaterial({
        color: new Color(graticuleColor),
        transparent: graticuleRgba.a < 1,
        opacity: graticuleRgba.a,
      });
      const gridSpacing = 15;
      const build = (isLat: boolean, value: number) => {
        const points: Vector3[] = [];
        for (let i = 0; i <= 64; i++) {
          const t = i / 64;
          const lat = isLat ? value : t * 180 - 90;
          const lng = isLat ? t * 360 - 180 : value;
          const p = latLngToPosition(lat, lng);
          points.push(new Vector3(p.x * globeRadius, p.y * globeRadius, p.z * globeRadius));
        }
        const m = tubeFrom(points, gridWidth, graticuleMaterial);
        if (m) graticuleGroup.add(m);
      };
      for (let lat = -90; lat <= 90; lat += gridSpacing) build(true, lat);
      for (let lng = -180; lng < 180; lng += gridSpacing) build(false, lng);
    }

    const rotation = {
      x: (initialLongitude * Math.PI) / 180,
      y: (initialLatitude * Math.PI) / 180,
    };
    const targetRotation = { x: rotation.x, y: rotation.y };
    const velocity = { x: 0, y: 0 };
    let isDragging = false;
    let isHovering = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let animationFrameId: number | null = null;
    const lerpFactor = smoothingN === 0 ? 1 : mapLinear(smoothingN, 0, 1, 0.4, 0.03);
    const velocityDecay = mapLinear(smoothingN, 0, 1, 0.7, 0.96);

    const globeGroup = new Group();
    globeGroup.rotation.y = rotation.x;
    globeGroup.rotation.x = rotation.y;
    scene.add(globeGroup);
    globeGroup.add(oceanMesh);
    if (showGrid && graticuleRgba.a > 0) globeGroup.add(graticuleGroup);
    globeGroup.add(continentOutlineGroup);

    let markerMeshes: Mesh[] = [];
    const updateMarkers = () => {
      markerMeshes.forEach((m) => globeGroup.remove(m));
      markerMeshes = [];
      if (!markerConfig.markers?.length) return;
      const markerGeometry = new SphereGeometry(0.01 * markerRadiusMultiplier, 16, 16);
      const markerMaterial = new MeshBasicMaterial({ color: new Color(markerConfig.color) });
      markerConfig.markers.forEach((marker) => {
        if (typeof marker?.lat !== "number" || typeof marker?.lng !== "number") return;
        const p = latLngToPosition(marker.lat, marker.lng);
        const mesh = new Mesh(markerGeometry, markerMaterial.clone());
        mesh.position.set(p.x * globeRadius, p.y * globeRadius, p.z * globeRadius);
        globeGroup.add(mesh);
        markerMeshes.push(mesh);
      });
    };

    let disposed = false;

    const loadWorldData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/50m/physical/ne_50m_land.json",
        );
        if (!response.ok) throw new Error("Failed to load land data");
        const landFeatures = await response.json();
        if (disposed) return;

        if (showOutline && outlineColor && outlineRgba.a > 0) {
          const outlineMaterial = new MeshBasicMaterial({
            color: new Color(outlineColor),
            transparent: outlineRgba.a < 1,
            opacity: outlineRgba.a,
          });
          const processRing = (ring: number[][]) => {
            if (ring.length < 2) return;
            const points: Vector3[] = simplifyRing(ring, detail).map((c) => {
              const p = latLngToPosition(c[1]!, c[0]!);
              return new Vector3(p.x * globeRadius, p.y * globeRadius, p.z * globeRadius);
            });
            if (points.length < 2) return;
            if (points[0]!.distanceTo(points[points.length - 1]!) > 0.001) {
              points.push(points[0]!.clone());
            }
            const m = tubeFrom(points, outlineWidth, outlineMaterial);
            if (m) continentOutlineGroup.add(m);
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          landFeatures.features.forEach((feature: any) => {
            const g = feature.geometry;
            if (!g?.coordinates) return;
            if (g.type === "Polygon" && g.coordinates.length) processRing(g.coordinates[0]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            else if (g.type === "MultiPolygon")
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              g.coordinates.forEach((poly: any) => poly.length && processRing(poly[0]));
          });
        }

        const bitmapWidth = 2048;
        const bitmapHeight = 1024;
        const offscreen = document.createElement("canvas");
        offscreen.width = bitmapWidth;
        offscreen.height = bitmapHeight;
        const ctx = offscreen.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas not supported");
        // Plain equirectangular projection + manual GeoJSON path drawing
        // (avoids the d3-geo dependency entirely).
        const projectX = (lng: number) => ((lng + 180) / 360) * bitmapWidth;
        const projectY = (lat: number) => ((90 - lat) / 180) * bitmapHeight;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, bitmapWidth, bitmapHeight);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const traceRing = (ring: any) => {
          if (!ring?.length) return;
          ring.forEach((coord: [number, number], i: number) => {
            const x = projectX(coord[0]);
            const y = projectY(coord[1]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        landFeatures.features.forEach((f: any) => {
          const g = f?.geometry;
          if (!g?.coordinates) return;
          if (g.type === "Polygon") g.coordinates.forEach(traceRing);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          else if (g.type === "MultiPolygon")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            g.coordinates.forEach((poly: any) => poly.forEach(traceRing));
        });
        ctx.fill();

        const pixels = ctx.getImageData(0, 0, bitmapWidth, bitmapHeight).data;
        const isOnLand = (lng: number, lat: number) => {
          const x = Math.round(((lng + 180) / 360) * bitmapWidth) % bitmapWidth;
          const y = clamp(Math.round(((90 - lat) / 180) * bitmapHeight), 0, bitmapHeight - 1);
          return pixels[(y * bitmapWidth + x) * 4]! > 128;
        };

        if (fill === "solid") {
          const texW = 1024;
          const texH = 512;
          const fillCanvas = document.createElement("canvas");
          fillCanvas.width = texW;
          fillCanvas.height = texH;
          const fctx = fillCanvas.getContext("2d")!;
          const img = fctx.createImageData(texW, texH);
          const data = img.data;
          const fr = Math.round(fillRgba.r * 255);
          const fg = Math.round(fillRgba.g * 255);
          const fb = Math.round(fillRgba.b * 255);
          const fa = Math.round((fillRgba.a || 1) * 255);
          for (let ty = 0; ty < texH; ty++) {
            for (let tx = 0; tx < texW; tx++) {
              let lng = (tx / texW - 0.25) * 360;
              lng = ((((lng + 180) % 360) + 360) % 360) - 180;
              const lat = (ty / texH - 0.5) * 180;
              const idx = (ty * texW + tx) * 4;
              if (allDots || isOnLand(lng, lat)) {
                data[idx] = fr;
                data[idx + 1] = fg;
                data[idx + 2] = fb;
                data[idx + 3] = fa;
              } else {
                data[idx + 3] = 0;
              }
            }
          }
          fctx.putImageData(img, 0, 0);
          const fillTexture = new CanvasTexture(fillCanvas);
          fillTexture.flipY = false;
          fillTexture.needsUpdate = true;
          globeGroup.add(
            new Mesh(
              new SphereGeometry(globeRadius * 1.002, 64, 64),
              new MeshBasicMaterial({ map: fillTexture, transparent: true }),
            ),
          );
        } else {
          const dotCoordinates: number[][] = [];
          const baseStep = dotSpacing * 0.08;
          for (let lat = -90; lat <= 90; lat += baseStep) {
            const cosLat = Math.cos((Math.abs(lat) * Math.PI) / 180);
            const lngStep = cosLat > 0.01 ? baseStep / Math.max(0.3, cosLat) : 360;
            for (let lng = -180; lng < 180; lng += lngStep) {
              if (allDots || isOnLand(lng, lat)) dotCoordinates.push([lng, lat]);
            }
          }
          if (dotCoordinates.length) {
            const instanced = new InstancedMesh(
              new SphereGeometry(0.01 * dotSizeMultiplier, 4, 4),
              new MeshBasicMaterial({
                color: new Color(dotColor),
                transparent: dotRgba.a < 1,
                opacity: dotRgba.a,
              }),
              dotCoordinates.length,
            );
            const matrix = new Matrix4();
            dotCoordinates.forEach(([lng, lat], i) => {
              const p = latLngToPosition(lat!, lng!);
              matrix.makeScale(1, 1, 1);
              matrix.setPosition(p.x * globeRadius, p.y * globeRadius, p.z * globeRadius);
              instanced.setMatrixAt(i, matrix);
            });
            instanced.instanceMatrix.needsUpdate = true;
            globeGroup.add(instanced);
          }
        }

        updateMarkers();
        renderer.render(scene, camera);
        canvas.style.opacity = "1";
      } catch {
        setError("Failed to load land map data");
      }
    };

    const animate = () => {
      const threshold = 0.01;
      if (!isDragging && rotationSpeed !== 0 && (!stopOnHover || !isHovering)) {
        targetRotation.x += rotationSpeed * 0.01;
      }
      if (!isDragging && smoothingN > 0) {
        if (Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold) {
          targetRotation.x += velocity.x;
          targetRotation.y = clamp(targetRotation.y + velocity.y, -Math.PI / 2, Math.PI / 2);
          velocity.x *= velocityDecay;
          velocity.y *= velocityDecay;
        } else {
          velocity.x = 0;
          velocity.y = 0;
        }
      }
      const dx = targetRotation.x - rotation.x;
      const dy = targetRotation.y - rotation.y;
      rotation.x += dx * lerpFactor;
      rotation.y = clamp(rotation.y + dy * lerpFactor, -Math.PI / 2, Math.PI / 2);
      globeGroup.rotation.y = rotation.x;
      globeGroup.rotation.x = rotation.y;
      renderer.render(scene, camera);

      const keepGoing =
        isDragging ||
        rotationSpeed !== 0 ||
        Math.abs(velocity.x) > threshold ||
        Math.abs(velocity.y) > threshold ||
        Math.abs(dx) > threshold ||
        Math.abs(dy) > threshold;
      animationFrameId = keepGoing ? requestAnimationFrame(animate) : null;
    };

    const startAnimation = () => {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(animate);
    };
    if (rotationSpeed !== 0) startAnimation();

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      velocity.x = 0;
      velocity.y = 0;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      startAnimation();
      const sensitivity = mapLinear(clamp(dragSpeed, 0, 10), 0, 10, 0.001, 0.02);
      const onMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - lastMouseX;
        const dy = moveEvent.clientY - lastMouseY;
        targetRotation.x += dx * sensitivity;
        targetRotation.y = clamp(
          targetRotation.y + dy * sensitivity,
          -Math.PI / 2,
          Math.PI / 2,
        );
        velocity.x = dx * sensitivity * 0.3;
        velocity.y = dy * sensitivity * 0.3;
        lastMouseX = moveEvent.clientX;
        lastMouseY = moveEvent.clientY;
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        isDragging = false;
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };
    canvas.addEventListener("mousedown", handleMouseDown);

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      if (!stopOnHover) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      isHovering = raycaster.intersectObject(oceanMesh).length > 0;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      camera.position.set(0, 0, 2.5 / scaleMultiplier);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    loadWorldData();

    return () => {
      disposed = true;
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: CSSProperties = {
    ...style,
    position: "relative",
    width: "100%",
    height: "100%",
  };

  if (error) return <div style={containerStyle} />;
  return <div ref={containerRef} style={containerStyle} />;
}
