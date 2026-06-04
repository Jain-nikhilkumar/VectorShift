// edges/EditableEdge.js — TOTAL CONTROL EDITION
// - Multiple draggable bar-handles along the line
// - Click anywhere on the line to ADD a waypoint there
// - Hover any waypoint → X button to remove it
// - Smooth curve through ALL waypoints
// - Delete edge button stays at center
// - Bar rotates to match line direction at each waypoint

import { useCallback, useMemo, useState, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
} from 'reactflow';
import { useStore } from '../store';
import { X, Plus } from 'lucide-react';

const STROKE_DASH = {
  solid: '',
  dashed: '8 6',
  dotted: '2 4',
};

// =============================================================
// PATH MATH — Draws smooth curves through any number of waypoints
// =============================================================

function pathThroughPoints(points, type) {
  if (points.length < 2) return '';

  if (type === 'straight') {
    // Polyline
    return points.reduce(
      (acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`),
      ''
    );
  }

  if (type === 'step') {
    // Orthogonal step-line
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Horizontal then vertical
      path += ` L ${curr.x},${prev.y} L ${curr.x},${curr.y}`;
    }
    return path;
  }

  // Default: smooth curves (catmull-rom-style with quadratic Bezier)
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }
  // Build smooth curve: M start, Q ctrl1 mid1, T mid2, T mid3, ... T end
  let path = `M ${points[0].x},${points[0].y}`;
  // First Q from start through first waypoint
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    path += ` Q ${curr.x},${curr.y} ${midX},${midY}`;
  }
  // Final segment to last point
  const last = points[points.length - 1];
  path += ` T ${last.x},${last.y}`;
  return path;
}

// Distance from a point to a line segment (for finding closest segment)
function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    const dpx = px - ax;
    const dpy = py - ay;
    return Math.sqrt(dpx * dpx + dpy * dpy);
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = ax + t * dx;
  const closestY = ay + t * dy;
  const distX = px - closestX;
  const distY = py - closestY;
  return Math.sqrt(distX * distX + distY * distY);
}

// =============================================================
// COMPONENT
// =============================================================

export const EditableEdge = ({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style = {}, data = {}, selected, markerEnd,
}) => {
  const { project } = useReactFlow();
  const updateEdge = useStore((s) => s.updateEdge);
  const deleteEdge = useStore((s) => s.deleteEdge);

  const [draggingIdx, setDraggingIdx] = useState(-1);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [hoverPoint, setHoverPoint] = useState(null);   // {x, y} in flow coords, for showing "+" cursor
  const pathRef = useRef(null);

  const pathType = data?.pathType || 'smoothstep';
  const strokeStyle = data?.strokeStyle || 'solid';
  const waypoints = useMemo(() => data?.waypoints || [], [data?.waypoints]);

  // ----- PATH BUILDING -----
  // When user has added waypoints, draw a CUSTOM path through them.
  // When no waypoints, use React Flow's default path (looks cleanest).
  const allPoints = useMemo(
    () => [{ x: sourceX, y: sourceY }, ...waypoints, { x: targetX, y: targetY }],
    [sourceX, sourceY, targetX, targetY, waypoints]
  );

  const edgePath = useMemo(() => {
    if (waypoints.length > 0) {
      return pathThroughPoints(allPoints, pathType);
    }
    // No waypoints — use clean default paths
    if (pathType === 'straight') {
      return getStraightPath({ sourceX, sourceY, targetX, targetY })[0];
    }
    if (pathType === 'step') {
      return getSmoothStepPath({
        sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 0,
      })[0];
    }
    if (pathType === 'bezier') {
      return getBezierPath({
        sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
      })[0];
    }
    return getSmoothStepPath({
      sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    })[0];
  }, [waypoints, allPoints, pathType, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  // Center of the line (for delete button when no waypoints)
  const lineCenter = useMemo(() => {
    if (waypoints.length === 0) {
      return { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 };
    }
    return waypoints[Math.floor(waypoints.length / 2)];
  }, [waypoints, sourceX, sourceY, targetX, targetY]);

  // ----- DRAG WAYPOINT -----
  const onWaypointDrag = useCallback(
    (e, idx) => {
      e.stopPropagation();
      e.preventDefault();
      setDraggingIdx(idx);

      const startFlow = project({ x: e.clientX, y: e.clientY });
      const startPoint = { ...waypoints[idx] };

      const onMove = (ev) => {
        const currFlow = project({ x: ev.clientX, y: ev.clientY });
        const dx = currFlow.x - startFlow.x;
        const dy = currFlow.y - startFlow.y;
        const newWaypoints = waypoints.map((w, i) =>
          i === idx ? { x: startPoint.x + dx, y: startPoint.y + dy } : w
        );
        updateEdge(id, { data: { ...data, waypoints: newWaypoints } });
      };

      const onUp = () => {
        setDraggingIdx(-1);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [id, data, waypoints, updateEdge, project]
  );

  // ----- ADD WAYPOINT BY CLICKING ON LINE -----
  const onLineClick = useCallback(
    (e) => {
      if (!selected) return;
      const flowPos = project({ x: e.clientX, y: e.clientY });

      // Find closest segment in the polyline (source → wps → target)
      let closestIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < allPoints.length - 1; i++) {
        const d = distanceToSegment(
          flowPos.x, flowPos.y,
          allPoints[i].x, allPoints[i].y,
          allPoints[i + 1].x, allPoints[i + 1].y
        );
        if (d < minDist) {
          minDist = d;
          closestIdx = i;
        }
      }
      // closestIdx is the segment index; the new waypoint is inserted between i and i+1.
      // That means in the waypoints array (which doesn't include source/target), insert at index `closestIdx`.
      const newWaypoints = [
        ...waypoints.slice(0, closestIdx),
        { x: flowPos.x, y: flowPos.y },
        ...waypoints.slice(closestIdx),
      ];
      updateEdge(id, { data: { ...data, waypoints: newWaypoints } });
    },
    [id, data, waypoints, allPoints, selected, project, updateEdge]
  );

  // ----- REMOVE WAYPOINT -----
  const removeWaypoint = useCallback(
    (idx) => {
      const newWaypoints = waypoints.filter((_, i) => i !== idx);
      updateEdge(id, { data: { ...data, waypoints: newWaypoints } });
    },
    [id, data, waypoints, updateEdge]
  );

  // ----- HOVER LINE TO SHOW + ICON -----
  const onLineMouseMove = useCallback(
    (e) => {
      if (!selected || draggingIdx !== -1) return;
      const flowPos = project({ x: e.clientX, y: e.clientY });
      setHoverPoint(flowPos);
    },
    [selected, draggingIdx, project]
  );

  const finalStyle = {
    ...style,
    strokeDasharray: STROKE_DASH[strokeStyle] || '',
  };

  const edgeColor = style.stroke || '#6366f1';

  // Bar angle calculation — based on adjacent points in the path
  const getBarAngle = (idx) => {
    // Get the points BEFORE and AFTER this waypoint in the overall path
    const before = idx === 0 ? { x: sourceX, y: sourceY } : waypoints[idx - 1];
    const after = idx === waypoints.length - 1 ? { x: targetX, y: targetY } : waypoints[idx + 1];
    return (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={finalStyle} markerEnd={markerEnd} />

      {/* Invisible hit area for clicking + hover */}
      <path
        ref={pathRef}
        d={edgePath}
        stroke="transparent"
        strokeWidth={24}
        fill="none"
        style={{ cursor: selected ? 'copy' : 'pointer' }}
        onMouseMove={onLineMouseMove}
        onMouseLeave={() => setHoverPoint(null)}
        onClick={(e) => {
          if (selected) onLineClick(e);
        }}
      />

      <EdgeLabelRenderer>
        {/* Edge label */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${lineCenter.x}px, ${lineCenter.y - 24}px)`,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              pointerEvents: 'all',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        )}

        {/* Floating "+" cursor while hovering over edge */}
        {selected && hoverPoint && draggingIdx === -1 && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${hoverPoint.x}px, ${hoverPoint.y}px)`,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: edgeColor,
              color: 'white',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              opacity: 0.85,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 999,
            }}
          >
            <Plus size={12} strokeWidth={3} />
          </div>
        )}

        {selected && (
          <>
            {/* Waypoint bars — one per waypoint, draggable */}
            {waypoints.map((wp, idx) => {
              const isDragging = draggingIdx === idx;
              const isHovered = hoveredIdx === idx;
              const angle = getBarAngle(idx);
              return (
                <div key={`wp-${idx}`}>
                  {/* The bar */}
                  <div
                    onMouseDown={(e) => onWaypointDrag(e, idx)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(-1)}
                    className="nodrag nopan"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      transform: `translate(-50%, -50%) translate(${wp.x}px, ${wp.y}px) rotate(${angle}deg)`,
                      width: isDragging ? 44 : isHovered ? 40 : 32,
                      height: isDragging ? 14 : isHovered ? 12 : 10,
                      borderRadius: 7,
                      background: edgeColor,
                      border: '2.5px solid white',
                      boxShadow: isDragging
                        ? `0 4px 14px ${edgeColor}80, 0 0 0 4px ${edgeColor}30`
                        : '0 2px 6px rgba(0,0,0,0.25)',
                      cursor: isDragging ? 'grabbing' : 'grab',
                      pointerEvents: 'all',
                      zIndex: 1000,
                      transition: isDragging ? 'none' : 'all 0.12s ease',
                    }}
                    title="Drag to move • Click X to remove"
                  >
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      pointerEvents: 'none',
                    }}>
                      <span style={gripDot} />
                      <span style={gripDot} />
                      <span style={gripDot} />
                    </div>
                  </div>

                  {/* X button to remove waypoint (only on hover, not while dragging) */}
                  {isHovered && !isDragging && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWaypoint(idx);
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      className="nodrag nopan"
                      style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${wp.x + 18}px, ${wp.y - 18}px)`,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'var(--danger)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                        pointerEvents: 'all',
                        zIndex: 1002,
                        border: '2px solid white',
                      }}
                      title="Remove waypoint"
                    >
                      <X size={9} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Master delete button — at the geometric center of the line */}
            {draggingIdx === -1 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  deleteEdge(id);
                }}
                className="nodrag nopan"
                style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) translate(${lineCenter.x}px, ${
                    lineCenter.y - (waypoints.length > 0 ? 32 : 26)
                  }px)`,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                  pointerEvents: 'all',
                  zIndex: 1003,
                  border: '2px solid white',
                }}
                title="Delete entire edge"
              >
                <X size={14} strokeWidth={3} />
              </div>
            )}
          </>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

const gripDot = {
  width: 2,
  height: 2,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.85)',
};
