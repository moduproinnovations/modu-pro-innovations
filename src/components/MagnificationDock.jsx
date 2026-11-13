import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import React, { Children, cloneElement, useEffect, useRef, useState } from 'react';

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: prefersReducedMotion ? baseItemSize : size,
        height: prefersReducedMotion ? baseItemSize : size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`relative inline-flex items-center justify-center rounded-full cursor-pointer text-[#F4EEDF] ${className}`}
      tabIndex={0}
      role="button"
      aria-label={typeof label === 'string' ? label : undefined}
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(child, { isHovered })
          : child
      )}
    </motion.div>
  );
}

function DockLabel({ children, isHovered }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return undefined;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18 }}
          className="absolute top-full left-1/2 z-20 mt-3 w-fit whitespace-pre rounded-full bg-[#F4EEDF] border border-[#D9C08B]/45 px-2.5 py-1 text-[11px] font-medium text-[#0A1428]"
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children }) {
  return <div className="flex items-center justify-center text-current">{children}</div>;
}

export default function MagnificationDock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 140,
  panelHeight = 64,
  baseItemSize = 50,
}) {
  const mouseX = useMotionValue(Infinity);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex max-w-full items-start justify-center" style={{ height: panelHeight }}>
      <motion.div
        onMouseMove={(event) => {
          mouseX.set(event.clientX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={`${className} flex w-fit items-start gap-2.5 rounded-full bg-[#16294D]/80 border border-[#D9C08B]/28 px-3 pt-2 backdrop-blur-xl`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Main navigation"
      >
        {items.map((item) => (
          <DockItem
            key={item.label}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={prefersReducedMotion ? baseItemSize : magnification}
            baseItemSize={baseItemSize}
            label={item.label}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </div>
  );
}
