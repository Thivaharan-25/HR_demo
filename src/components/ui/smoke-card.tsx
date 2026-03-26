"use client"

import React, { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  initialSize: number;

  constructor(x: number, y: number) {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

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
            const opacity = (particle.life / 100) * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          return particle;
        });

      // Add new particles near mouse position
      if (mousePosRef.current.x !== 0 && mousePosRef.current.y !== 0) {
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push(
            new Particle(
              mousePosRef.current.x + (Math.random() * 10 - 5),
              mousePosRef.current.y + (Math.random() * 10 - 5)
            )
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    <div className="absolute inset-0 z-[0] pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full pointer-events-auto"
      />
    </div>
  );
};

export { SmokeCard }; 
