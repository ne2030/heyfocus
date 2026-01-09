import React from 'react';
import { APP_SIZE } from '../styles';

interface AppWindowProps {
  width?: number;
  height?: number;
  opacity?: number;
  isCompact?: boolean;
  isPinned?: boolean;
  isFocused?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AppWindow: React.FC<AppWindowProps> = ({
  width = APP_SIZE.width,
  height = APP_SIZE.height,
  opacity = 1,
  isCompact = false,
  isPinned = false,
  isFocused = true,
  children,
  style,
}) => {
  return (
    <div
      className="app"
      style={{
        width,
        height: isCompact ? 'auto' : height,
        border: isFocused
          ? '1.5px solid rgba(249, 115, 22, 0.5)'
          : '1.5px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isFocused
          ? '0 0 0 1px rgba(249, 115, 22, 0.2), 0 20px 50px rgba(0, 0, 0, 0.15)'
          : '0 20px 50px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Traffic Light Buttons (macOS style) */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 12,
          display: 'flex',
          gap: 8,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#ff5f57',
            border: '0.5px solid rgba(0,0,0,0.1)',
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#febc2e',
            border: '0.5px solid rgba(0,0,0,0.1)',
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#28c840',
            border: '0.5px solid rgba(0,0,0,0.1)',
          }}
        />
      </div>
      {children}
    </div>
  );
};
