"use client"

import React, { useEffect, useRef } from 'react';

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = -Math.random() * 3 - 1;
    this.life = 100;
    this.initialSize = this.size;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
    this.size = Math.max(0, this.initialSize * (this.life / 100));
  }
}

const SmokeCard = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update particles
      particlesRef.current = particlesRef.current
        .filter(particle => particle.life > 0 && particle.size > 0)
        .map(particle => {
          particle.update();
          
          // Draw particle
          if (particle.size > 0) {
            const opacity = (particle.life / 100) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          return particle;
        });

      // Add new particles near mouse position
      if (mousePosRef.current.x !== 0 && mousePosRef.current.y !== 0) {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(
            new Particle(
              mousePosRef.current.x + (Math.random() * 20 - 10),
              mousePosRef.current.y + (Math.random() * 20 - 10)
            )
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: 0, y: 0 };
  };

  return (
    <div 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none', 
        overflow: 'hidden' 
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'auto',
          display: 'block' 
        }}
      />
    </div>
  );
};

export { SmokeCard }; 
