'use client';

import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

interface RoomData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  occupant: string;
  alert?: boolean;
}

// 예시 방 정보 (실제 프로젝트에서는 서버나 실시간 데이터에서 받아옴)
const mockRooms: RoomData[] = [
  { id: 'R1', x: 50,  y: 50,  width: 100, height: 80, label: 'Room 101', occupant: 'Patient1', alert: false },
  { id: 'R2', x: 180, y: 50,  width: 100, height: 80, label: 'Room 102', occupant: 'Patient2', alert: false },
  { id: 'R3', x: 310, y: 50,  width: 100, height: 80, label: 'Room 103', occupant: 'Patient3', alert: true },
  { id: 'R4', x: 50,  y: 160, width: 100, height: 80, label: 'Room 104', occupant: 'Patient4', alert: false },
  { id: 'R5', x: 180, y: 160, width: 100, height: 80, label: 'Room 105', occupant: 'Patient5', alert: false },
  { id: 'R6', x: 310, y: 160, width: 100, height: 80, label: 'Room 106', occupant: 'Patient6', alert: false },
];

const FloorPlan: React.FC = () => {
  // 캔버스 크기
  const stageWidth = 800;
  const stageHeight = 600;

  return (
    <div style={{ border: '1px solid #ccc', display: 'inline-block' }}>
      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          {/* 배경 또는 복도 표시용 */}
          <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill="#f5f5f5"
          />

          {/* 방(Room) 렌더링 */}
          {mockRooms.map((room) => {
            // 방이 Alert 상태라면 빨간색 계열로 표시, 아니면 흰색
            const fillColor = room.alert ? '#ffe5e5' : '#ffffff';
            const strokeColor = room.alert ? '#ff6b6b' : '#999999';

            return (
              <React.Fragment key={room.id}>
                {/* 방 영역 */}
                <Rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  cornerRadius={4}
                />
                {/* 방 이름(레이블) */}
                <Text
                  x={room.x + 5}
                  y={room.y + 5}
                  text={room.label}
                  fontSize={14}
                  fontStyle="bold"
                  fill="#333"
                />
                {/* Occupant 정보 */}
                <Text
                  x={room.x + 5}
                  y={room.y + 25}
                  text={`Occupant: ${room.occupant}`}
                  fontSize={12}
                  fill="#555"
                />
                {/* Alert 상태일 때 표시할 경고 아이콘/메시지 등 */}
                {room.alert && (
                  <Text
                    x={room.x + 5}
                    y={room.y + 45}
                    text="ALERT!"
                    fontSize={12}
                    fontStyle="bold"
                    fill="#ff0000"
                  />
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default FloorPlan;